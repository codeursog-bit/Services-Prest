import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { MarketStep, MarketStepStatus } from '@prisma/client';

type Ctx = { params: { id: string; stepId: string } };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { title, description, startDate, endDate, status, order, incidents } = body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return apiError('La date de début doit être antérieure à la date de fin');
    }

    const step = await prisma.marketStep.update({
      where: { id: params.stepId },
      data: {
        ...(title       !== undefined ? { title }                            : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(startDate   !== undefined ? { startDate: new Date(startDate) }   : {}),
        ...(endDate     !== undefined ? { endDate:   new Date(endDate) }     : {}),
        ...(status      !== undefined ? { status: status as MarketStepStatus } : {}),
        ...(order       !== undefined ? { order }                            : {}),
        ...(incidents   !== undefined ? { incidents: incidents || null }     : {}),
      },
    });

    if (status !== undefined) {
      await recalcExecutionRate(params.id);
    }

    return apiSuccess({ step });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Étape introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await prisma.marketStep.delete({ where: { id: params.stepId } });
    await recalcExecutionRate(params.id);
    return apiSuccess({ message: 'Étape supprimée' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Étape introuvable', 404);
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