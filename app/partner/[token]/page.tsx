import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import PartnerSpaceClient from './PartnerSpaceClient';

export default async function PartnerAccessPage({
  params,
}: {
  params: { token: string };
}) {
  // Vérification réelle du token en base
  const partner = await prisma.partner.findUnique({
    where: { token: params.token },
    select: {
      id:          true,
      orgName:     true,
      contactName: true,
      status:      true,
      token:       true,
    },
  });

  if (!partner || partner.status === 'INACTIF') {
    redirect('/partner/expired');
  }

  // Charger les documents partagés
  const documents = await prisma.document.findMany({
    where:   { partnerId: partner.id },
    orderBy: { createdAt: 'desc' },
    include: { views: { orderBy: { viewedAt: 'desc' }, take: 1 } },
  });

  // Charger les messages reçus (MSP → Partenaire)
  const messages = await (prisma as any).message.findMany({
    where:   { partnerId: partner.id, direction: 'MSP_TO_PARTNER' },
    orderBy: { createdAt: 'desc' },
    include: {
      author:      { select: { name: true } },
      attachedDoc: { select: { name: true, url: true } },
    },
  });

  return (
    <PartnerSpaceClient
      partner={partner}
      documents={documents as any}
      messages={messages as any}
    />
  );
}
