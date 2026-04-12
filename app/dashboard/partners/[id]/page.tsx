import { notFound } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DocumentsTab from '@/components/partner-tabs/DocumentsTab';
import MarcheTab from '@/components/partner-tabs/MarcheTab';
import InfosTab from '@/components/partner-tabs/InfosTab';
import BanquesTab from '@/components/partner-tabs/BanquesTab';
import ChatTab from '@/components/partner-tabs/ChatTab';
import prisma from '@/lib/prisma';

const TYPE_LABELS: Record<string, string> = {
  CLIENT: 'Client', FOURNISSEUR: 'Fournisseur', SOUS_TRAITANT: 'Sous-traitant', PRESTATAIRE: 'Prestataire',
};
const STATUS_STYLES: Record<string, string> = {
  ACTIF: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]',
  INACTIF: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]',
  EN_ATTENTE: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]',
};

export default async function PartnerDetailsPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { tab?: string } }) {
  const currentTab = searchParams.tab || 'documents';

  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { documents: true, messages: true, invoices: true, chatMessages: true } },
      documents: { orderBy: { createdAt: 'desc' }, include: { views: { select: { viewedAt: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } }, attachedDoc: { select: { name: true } } } },
      invoices: { orderBy: { issueDate: 'desc' } },
      markets: { orderBy: { createdAt: 'desc' } },
      marketNotes: { orderBy: { date: 'desc' } },
      contentieux: { orderBy: { openDate: 'desc' } },
      chatMessages: { orderBy: { createdAt: 'asc' }, take: 100 },
    },
  });

  if (!partner) notFound();

  const lastDoc = partner.documents[0];
  const lastActivity = lastDoc
    ? lastDoc.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const tabs = [
    { id: 'documents', label: 'Documents' },
    { id: 'marche', label: 'Suivi marché' },
    { id: 'infos', label: 'Infos à transmettre' },
    { id: 'banques', label: 'Banques & Créances' },
    { id: 'chat', label: 'Chat' },
    { id: 'historique', label: 'Historique' },
  ];

  // Serialize dates for client components
  const serializedDocs = partner.documents.map(d => ({
    id: d.id, name: d.name, fileType: d.fileType, size: d.size, url: d.url,
    createdAt: d.createdAt.toISOString(),
    views: d.views.map(v => ({ viewedAt: v.viewedAt.toISOString() })),
  }));

  const serializedMessages = partner.messages.map(m => ({
    id: m.id, subject: m.subject, content: m.content,
    createdAt: m.createdAt.toISOString(),
    author: m.author,
    attachedDoc: m.attachedDoc,
  }));

  const serializedInvoices = partner.invoices.map(i => ({
    id: i.id, ref: i.ref, description: i.description, amount: i.amount,
    issueDate: i.issueDate.toISOString(),
    dueDate: i.dueDate?.toISOString() ?? null,
    status: i.status, notes: i.notes, fileUrl: i.fileUrl,
  }));

  const serializedMarkets = partner.markets.map(m => ({
    id: m.id, name: m.name, phase: m.phase, nextStep: m.nextStep,
    executionRate: m.executionRate,
    nextReviewDate: m.nextReviewDate?.toISOString() ?? null,
    closingDate: m.closingDate?.toISOString() ?? null,
    updatedAt: m.updatedAt.toISOString(),
  }));

  const serializedNotes = partner.marketNotes.map(n => ({
    id: n.id, category: n.category, notes: n.notes, participants: n.participants,
    date: n.date.toISOString(),
  }));

  const serializedContentieux = partner.contentieux.map(c => ({
    id: c.id, subject: c.subject, description: c.description,
    openDate: c.openDate.toISOString(), status: c.status,
  }));

  const serializedChat = partner.chatMessages.map(c => ({
    id: c.id, content: c.content, senderType: c.senderType,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <DashboardLayout userInitials="ML" pageTitle={partner.orgName}>

      {/* HEADER */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px] mb-[20px]">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-[24px]">
          <div className="flex items-center gap-[16px]">
            <div className="w-[56px] h-[56px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[18px] font-medium text-[#1A3A5C] flex-shrink-0">
              {partner.orgName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[18px] font-medium text-[#1A1A19]">{partner.orgName}</h2>
              <div className="text-[13px] text-[#6B6A67] mt-[2px]">{partner.contactName} · {partner.email}</div>
              <div className="flex gap-[8px] mt-[10px]">
                <span className="inline-block border border-[#E8E7E4] bg-transparent text-[#6B6A67] py-[2px] px-[8px] rounded-[4px] text-[12px]">
                  {TYPE_LABELS[partner.type] ?? partner.type}
                </span>
                <span className={`inline-block border rounded-[4px] p-[2px_8px] text-[12px] ${STATUS_STYLES[partner.status] ?? ''}`}>
                  {partner.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-[8px]">
            <Link href={`/dashboard/partners/${partner.id}/edit`}
              className="border border-[#E8E7E4] bg-transparent text-[#1A1A19] py-[6px] px-[12px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6] transition-colors">
              Modifier
            </Link>
            <Link href={`/partner/${partner.token}`} target="_blank"
              className="flex items-center gap-[6px] border border-[#E8E7E4] bg-transparent text-[#1A1A19] py-[6px] px-[12px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6] transition-colors">
              Voir l&apos;espace partenaire
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* MÉTRIQUES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mt-[24px]">
          <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[12px]">
            <div className="text-[15px] font-medium text-[#1A1A19]">{partner._count.documents}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[2px]">Documents</div>
          </div>
          <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[12px]">
            <div className="text-[15px] font-medium text-[#1A1A19]">{partner._count.messages}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[2px]">Messages envoyés</div>
          </div>
          <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[12px]">
            <div className="text-[15px] font-medium text-[#1A1A19]">{partner._count.invoices}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[2px]">Factures</div>
          </div>
          <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[12px]">
            <div className="text-[14px] font-medium text-[#1A1A19]">{lastActivity}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[2px]">Dernier document</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto border-b border-[#E8E7E4] mb-[20px] hide-scrollbar">
        {tabs.map(tab => (
          <Link key={tab.id}
            href={`/dashboard/partners/${partner.id}?tab=${tab.id}`}
            className={`whitespace-nowrap py-[10px] px-[20px] text-[13px] transition-colors border-b-2 ${
              currentTab === tab.id
                ? 'text-[#1A1A19] font-medium border-[#1A3A5C]'
                : 'text-[#6B6A67] border-transparent hover:text-[#1A1A19]'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* CONTENU */}
      <div>
        {currentTab === 'documents' && <DocumentsTab partnerId={partner.id} initialDocs={serializedDocs} />}
        {currentTab === 'marche' && (
          <MarcheTab
            partnerId={partner.id}
            initialMarkets={serializedMarkets}
            initialNotes={serializedNotes}
            initialContentieux={serializedContentieux}
          />
        )}
        {currentTab === 'infos' && (
          <InfosTab
            partnerId={partner.id}
            partnerEmail={partner.email}
            partnerName={partner.orgName}
            initialMessages={serializedMessages}
          />
        )}
        {currentTab === 'banques' && (
          <BanquesTab partnerId={partner.id} initialInvoices={serializedInvoices} />
        )}
        {currentTab === 'chat' && (
          <ChatTab partnerId={partner.id} partnerName={partner.orgName} initialMessages={serializedChat} />
        )}
        {currentTab === 'historique' && (
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
            <div className="relative pl-[8px]">
              <div className="absolute left-[15px] top-[8px] bottom-0 w-[1px] bg-[#E8E7E4]"></div>
              <div className="flex flex-col gap-[24px]">
                {partner.documents.slice(0, 10).map(doc => (
                  <div key={doc.id} className="flex gap-[16px] relative z-10">
                    <div className="w-[16px] h-[16px] rounded-full bg-[#1A3A5C] flex-shrink-0 mt-[2px]"></div>
                    <div>
                      <p className="text-[13px] text-[#1A1A19]">Document partagé : <strong>{doc.name}</strong></p>
                      <span className="block text-[12px] text-[#6B6A67] mt-[2px]">
                        {doc.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                {partner.documents.length === 0 && (
                  <p className="text-[13px] text-[#6B6A67]">Aucune activité enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
