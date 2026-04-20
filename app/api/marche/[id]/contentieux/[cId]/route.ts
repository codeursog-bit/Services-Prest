import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string; cId: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { status, resolution, subject, description } = body;

    const item = await (prisma as any).contentieux.update({
      where: { id: params.cId },
      data: {
        ...(status      !== undefined ? { status: status as any }           : {}),
        ...(resolution  !== undefined ? { resolution: resolution || null }  : {}),
        ...(subject     !== undefined ? { subject }                         : {}),
        ...(description !== undefined ? { description: description || null }: {}),
      },
    });

    // Si tous les contentieux du marché sont résolus, remettre EN_COURS
    if (status === 'RESOLU' || status === 'ABANDONNE') {
      const openCount = await (prisma as any).contentieux.count({
        where: { marketId: params.id, status: 'EN_COURS' },
      });
      if (openCount === 0) {
        await (prisma as any).market.update({
          where: { id: params.id },
          data:  { status: 'EN_COURS' },
        });
      }
    }

    return apiSuccess({ contentieux: item });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Contentieux introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await (prisma as any).contentieux.delete({ where: { id: params.cId } });
    return apiSuccess({ message: 'Contentieux supprimé' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Contentieux introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
