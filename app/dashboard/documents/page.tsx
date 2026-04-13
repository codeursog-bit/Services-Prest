import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import CompanyDocumentsClient from './CompanyDocumentsClient';

export default async function CompanyDocumentsPage() {
  const [companyDocs, partners] = await Promise.all([
    prisma.document.findMany({
      where: { partnerId: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.partner.findMany({
      where: { status: 'ACTIF' },
      orderBy: { orgName: 'asc' },
      select: { id: true, orgName: true },
    }),
  ]);

  const countByCategory = companyDocs.reduce((acc: Record<string, number>, doc) => {
    const cat = doc.category ?? 'AUTR';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const serialized = companyDocs.map(d => ({
    id: d.id,
    name: d.name,
    fileType: d.fileType,
    size: d.size,
    url: d.url,
    category: d.category,
    validityDate: d.validityDate?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <DashboardLayout userInitials="ML" pageTitle="Documents de l'entreprise">
      <CompanyDocumentsClient
        initialDocs={serialized}
        partners={partners}
        countByCategory={countByCategory}
      />
    </DashboardLayout>
  );
}