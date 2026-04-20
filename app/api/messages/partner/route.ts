import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMessageNotification } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

// POST — partenaire envoie un message à MSP (auth par token)
export async function POST(req: NextRequest) {
  try {
    const { token, subject, content } = await req.json();

    if (!token || !subject?.trim() || !content?.trim()) {
      return apiError('token, subject et content requis');
    }

    const partner = await prisma.partner.findUnique({
      where:  { token },
      select: { id: true, orgName: true, notifyAdmin: true, status: true },
    });

    if (!partner) return apiError('Token invalide', 403);
    if (partner.status === 'INACTIF') return apiError('Accès désactivé', 403);

    const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!admin) return apiError('Configuration manquante', 500);

    const message = await (prisma as any).message.create({
      data: {
        subject:   subject.trim(),
        content:   content.trim(),
        authorId:  admin.id,
        partnerId: partner.id,
        direction: 'PARTNER_TO_MSP',
        isRead:    false,
      },
    });

    await (prisma as any).notification.create({
      data: {
        content:   `Nouveau message de ${partner.orgName} : "${subject.trim()}"`,
        type:      'INFO',
        link:      '/dashboard/messages',
        partnerId: partner.id,
      },
    });

    if (partner.notifyAdmin && process.env.ADMIN_EMAIL) {
      await sendMessageNotification({
        to:         process.env.ADMIN_EMAIL,
        subject:    `[MSP] ${partner.orgName} : ${subject.trim()}`,
        content:    content.trim(),
        accessLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`,
      }).catch(console.error);
    }

    return apiSuccess({ sent: true, messageId: message.id });
  } catch (err) {
    console.error('POST /api/messages/partner:', err);
    return apiError('Erreur serveur', 500);
  }
}

// GET — messages reçus par le partenaire (polling depuis son espace)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return apiError('token requis');

  try {
    const partner = await prisma.partner.findUnique({
      where:  { token },
      select: { id: true, status: true },
    });
    if (!partner) return apiError('Token invalide', 403);
    if (partner.status === 'INACTIF') return apiError('Accès désactivé', 403);

    const messages = await prisma.message.findMany({
      where:   { partnerId: partner.id, direction: 'MSP_TO_PARTNER' },
      orderBy: { createdAt: 'asc' },
      include: { attachedDoc: { select: { id: true, name: true, url: true } } },
    });

    return apiSuccess({ messages });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}
