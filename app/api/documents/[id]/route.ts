import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/lib/s3';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        views: { orderBy: { viewedAt: 'desc' } },
      },
    });
    if (!doc) return apiError('Document introuvable', 404);
    return apiSuccess({ document: doc });
  } catch (err) {
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
    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return apiError('Document introuvable', 404);

    await deleteFile(doc.url);
    await prisma.document.delete({ where: { id: params.id } });

    return apiSuccess({ message: 'Document supprimé' });
  } catch (err) {
    console.error('DELETE /api/documents/[id]:', err);
    return apiError('Erreur serveur', 500);
  }
}
