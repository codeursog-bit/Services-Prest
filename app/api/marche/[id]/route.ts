import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

// GET /api/marche/[id] — détail complet du marché avec steps, notes, contentieux
export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const market = await (prisma as any).market.findUnique({
      where: { id: params.id },
      include: {
        partner:    { select: { id: true, orgName: true, type: true, token: true } },
        steps:      { orderBy: { order: 'asc' } },
        notes:      { orderBy: { createdAt: 'desc' } },
        contentieux:{ orderBy: { createdAt: 'desc' } },
      },
    });

    if (!market) return apiError('Marché introuvable', 404);
    return apiSuccess({ market });
  } catch (err) {
    console.error('GET /api/marche/[id]:', err);
    return apiError('Erreur serveur', 500);
  }
}

// PUT /api/marche/[id] — modifier les infos générales du marché
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const {
      name, description, status,
      startDate, endDate, closingDate,
      nextReviewDate, executionRate,
    } = body;

    const market = await (prisma as any).market.update({
      where: { id: params.id },
      data: {
        ...(name          !== undefined ? { name }          : {}),
        ...(description   !== undefined ? { description: description || null }  : {}),
        ...(status        !== undefined ? { status }        : {}),
        ...(executionRate !== undefined ? { executionRate } : {}),
        ...(startDate     !== undefined ? { startDate:     startDate     ? new Date(startDate)     : null } : {}),
        ...(endDate       !== undefined ? { endDate:       endDate       ? new Date(endDate)       : null } : {}),
        ...(closingDate   !== undefined ? { closingDate:   closingDate   ? new Date(closingDate)   : null } : {}),
        ...(nextReviewDate!== undefined ? { nextReviewDate:nextReviewDate? new Date(nextReviewDate): null } : {}),
      },
    });

    return apiSuccess({ market });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Marché introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

// DELETE /api/marche/[id]
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await (prisma as any).market.delete({ where: { id: params.id } });
    return apiSuccess({ message: 'Marché supprimé' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Marché introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
