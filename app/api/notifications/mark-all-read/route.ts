import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

// POST /api/notifications/mark-all-read
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    await (prisma as any).notification.updateMany({
      where: {
        isRead: false,
        OR: [
          { userId: user?.id },
          { userId: null },
        ],
      },
      data: { isRead: true },
    });

    return apiSuccess({ marked: true });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}
