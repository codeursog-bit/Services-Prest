import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const partnerId = req.nextUrl.searchParams.get('partnerId');
  if (!partnerId) return NextResponse.json({ error: 'partnerId requis' }, { status: 400 });
  try {
    const messages = await prisma.message.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } }, attachedDoc: { select: { name: true } } },
    });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}