import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/notifications?limit=20  → notifications de l'admin connecté
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    const notifications = await (prisma as any).notification.findMany({
      where: {
        OR: [
          { userId: user?.id },
          { userId: null }, // notifications globales
        ],
      },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      include: {
        partner: { select: { id: true, orgName: true } },
      },
    });

    const unreadCount = await (prisma as any).notification.count({
      where: {
        isRead: false,
        OR: [
          { userId: user?.id },
          { userId: null },
        ],
      },
    });

    return apiSuccess({ notifications, unreadCount });
  } catch (err) {
    console.error('GET /api/notifications:', err);
    return apiError('Erreur serveur', 500);
  }
}
