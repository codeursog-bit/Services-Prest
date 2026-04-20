import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/lib/s3';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const invoice = await prisma.invoice.findUnique({
      where:   { id: params.id },
      include: { partner: { select: { id: true, orgName: true } } },
    });
    if (!invoice) return apiError('Facture introuvable', 404);
    return apiSuccess({ invoice });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { description, amount, dueDate, status, notes } = body;

    if (amount !== undefined && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      return apiError('Montant invalide');
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined ? { description }                           : {}),
        ...(amount      !== undefined ? { amount: Number(amount) }                : {}),
        ...(dueDate     !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(status      !== undefined ? { status: status as any }                 : {}),
        ...(notes       !== undefined ? { notes: notes || null }                  : {}),
      },
    });

    return apiSuccess({ invoice });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Facture introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
    if (!invoice) return apiError('Facture introuvable', 404);

    // Supprimer le PDF S3 si présent
    if (invoice.fileUrl) await deleteFile(invoice.fileUrl).catch(() => {});

    await prisma.invoice.delete({ where: { id: params.id } });
    return apiSuccess({ message: 'Facture supprimée' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Facture introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
