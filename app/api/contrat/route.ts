import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/s3';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/contrat — toutes les versions du contrat
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const versions = await prisma.contractVersion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
    return apiSuccess({ versions });
  } catch (err) {
    console.error('GET /api/contrat:', err);
    return apiError('Erreur serveur', 500);
  }
}

// POST /api/contrat — uploader une nouvelle version PDF
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const formData    = await req.formData();
    const file        = formData.get('file')        as File | null;
    const versionName = formData.get('versionName') as string | null;

    if (!file || file.size === 0) return apiError('Fichier requis');
    if (!versionName?.trim())     return apiError('Nom de version requis');
    if (!file.type.includes('pdf')) return apiError('Seuls les fichiers PDF sont acceptés');
    if (file.size > 20 * 1024 * 1024) return apiError('Fichier trop volumineux (max 20 Mo)');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) return apiError('Utilisateur introuvable', 404);

    const fileUrl = await uploadFile(file, 'contrats');

    const version = await prisma.contractVersion.create({
      data: {
        versionName: versionName.trim(),
        fileUrl,
        authorId: user.id,
      },
      include: { author: { select: { name: true } } },
    });

    await (prisma as any).notification.create({
      data: {
        content: `Nouvelle version du contrat ajoutée : ${versionName.trim()}`,
        type:    'INFO',
        link:    '/dashboard/contrat',
      },
    });

    return apiSuccess({ version }, 201);
  } catch (err) {
    console.error('POST /api/contrat:', err);
    return apiError('Erreur lors de l\'upload', 500);
  }
}
