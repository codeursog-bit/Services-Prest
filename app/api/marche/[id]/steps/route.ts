import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { MarketStep, MarketStepStatus } from '@prisma/client';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const steps = await prisma.marketStep.findMany({
      where:   { marketId: params.id },
      orderBy: { order: 'asc' },
    });
    return apiSuccess({ steps });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { title, description, startDate, endDate, order, status } = body;

    if (!title || !startDate || !endDate) {
      return apiError('title, startDate et endDate requis');
    }
    if (new Date(startDate) > new Date(endDate)) {
      return apiError('La date de début doit être antérieure à la date de fin');
    }

    const market = await prisma.market.findUnique({ where: { id: params.id } });
    if (!market) return apiError('Marché introuvable', 404);

    let stepOrder = order;
    if (stepOrder === undefined) {
      const last = await prisma.marketStep.findFirst({
        where:   { marketId: params.id },
        orderBy: { order: 'desc' },
        select:  { order: true },
      });
      stepOrder = (last?.order ?? -1) + 1;
    }

    const step = await prisma.marketStep.create({
      data: {
        marketId:    params.id,
        title,
        description: description || null,
        startDate:   new Date(startDate),
        endDate:     new Date(endDate),
        order:       stepOrder,
        status:      (status || 'A_VENIR') as MarketStepStatus,
      },
    });

    await recalcExecutionRate(params.id);
    return apiSuccess({ step }, 201);
  } catch (err) {
    console.error('POST /api/marche/[id]/steps:', err);
    return apiError('Erreur serveur', 500);
  }
}

async function recalcExecutionRate(marketId: string) {
  const steps = await prisma.marketStep.findMany({ where: { marketId } });
  if (steps.length === 0) return;
  const done = steps.filter((s: MarketStep) => s.status === 'TERMINE').length;
  const rate = Math.round((done / steps.length) * 100);
  await prisma.market.update({ where: { id: marketId }, data: { executionRate: rate } });
}