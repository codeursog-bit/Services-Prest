import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const debt = await (prisma as any).debt.findUnique({
      where:   { id: params.id },
      include: { partner: { select: { id: true, orgName: true } } },
    });
    if (!debt) return apiError('Dette introuvable', 404);
    return apiSuccess({ debt });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { type, debtorName, motif, amount, status, grantedAt, repaidAt, statusNote, notes } = body;

    if (amount !== undefined && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      return apiError('Montant invalide');
    }

    const debt = await (prisma as any).debt.update({
      where: { id: params.id },
      data: {
        ...(type       !== undefined ? { type: type as any }                        : {}),
        ...(debtorName !== undefined ? { debtorName }                               : {}),
        ...(motif      !== undefined ? { motif }                                    : {}),
        ...(amount     !== undefined ? { amount: Number(amount) }                   : {}),
        ...(status     !== undefined ? { status: status as any }                    : {}),
        ...(grantedAt  !== undefined ? { grantedAt: new Date(grantedAt) }           : {}),
        ...(repaidAt   !== undefined ? { repaidAt: repaidAt ? new Date(repaidAt) : null } : {}),
        ...(statusNote !== undefined ? { statusNote: statusNote || null }           : {}),
        ...(notes      !== undefined ? { notes: notes || null }                     : {}),
      },
    });

    return apiSuccess({ debt });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Dette introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await (prisma as any).debt.delete({ where: { id: params.id } });
    return apiSuccess({ message: 'Dette supprimée' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Dette introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
