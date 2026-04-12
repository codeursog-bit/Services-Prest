import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { partner: { select: { orgName: true, id: true } } },
    });
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });
    const unreadChat = await prisma.chatMessage.count({ where: { senderType: 'partner', isRead: false } });
    return NextResponse.json({ notifications, unreadCount, unreadChat });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}