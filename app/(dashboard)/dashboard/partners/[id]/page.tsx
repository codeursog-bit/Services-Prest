'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { STATUS_COLORS, PARTNER_TYPE_LABELS, PARTNER_STATUS_LABELS } from '@/lib/utils';

// Tabs — importés dynamiquement
import DocumentsTab  from '@/components/partner-tabs/DocumentsTab';
import MarcheTab     from '@/components/partner-tabs/MarcheTab';
import InfosTab      from '@/components/partner-tabs/InfosTab';
import BanquesTab    from '@/components/partner-tabs/BanquesTab';
import MessagesTab   from '@/components/partner-tabs/MessagesTab';

const TABS = [
  { id: 'documents', label: 'Documents' },
  { id: 'marche',    label: 'Suivi marché' },
  { id: 'infos',     label: 'Infos à transmettre' },
  { id: 'banques',   label: 'Banques & Créances' },
  { id: 'messages',  label: 'Messages' },
];

export default function PartnerDetailPage({
  params,
  searchParams,
}: {
  params:       { id: string };
  searchParams: { tab?: string };
}) {
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentTab = searchParams.tab || 'documents';

  useEffect(() => {
    fetch(`/api/partners/${params.id}`)
      .then(r => r.json())
      .then(d => { setPartner(d.partner); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <DashboardLayout pageTitle="Chargement…">
      <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
    </DashboardLayout>
  );

  if (!partner) return (
    <DashboardLayout pageTitle="Partenaire introuvable">
      <div className="p-[48px] text-center text-[13px] text-[var(--msp-red)]">Ce partenaire n&apos;existe pas.</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout pageTitle={partner.orgName}>

      {/* HEADER PARTENAIRE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[24px] mb-[20px]">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-[24px]">
          {/* GAUCHE */}
          <div className="flex items-center gap-[16px]">
            <div className="w-[56px] h-[56px] rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[18px] font-medium text-[var(--accent-primary)] flex-shrink-0">
              {partner.orgName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[18px] font-medium text-[var(--text-primary)]">{partner.orgName}</h2>
              <div className="text-[13px] text-[var(--text-secondary)] mt-[2px]">{partner.contactName} · {partner.email}</div>
              {partner.phone && <div className="text-[12px] text-[var(--text-secondary)] mt-[1px]">{partner.phone}</div>}
              <div className="flex gap-[8px] mt-[10px] flex-wrap">
                <span className="inline-block border border-[var(--border)] bg-transparent text-[var(--text-secondary)] py-[2px] px-[8px] rounded-[6px] text-[12px]">
                  {PARTNER_TYPE_LABELS[partner.type] || partner.type}
                </span>
                {partner.sector && (
                  <span className="inline-block border border-[var(--border)] bg-transparent text-[var(--text-secondary)] py-[2px] px-[8px] rounded-[6px] text-[12px]">
                    {partner.sector}
                  </span>
                )}
                <span className={`inline-block border rounded-[6px] py-[2px] px-[8px] text-[12px] ${STATUS_COLORS[partner.status] || ''}`}>
                  {PARTNER_STATUS_LABELS[partner.status] || partner.status}
                </span>
              </div>
            </div>
          </div>

          {/* DROITE — Actions */}
          <div className="flex flex-wrap gap-[8px]">
            <Link href={`/dashboard/partners/${partner.id}/edit`}
              className="border border-[var(--border)] bg-transparent text-[var(--text-primary)] py-[6px] px-[12px] rounded-[8px] text-[12px] hover:bg-[var(--bg-surface)] transition-colors">
              Modifier
            </Link>
            <Link href={`/partner/${partner.token}`} target="_blank"
              className="flex items-center gap-[6px] border border-[var(--border)] bg-transparent text-[var(--text-primary)] py-[6px] px-[12px] rounded-[8px] text-[12px] hover:bg-[var(--bg-surface)] transition-colors">
              Voir l&apos;espace partenaire
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* MÉTRIQUES */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-[10px] mt-[24px]">
          {[
            { label: 'Documents',  value: partner._count.documents  },
            { label: 'Messages',   value: partner._count.messages   },
            { label: 'Factures',   value: partner._count.invoices   },
            { label: 'Marchés',    value: partner._count.markets    },
            { label: 'Contentieux',value: partner._count.contentieux},
          ].map(m => (
            <div key={m.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[8px] p-[12px]">
              <div className="text-[15px] font-medium text-[var(--text-primary)]">{m.value}</div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-[2px]">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-0 border-b border-[var(--border)] mb-[24px] overflow-x-auto">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            href={`/dashboard/partners/${partner.id}?tab=${tab.id}`}
            className={`py-[10px] px-[16px] text-[13px] transition-colors border-b-2 whitespace-nowrap ${
              currentTab === tab.id
                ? 'text-[var(--text-primary)] font-medium border-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* CONTENU ONGLET */}
      {currentTab === 'documents' && <DocumentsTab partnerId={partner.id} />}
      {currentTab === 'marche'    && <MarcheTab    partnerId={partner.id} />}
      {currentTab === 'infos'     && (
        <InfosTab
          partnerId={partner.id}
          partnerEmail={partner.email}
          partnerName={partner.orgName}
        />
      )}
      {currentTab === 'banques'   && <BanquesTab  partnerId={partner.id} />}
      {currentTab === 'messages'  && <MessagesTab partnerId={partner.id} partnerName={partner.orgName} partnerEmail={partner.email} />}
    </DashboardLayout>
  );
}
