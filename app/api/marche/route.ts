import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/marche?partnerId=xxx   → marchés d'un partenaire
// GET /api/marche                 → tous les marchés (vue globale)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const partnerId = req.nextUrl.searchParams.get('partnerId');
  const status    = req.nextUrl.searchParams.get('status');

  try {
    const markets = await (prisma as any).market.findMany({
      where: {
        ...(partnerId ? { partnerId } : {}),
        ...(status    ? { status }    : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, orgName: true, type: true } },
        // @ts-ignore
        steps:   { orderBy: { order: 'asc' } },
        _count:  { select: { notes: true, contentieux: true } },
      },
    });

    return apiSuccess({ markets });
  } catch (err) {
    console.error('GET /api/marche:', err);
    return apiError('Erreur serveur', 500);
  }
}

// POST /api/marche — créer un nouveau marché
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const {
      partnerId, name, description,
      startDate, endDate, status,
    } = body;

    if (!partnerId || !name) return apiError('partnerId et name requis');

    const market = await (prisma as any).market.create({
      data: {
        partnerId,
        name,
        // @ts-ignore
        description:   description || null,
        startDate:     startDate   ? new Date(startDate) : null,
        endDate:       endDate     ? new Date(endDate)   : null,
        status:        status      || 'EN_COURS',
        executionRate: 0,
      },
      include: {
        partner: { select: { orgName: true } },
      },
    });

    await (prisma as any).notification.create({
      data: {
        content:   `Nouveau marché créé : "${name}"`,
        // @ts-ignore
        type:      'INFO',
        link:      `/dashboard/marche/${market.id}`,
        partnerId,
      },
    });

    return apiSuccess({ market }, 201);
  } catch (err) {
    console.error('POST /api/marche:', err);
    return apiError('Erreur serveur', 500);
  }
}
