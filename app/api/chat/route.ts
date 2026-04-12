import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const partnerId = req.nextUrl.searchParams.get('partnerId');
  if (!partnerId) return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: { id: true, content: true, senderType: true, createdAt: true },
    });
    return NextResponse.json({ messages: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })) });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
