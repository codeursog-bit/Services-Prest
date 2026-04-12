// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const partnerId = req.nextUrl.searchParams.get('partnerId');

  try {
    if (partnerId) {
      // Documents d'un partenaire
      const documents = await prisma.document.findMany({
        where: { partnerId },
        orderBy: { createdAt: 'desc' },
        include: { views: { orderBy: { viewedAt: 'desc' }, take: 1 } },
      });
      return NextResponse.json({ documents });
    } else {
      // Documents d'entreprise (coffre-fort)
      const documents = await prisma.document.findMany({
        where: { partnerId: null },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ documents });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}