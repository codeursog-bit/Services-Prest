import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import PartnerSpaceClient from './PartnerSpaceClient';

export default async function PartnerAccessPage({ params }: { params: { token: string } }) {
  const partner = await prisma.partner.findUnique({
    where: { token: params.token },
    include: {
      documents: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, fileType: true, size: true, url: true, createdAt: true, category: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, subject: true, content: true, createdAt: true, author: { select: { name: true } } },
      },
      chatMessages: {
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: { id: true, content: true, senderType: true, createdAt: true },
      },
    },
  });

  if (!partner || partner.status === 'INACTIF') {
    redirect('/partner/expired');
  }

  return (
    <PartnerSpaceClient
      partner={{
        id: partner.id,
        orgName: partner.orgName,
        token: partner.token,
        documents: partner.documents.map(d => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
        })),
        messages: partner.messages.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
        chatMessages: partner.chatMessages.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        })),
      }}
    />
  );
}
