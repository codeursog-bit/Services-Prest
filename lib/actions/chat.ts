'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Envoyer un message chat (côté admin) ─────────────────────────────────────
export async function sendChatMessage(partnerId: string, content: string) {
  if (!content.trim() || !partnerId) return { success: false, error: 'Message vide.' };

  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Non authentifié.' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: 'Utilisateur introuvable.' };

    const msg = await prisma.chatMessage.create({
      data: { content, userId: user.id, partnerId, senderType: 'admin', isRead: false },
      include: { user: { select: { name: true } } },
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true, message: msg };
  } catch (error) {
    console.error('sendChatMessage error:', error);
    return { success: false, error: "Erreur lors de l'envoi." };
  }
}

// ── Envoyer un message chat (côté partenaire via token) ──────────────────────
export async function sendChatMessageAsPartner(token: string, content: string) {
  if (!content.trim() || !token) return { success: false, error: 'Message vide.' };

  try {
    const partner = await prisma.partner.findUnique({ where: { token } });
    if (!partner) return { success: false, error: 'Partenaire introuvable.' };

    const msg = await prisma.chatMessage.create({
      data: { content, partnerId: partner.id, senderType: 'partner', isRead: false },
    });

    // Notification in-app pour l'admin
    await prisma.notification.create({
      data: { content: `Nouveau message de ${partner.orgName}`, partnerId: partner.id },
    });

    // Email à l'admin si notifications activées
    if (partner.notifyAdmin && process.env.CONTACT_EMAIL) {
      await resend.emails.send({
        from: 'Melanie Services <noreply@melanieservices.com>',
        to: process.env.CONTACT_EMAIL,
        subject: `Nouveau message de ${partner.orgName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <p><strong>${partner.orgName}</strong> vous a envoyé un message :</p>
            <p style="background:#F7F7F6;padding:12px 16px;border-radius:6px;border-left:3px solid #1A3A5C;">${content}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/partners/${partner.id}?tab=chat" style="color:#1A3A5C;">Répondre</a></p>
          </div>
        `,
      });
    }

    return { success: true, message: msg };
  } catch (error) {
    console.error('sendChatMessageAsPartner error:', error);
    return { success: false, error: "Erreur lors de l'envoi." };
  }
}

// ── Récupérer les messages d'un chat ─────────────────────────────────────────
export async function getChatMessages(partnerId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true } } },
    });
    return { success: true, messages };
  } catch (error) {
    return { success: false, messages: [] };
  }
}

// ── Marquer messages comme lus (côté admin) ──────────────────────────────────
export async function markChatMessagesRead(partnerId: string) {
  try {
    await prisma.chatMessage.updateMany({
      where: { partnerId, senderType: 'partner', isRead: false },
      data: { isRead: true },
    });
    revalidatePath(`/dashboard/partners/${partnerId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ── Compter les messages non lus globaux ─────────────────────────────────────
export async function getUnreadChatCount() {
  try {
    const count = await prisma.chatMessage.count({
      where: { senderType: 'partner', isRead: false },
    });
    return count;
  } catch (error) {
    return 0;
  }
}