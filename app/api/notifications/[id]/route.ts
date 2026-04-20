import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

// PUT /api/notifications/[id] — marquer comme lu
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const notif = await (prisma as any).notification.update({
      where: { id: params.id },
      data:  { isRead: true },
    });
    return apiSuccess({ notification: notif });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Notification introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await (prisma as any).notification.delete({ where: { id: params.id } });
    return apiSuccess({ message: 'Notification supprimée' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Notification introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
