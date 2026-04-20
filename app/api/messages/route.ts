import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { sendMessageNotification } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/messages?partnerId=xxx   → messages d'un partenaire
// GET /api/messages                 → tous les messages (vue globale)
// GET /api/messages?direction=MSP_TO_PARTNER|PARTNER_TO_MSP
// GET /api/messages?unread=true     → messages non lus seulement
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');
  const direction = searchParams.get('direction');
  const unread    = searchParams.get('unread');

  try {
    const messages = await (prisma as any).message.findMany({
      where: {
        ...(partnerId ? { partnerId }                     : {}),
        ...(direction ? { direction }                     : {}),
        ...(unread === 'true' ? { isRead: false, direction: 'PARTNER_TO_MSP' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author:      { select: { id: true, name: true } },
        partner:     { select: { id: true, orgName: true, type: true } },
        attachedDoc: { select: { id: true, name: true, url: true, fileType: true } },
      },
    });

    // Compte des non lus (messages partenaires → MSP)
    const unreadCount = await prisma.message.count({
      where: {
        ...(partnerId ? { partnerId } : {}),
        direction: 'PARTNER_TO_MSP',
        isRead:    false,
      },
    });

    return apiSuccess({ messages, unreadCount });
  } catch (err) {
    console.error('GET /api/messages:', err);
    return apiError('Erreur serveur', 500);
  }
}

// POST /api/messages — admin envoie un message à un partenaire
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { subject, content, partnerId, attachedDocId } = body;

    if (!subject?.trim() || !content?.trim() || !partnerId) {
      return apiError('subject, content et partnerId requis');
    }

    // Récupérer l'auteur depuis la session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) return apiError('Utilisateur introuvable', 404);

    const partner = await prisma.partner.findUnique({
      where:  { id: partnerId },
      select: { email: true, orgName: true, token: true },
    });
    if (!partner) return apiError('Partenaire introuvable', 404);

    // Créer le message
    const message = await (prisma as any).message.create({
      data: {
        subject:      subject.trim(),
        content:      content.trim(),
        authorId:     user.id,
        partnerId,
        attachedDocId: attachedDocId || null,
        direction:    'MSP_TO_PARTNER',
        isRead:       false,
      },
      include: {
        author:      { select: { id: true, name: true } },
        attachedDoc: { select: { id: true, name: true, url: true, fileType: true } },
      },
    });

    // Notification in-app
    await (prisma as any).notification.create({
      data: {
        content:   `Information transmise à ${partner.orgName} : "${subject}"`,
        type:      'INFO',
        link:      `/dashboard/messages`,
        partnerId,
      },
    });

    // Email au partenaire
    const accessLink = `${process.env.NEXT_PUBLIC_APP_URL}/partner/${partner.token}`;
    await sendMessageNotification({
      to:          partner.email,
      subject:     subject.trim(),
      content:     content.trim(),
      accessLink,
    }).catch(console.error);

    return apiSuccess({ message }, 201);
  } catch (err) {
    console.error('POST /api/messages:', err);
    return apiError('Erreur serveur', 500);
  }
}
