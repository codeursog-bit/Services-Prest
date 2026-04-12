'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPartnerInfo(formData: FormData) {
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const partnerId = formData.get('partnerId') as string;
  const attachedDocId = formData.get('attachedDocId') as string | null;

  if (!subject || !message || !partnerId) {
    return { success: false, error: 'Champs requis manquants.' };
  }

  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Non authentifié.' };

    const [user, partner] = await Promise.all([
      prisma.user.findUnique({ where: { email: session.user.email } }),
      prisma.partner.findUnique({ where: { id: partnerId }, select: { email: true, orgName: true } })
    ]);

    if (!user || !partner) return { success: false, error: 'Données introuvables.' };

    // Enregistrement en DB
    await prisma.message.create({
      data: {
        subject,
        content: message,
        authorId: user.id,
        partnerId,
        attachedDocId: attachedDocId || null,
      }
    });

    // Notification DB
    await prisma.notification.create({
      data: {
        content: `Information transmise à ${partner.orgName} : "${subject}"`,
        partnerId,
      }
    });

    // Email au partenaire
    await resend.emails.send({
      from: 'Melanie Services <onboarding@resend.dev>',
      to: partner.email,
      subject: `${subject} — Melanie Services&Prest.`,
      html: `
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <br/>
        <hr style="border:none;border-top:1px solid #E8E7E4;margin:20px 0;"/>
        <p><strong>Melanie Services&Prest.</strong><br/><em>Votre partenaire idéal !</em></p>
      `
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath('/dashboard/messages');
    return { success: true };

  } catch (error) {
    console.error('sendPartnerInfo error:', error);
    return { success: false, error: "Erreur lors de l'envoi." };
  }
}