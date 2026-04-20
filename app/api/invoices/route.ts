import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/invoices?partnerId=xxx   → factures d'un partenaire
// GET /api/invoices                 → toutes les factures (vue globale)
// GET /api/invoices?status=NON_SOLDE|EN_COURS|PAYE
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  const { searchParams } = req.nextUrl;
  const partnerId = searchParams.get('partnerId');
  const status    = searchParams.get('status');

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(partnerId ? { partnerId } : {}),
        ...(status    ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, orgName: true, type: true } },
      },
    });

    // Calculer les totaux
    const total     = invoices.reduce((s, i) => s + i.amount, 0);
    const totalPaye = invoices.filter(i => i.status === 'PAYE').reduce((s, i) => s + i.amount, 0);
    const totalEnCours  = invoices.filter(i => i.status === 'EN_COURS').reduce((s, i) => s + i.amount, 0);
    const totalNonSolde = invoices.filter(i => i.status === 'NON_SOLDE').reduce((s, i) => s + i.amount, 0);

    // Factures en retard (dueDate dépassée et pas PAYE)
    const now     = new Date();
    const enRetard = invoices.filter(i =>
      i.dueDate && new Date(i.dueDate) < now && i.status !== 'PAYE'
    ).length;

    return apiSuccess({ invoices, totals: { total, totalPaye, totalEnCours, totalNonSolde, enRetard } });
  } catch (err) {
    console.error('GET /api/invoices:', err);
    return apiError('Erreur serveur', 500);
  }
}

// POST /api/invoices — créer une facture
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { ref, description, amount, issueDate, dueDate, status, notes, partnerId } = body;

    if (!ref || !description || amount === undefined || !issueDate || !partnerId) {
      return apiError('Champs obligatoires manquants (ref, description, amount, issueDate, partnerId)');
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return apiError('Montant invalide');
    }

    const invoice = await prisma.invoice.create({
      data: {
        ref,
        description,
        amount:    Number(amount),
        issueDate: new Date(issueDate),
        dueDate:   dueDate ? new Date(dueDate) : null,
        status:    (status || 'NON_SOLDE') as any,
        notes:     notes || null,
        partnerId,
      },
      include: {
        partner: { select: { orgName: true } },
      },
    });

    await (prisma as any).notification.create({
      data: {
        content:   `Facture ${ref} créée pour ${invoice.partner.orgName} — ${Number(amount).toLocaleString('fr-FR')} FCFA`,
        type:      'INFO',
        link:      `/dashboard/banques`,
        partnerId,
      },
    });

    return apiSuccess({ invoice }, 201);
  } catch (err: any) {
    console.error('POST /api/invoices:', err);
    if (err.code === 'P2002') return apiError('Une facture avec cette référence existe déjà');
    return apiError('Erreur serveur', 500);
  }
}
