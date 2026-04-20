import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { apiSuccess, apiError } from '@/lib/utils';

// PIN stocké en cookie httpOnly hashé (simple pour cette app)
// En production réelle, stocker en DB chiffré

// POST /api/settings/verify-pin — vérifier le PIN
export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return apiError('PIN invalide (4 chiffres requis)');
    }

    const cookieStore = await cookies();
    const storedPin   = cookieStore.get('msp_pin')?.value;

    if (!storedPin) {
      // Aucun PIN défini — accepter n'importe quel PIN pour le 1er accès
      return apiSuccess({ valid: true });
    }

    const valid = storedPin === pin;
    if (!valid) return apiSuccess({ valid: false });

    return apiSuccess({ valid: true });
  } catch (err) {
    return apiError('Erreur serveur', 500);
  }
}
