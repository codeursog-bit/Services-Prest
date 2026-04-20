import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError } from '@/lib/utils';

// POST /api/settings/change-password
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return apiError('Mot de passe actuel et nouveau mot de passe requis');
    }
    if (newPassword.length < 8) {
      return apiError('Nouveau mot de passe trop court (min 8 caractères)');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) return apiError('Utilisateur introuvable', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return apiError('Mot de passe actuel incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: session.user.email! },
      data:  { password: hashed },
    });

    return apiSuccess({ changed: true });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}
