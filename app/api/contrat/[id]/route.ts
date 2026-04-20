import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/lib/s3';
import { apiSuccess, apiError } from '@/lib/utils';

type Ctx = { params: { id: string } };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const version = await prisma.contractVersion.findUnique({
      where: { id: params.id },
    });
    if (!version) return apiError('Version introuvable', 404);

    // Supprimer le PDF sur S3
    await deleteFile(version.fileUrl).catch(console.error);

    await prisma.contractVersion.delete({ where: { id: params.id } });

    return apiSuccess({ message: 'Version supprimée' });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Version introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
