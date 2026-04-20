import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordReset } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) return apiError('Email requis');

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // Toujours répondre success pour ne pas divulguer si l'email existe
    if (!user) return apiSuccess({ sent: true });

    // Supprimer les anciens tokens de cet email
    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

    const token     = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expiresAt },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordReset({ to: user.email, resetLink });

    return apiSuccess({ sent: true });
  } catch (err) {
    console.error('POST /api/auth/forgot-password:', err);
    return apiError('Erreur serveur', 500);
  }
}
