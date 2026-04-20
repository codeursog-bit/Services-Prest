import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            documents:  true,
            messages:   true,
            invoices:   true,
            markets:    true,
            contentieux:true,
          },
        },
      },
    });

    if (!partner) return apiError('Partenaire introuvable', 404);

    // Ne pas exposer le token dans la réponse (sécurité)
    const { token, notes, ...safePartner } = partner;

    return apiSuccess({ partner: { ...safePartner, token, notes } });
  } catch (err) {
    console.error('GET /api/partners/[id]:', err);
    return apiError('Erreur serveur', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { orgName, contactName, email, phone, type, sector, address, notes, status, notifyOnDoc, notifyAdmin } = body;

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        ...(orgName      !== undefined ? { orgName }      : {}),
        ...(contactName  !== undefined ? { contactName }  : {}),
        ...(email        !== undefined ? { email }        : {}),
        ...(phone        !== undefined ? { phone: phone || null }  : {}),
        ...(type         !== undefined ? { type: type as any }     : {}),
        ...(sector       !== undefined ? { sector: sector || null }: {}),
        ...(address      !== undefined ? { address: address || null }: {}),
        ...(notes        !== undefined ? { notes: notes || null }  : {}),
        ...(status       !== undefined ? { status: status as any } : {}),
        ...(notifyOnDoc  !== undefined ? { notifyOnDoc }  : {}),
        ...(notifyAdmin  !== undefined ? { notifyAdmin }  : {}),
      },
    });

    return apiSuccess({ partner });
  } catch (err: any) {
    console.error('PUT /api/partners/[id]:', err);
    if (err.code === 'P2025') return apiError('Partenaire introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await prisma.partner.delete({ where: { id: params.id } });
    return apiSuccess({ message: 'Partenaire supprimé' });
  } catch (err: any) {
    console.error('DELETE /api/partners/[id]:', err);
    if (err.code === 'P2025') return apiError('Partenaire introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
