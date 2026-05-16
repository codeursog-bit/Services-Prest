import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { apiError, apiSuccess } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return apiError('Non authentifié', 401);

  try {
    const { pin } = await req.json();

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return apiError('PIN invalide (4 chiffres requis)');
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { pin },
    });

    return apiSuccess({ updated: true });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}
