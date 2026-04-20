import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

// GET /api/marche/[id]/notes?category=AUDIT|COMPTE_RENDU|AUTRE
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const category = req.nextUrl.searchParams.get('category');

  try {
    const market = await (prisma as any).market.findUnique({
      where: { id: params.id },
      select: { partnerId: true },
    });
    if (!market) return apiError('Marché introuvable', 404);

    const notes = await (prisma as any).marketNote.findMany({
      where: {
        marketId: params.id,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({ notes });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

// POST /api/marche/[id]/notes — créer une note
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { category, title, notes, date, participants } = body;

    if (!category || !notes) return apiError('category et notes requis');
    if (!['AUDIT', 'COMPTE_RENDU', 'AUTRE'].includes(category)) {
      return apiError('Catégorie invalide');
    }

    const market = await (prisma as any).market.findUnique({
      where:  { id: params.id },
      select: { partnerId: true },
    });
    if (!market) return apiError('Marché introuvable', 404);

    const note = await (prisma as any).marketNote.create({
      data: {
        partnerId:    market.partnerId,
        marketId:     params.id,
        category,
        title:        title        || null,
        notes,
        date:         date         ? new Date(date) : new Date(),
        participants: participants || null,
      },
    });

    return apiSuccess({ note }, 201);
  } catch (err) {
    console.error('POST /api/marche/[id]/notes:', err);
    return apiError('Erreur serveur', 500);
  }
}
