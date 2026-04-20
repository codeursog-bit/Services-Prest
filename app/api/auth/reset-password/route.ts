import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError } from '@/lib/utils';

// POST /api/auth/reset-password
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) return apiError('Token et mot de passe requis');
    if (password.length < 8)  return apiError('Mot de passe trop court (min 8 caractères)');

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record)                    return apiError('Lien invalide ou expiré');
    if (record.expiresAt < new Date()) return apiError('Lien expiré, faites une nouvelle demande');

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: record.email },
      data:  { password: hashed },
    });

    // Supprimer le token utilisé
    await prisma.passwordResetToken.delete({ where: { token } });

    return apiSuccess({ reset: true });
  } catch (err) {
    console.error('POST /api/auth/reset-password:', err);
    return apiError('Erreur serveur', 500);
  }
}
