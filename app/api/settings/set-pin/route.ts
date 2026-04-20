import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { apiError } from '@/lib/utils';

// POST /api/settings/set-pin
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non authentifié', 401);

  try {
    const { pin } = await req.json();

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return apiError('PIN invalide (4 chiffres requis)');
    }

    const response = NextResponse.json({ success: true });

    // Stocker le PIN en cookie httpOnly sécurisé
    response.cookies.set('msp_pin', pin, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   365 * 24 * 60 * 60, // 1 an
      path:     '/',
    });

    return response;
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}
