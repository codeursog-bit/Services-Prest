import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const contentieux = await (prisma as any).contentieux.findMany({
      where:   { marketId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess({ contentieux });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { subject, description, openDate, status } = body;

    if (!subject || !openDate) return apiError('subject et openDate requis');

    const market = await (prisma as any).market.findUnique({
      where:  { id: params.id },
      select: { partnerId: true },
    });
    if (!market) return apiError('Marché introuvable', 404);

    const item = await (prisma as any).contentieux.create({
      data: {
        partnerId:   market.partnerId,
        marketId:    params.id,
        subject,
        description: description || null,
        openDate:    new Date(openDate),
        status:      (status || 'EN_COURS') as any,
      },
    });

    // Mettre le statut du marché en CONTENTIEUX si c'est le premier contentieux EN_COURS
    await (prisma as any).market.update({
      where: { id: params.id },
      data:  { status: 'CONTENTIEUX' },
    });

    return apiSuccess({ contentieux: item }, 201);
  } catch (err) {
    console.error('POST /api/marche/[id]/contentieux:', err);
    return apiError('Erreur serveur', 500);
  }
}
