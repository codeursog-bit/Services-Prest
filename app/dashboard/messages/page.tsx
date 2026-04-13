import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import MessagesClient from './MessagesClient';

export default async function MessagesPage() {
  const [messages, partners] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, orgName: true } },
        author: { select: { name: true } },
        attachedDoc: { select: { name: true } },
      },
    }),
    prisma.partner.findMany({
      where: { status: 'ACTIF' },
      orderBy: { orgName: 'asc' },
      select: { id: true, orgName: true },
    }),
  ]);

  const serialized = messages.map(m => ({
    id: m.id,
    subject: m.subject,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    partner: m.partner,
    author: m.author,
    attachedDoc: m.attachedDoc,
  }));

  return (
    <DashboardLayout userInitials="ML" pageTitle="Informations à transmettre">
      <MessagesClient initialMessages={serialized} partners={partners} />
    </DashboardLayout>
  );
}