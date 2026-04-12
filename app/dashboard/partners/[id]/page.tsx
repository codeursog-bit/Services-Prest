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
  CLIENT: 'Client', FOURNISSEUR: 'Fournisseur',
  SOUS_TRAITANT: 'Sous-traitant', PRESTATAIRE: 'Prestataire',
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

  const statusStyle = {
    ACTIF:      { cls: 'badge-green',  label: 'Actif' },
    INACTIF:    { cls: 'badge-red',    label: 'Inactif' },
    EN_ATTENTE: { cls: 'badge-orange', label: 'En attente' },
  }[partner.status] ?? { cls: 'badge-gray', label: partner.status };

  const tabs = [
    { id: 'documents', label: 'Documents' },
    { id: 'marche',    label: 'Suivi marché' },
    { id: 'infos',     label: 'Infos à transmettre' },
    { id: 'banques',   label: 'Banques & Créances' },
    { id: 'chat',      label: 'Chat' },
    { id: 'historique',label: 'Historique' },
  ];

  const serializedDocs = partner.documents.map(d => ({
    id: d.id, name: d.name, fileType: d.fileType, size: d.size, url: d.url,
    createdAt: d.createdAt.toISOString(),
    views: d.views.map(v => ({ viewedAt: v.viewedAt.toISOString() })),
  }));

  const serializedMessages = partner.messages.map(m => ({
    id: m.id, subject: m.subject, content: m.content,
    createdAt: m.createdAt.toISOString(),
    author: m.author, attachedDoc: m.attachedDoc,
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
      <div className="rounded-[10px] p-5 sm:p-6 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col lg:flex-row justify-between items-start gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-medium flex-shrink-0"
              style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
              {partner.orgName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>{partner.orgName}</h2>
              <div className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{partner.contactName} · {partner.email}</div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="badge badge-gray">{TYPE_LABELS[partner.type] ?? partner.type}</span>
                <span className={`badge ${statusStyle.cls}`}>{statusStyle.label}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/partners/${partner.id}/edit`}
              className="py-1.5 px-3 rounded-[6px] text-[12px] transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Modifier
            </Link>
            <Link href={`/partner/${partner.token}`} target="_blank"
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-[6px] text-[12px] transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Voir l&apos;espace partenaire
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* MÉTRIQUES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { val: partner._count.documents, label: 'Documents' },
            { val: partner._count.messages,  label: 'Messages envoyés' },
            { val: partner._count.invoices,  label: 'Factures' },
            { val: lastActivity,             label: 'Dernier document' },
          ].map((m, i) => (
            <div key={i} className="rounded-[8px] p-3" style={{ background: 'var(--bg-dash)', border: '1px solid var(--border)' }}>
              <div className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{m.val}</div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto mb-5 hide-scrollbar" style={{ borderBottom: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <Link key={tab.id}
            href={`/dashboard/partners/${partner.id}?tab=${tab.id}`}
            className="whitespace-nowrap py-2.5 px-5 text-[13px] transition-colors border-b-2"
            style={{
              color: currentTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: currentTab === tab.id ? 500 : 400,
              borderBottomColor: currentTab === tab.id ? 'var(--navy-mid)' : 'transparent',
            }}>
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
          <div className="rounded-[10px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="relative pl-2">
              <div className="absolute left-[15px] top-2 bottom-0 w-px" style={{ background: 'var(--border)' }} />
              <div className="flex flex-col gap-6">
                {partner.documents.slice(0, 10).map(doc => (
                  <div key={doc.id} className="flex gap-4 relative z-10">
                    <div className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5" style={{ background: 'var(--navy-mid)' }} />
                    <div>
                      <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                        Document partagé : <strong>{doc.name}</strong>
                      </p>
                      <span className="block text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {doc.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                {partner.documents.length === 0 && (
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucune activité enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}