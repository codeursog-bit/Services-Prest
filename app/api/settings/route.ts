import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError } from '@/lib/utils';

// GET /api/settings — profil de l'admin connecté
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const user = await prisma.user.findUnique({
      where:  { email: session.user.email! },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
    if (!user) return apiError('Utilisateur introuvable', 404);
    return apiSuccess({ user });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}

// PUT /api/settings — modifier profil
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const body = await req.json();
    const { name, phone } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        ...(name  !== undefined ? { name:  name  || '' }    : {}),
        ...(phone !== undefined ? { phone: phone || null }  : {}),
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    return apiSuccess({ user });
  } catch (err: any) {
    if (err.code === 'P2025') return apiError('Utilisateur introuvable', 404);
    return apiError('Erreur serveur', 500);
  }
}
