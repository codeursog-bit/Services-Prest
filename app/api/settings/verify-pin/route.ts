import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { pin, email } = await req.json();

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return apiError('PIN invalide (4 chiffres requis)');
    }

    if (!email) return apiError('Non authentifié', 401);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { pin: true },
    });

    const storedPin = user?.pin ?? '0000';
    const valid     = storedPin === pin;

    console.log('verify-pin: storedPin =', storedPin, '| soumis =', pin, '| valid =', valid);

    return apiSuccess({ valid });
  } catch (err) {
    console.error('verify-pin error:', err);
    return apiError('Erreur serveur', 500);
  }
}
