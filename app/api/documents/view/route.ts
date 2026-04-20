import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { createHash } from 'crypto';

// POST /api/documents/view — appelé depuis l'espace partenaire (pas d'auth admin)
// body: { documentId: string, token: string }
export async function POST(req: NextRequest) {
  try {
    const { documentId, token } = await req.json();
    if (!documentId || !token) return apiError('Données manquantes');

    // Vérifier que le token appartient bien à un partenaire ayant ce document
    const partner = await prisma.partner.findUnique({ where: { token } });
    if (!partner) return apiError('Token invalide', 403);

    const doc = await prisma.document.findFirst({
      where: { id: documentId, partnerId: partner.id },
    });
    if (!doc) return apiError('Document introuvable', 404);

    // Hash l'IP pour traçabilité sans stocker l'IP brute
    const ip     = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16);

    await prisma.documentView.create({
      data: { documentId, ipHash },
    });

    return apiSuccess({ tracked: true });
  } catch (err) {
    console.error('POST /api/documents/view:', err);
    return apiError('Erreur serveur', 500);
  }
}
