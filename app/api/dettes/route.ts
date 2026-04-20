import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { Debt, DebtStatus, DebtType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const { searchParams } = req.nextUrl;
  const type   = searchParams.get('type')   as DebtType   | null;
  const status = searchParams.get('status') as DebtStatus | null;

  try {
    const debts = await prisma.debt.findMany({
      where: {
        ...(type   ? { type }   : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, orgName: true } },
      },
    });

    const totalAccorde      = debts.filter((d: Debt) => d.status !== 'REFUSE').reduce((s: number, d: Debt) => s + d.amount, 0);
    const totalRembourse    = debts.filter((d: Debt) => d.status === 'REMBOURSE').reduce((s: number, d: Debt) => s + d.amount, 0);
    const totalNonRembourse = debts.filter((d: Debt) => d.status === 'NON_REMBOURSE' || d.status === 'ACCORDE').reduce((s: number, d: Debt) => s + d.amount, 0);

    return apiSuccess({ debts, totals: { totalAccorde, totalRembourse, totalNonRembourse } });
  } catch (err) {
    console.error('GET /api/dettes:', err);
    return apiError('Erreur serveur', 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { type, debtorName, motif, amount, status, grantedAt, repaidAt, statusNote, notes, partnerId } = body;

    if (!type || !debtorName || !motif || amount === undefined || !grantedAt) {
      return apiError('Champs obligatoires manquants (type, debtorName, motif, amount, grantedAt)');
    }
    if (!['AVANCE_SALAIRE', 'CAS_SOCIAL', 'DETTE_ENTREPRISE', 'AUTRE'].includes(type)) {
      return apiError('Type de dette invalide');
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return apiError('Montant invalide');
    }

    const debt = await prisma.debt.create({
      data: {
        type:       type        as DebtType,
        debtorName,
        motif,
        amount:     Number(amount),
        status:     (status || 'ACCORDE') as DebtStatus,
        grantedAt:  new Date(grantedAt),
        repaidAt:   repaidAt   ? new Date(repaidAt) : null,
        statusNote: statusNote ?? null,
        notes:      notes      ?? null,
        partnerId:  partnerId  ?? null,
      },
    });

    return apiSuccess({ debt }, 201);
  } catch (err) {
    console.error('POST /api/dettes:', err);
    return apiError('Erreur serveur', 500);
  }
}