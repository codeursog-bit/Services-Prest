import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const message = await prisma.message.findUnique({
      where:   { id: params.id },
      include: {
        author:      { select: { name: true } },
        partner:     { select: { id: true, orgName: true } },
        attachedDoc: { select: { id: true, name: true, url: true } },
      },
    });
    if (!message) return apiError('Message introuvable', 404);
    return apiSuccess({ message });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

// PUT /api/messages/[id] — marquer comme lu (isRead: true)
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body    = await req.json();
    const message = await (prisma as any).message.update({
      where: { id: params.id },
      data: {
        ...(body.isRead !== undefined ? { isRead: body.isRead } : {}),
      },
    });
    return apiSuccess({ message });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Message introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    await prisma.message.delete({ where: { id: params.id } });
    return apiSuccess({ message: 'Message supprimé' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Message introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
