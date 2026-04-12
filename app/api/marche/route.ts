import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const partnerId = req.nextUrl.searchParams.get('partnerId');
  if (!partnerId) return NextResponse.json({ error: 'partnerId requis' }, { status: 400 });
  try {
    const [market, notes, contentieux] = await Promise.all([
      prisma.market.findFirst({ where: { partnerId }, orderBy: { createdAt: 'desc' } }),
      prisma.marketNote.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' } }),
      prisma.contentieux.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' } }),
    ]);
    return NextResponse.json({ market, notes, contentieux });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}