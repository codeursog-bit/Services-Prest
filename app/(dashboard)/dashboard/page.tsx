'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, formatDateShort, formatAmount, daysUntil, PARTNER_TYPE_LABELS, STATUS_COLORS } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalPartners: number; activePartners: number;
    totalMarkets: number; activeMarkets: number;
    totalDocuments: number; unreadMessages: number;
    unreadNotifs: number; totalFacture: number;
    encaisse: number; enAttenteFacture: number; lateInvoicesCount: number;
  };
  expiringDocs:   { id: string; name: string; validityDate: string; category: string | null }[];
  recentPartners: { id: string; orgName: string; type: string; status: string; createdAt: string; _count: { documents: number; markets: number } }[];
  recentActivity: { id: string; subject: string; direction: string; createdAt: string; partner: { id: string; orgName: string } }[];
  lateInvoices:   { id: string; ref: string; amount: number; dueDate: string | null; partner: { orgName: string } }[];
  activeSteps:    { id: string; title: string; endDate: string; status: string; market: { name: string; partner: { orgName: string } } }[];
}

export default function DashboardPage() {
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { if (d.stats) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout pageTitle="Tableau de bord">
      <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout pageTitle="Tableau de bord">
      <div className="p-[48px] text-center text-[13px] text-[#9B2335]">Erreur de chargement.</div>
    </DashboardLayout>
  );

  const { stats, expiringDocs, recentPartners, recentActivity, lateInvoices, activeSteps } = data;
  const hasAlerts = expiringDocs.length > 0 || lateInvoices.length > 0 || stats.unreadMessages > 0;

  return (
    <DashboardLayout pageTitle="Tableau de bord">

      {/* ── BLOC ALERTES ── */}
      {hasAlerts && (
        <div className="bg-[#FEF3E2] border border-[#8B4513] rounded-[10px] p-[16px_20px] mb-[24px]">
          <div className="flex items-center gap-[8px] mb-[10px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-[13px] font-medium text-[#8B4513]">Points d&apos;attention</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            {stats.unreadMessages > 0 && (
              <Link href="/dashboard/messages" className="flex items-center gap-[6px] text-[12px] text-[#8B4513] hover:underline">
                <span>→</span>
                <span>{stats.unreadMessages} message{stats.unreadMessages > 1 ? 's' : ''} non lu{stats.unreadMessages > 1 ? 's' : ''} de partenaires</span>
              </Link>
            )}
            {lateInvoices.length > 0 && (
              <Link href="/dashboard/banques" className="flex items-center gap-[6px] text-[12px] text-[#8B4513] hover:underline">
                <span>→</span>
                <span>{lateInvoices.length} facture{lateInvoices.length > 1 ? 's' : ''} en retard de paiement</span>
              </Link>
            )}
            {expiringDocs.length > 0 && (
              <Link href="/dashboard/documents" className="flex items-center gap-[6px] text-[12px] text-[#8B4513] hover:underline">
                <span>→</span>
                <span>{expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expirent dans moins de 30 jours</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── KPIs ROW 1 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[16px]">
        {[
          {
            label: 'Partenaires actifs',
            value: stats.activePartners,
            sub:   `${stats.totalPartners} au total`,
            link:  '/dashboard/partners',
            color: 'text-[#1A1A19]',
          },
          {
            label: 'Marchés en cours',
            value: stats.activeMarkets,
            sub:   `${stats.totalMarkets} au total`,
            link:  '/dashboard/marche',
            color: 'text-[#1A1A19]',
          },
          {
            label: 'Messages non lus',
            value: stats.unreadMessages,
            sub:   'De vos partenaires',
            link:  '/dashboard/messages',
            color: stats.unreadMessages > 0 ? 'text-[#9B2335]' : 'text-[#1A1A19]',
          },
          {
            label: 'Documents',
            value: stats.totalDocuments,
            sub:   'Coffre-fort + partagés',
            link:  '/dashboard/documents',
            color: 'text-[#1A1A19]',
          },
        ].map(k => (
          <Link key={k.label} href={k.link}
            className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px] hover:border-[#1A3A5C] transition-colors group">
            <div className={`text-[26px] font-medium ${k.color}`}>{k.value}</div>
            <div className="text-[12px] font-medium text-[#1A1A19] mt-[4px] group-hover:text-[#1A3A5C] transition-colors">{k.label}</div>
            <div className="text-[11px] text-[#6B6A67] mt-[2px]">{k.sub}</div>
          </Link>
        ))}
      </div>

      {/* ── KPIs ROW 2 — Financier ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px] mb-[24px]">
        {[
          {
            label: 'Total facturé',
            value: `${formatAmount(stats.totalFacture)} FCFA`,
            color: 'text-[#1A1A19]',
            link:  '/dashboard/banques',
          },
          {
            label: 'Encaissé',
            value: `${formatAmount(stats.encaisse)} FCFA`,
            color: 'text-[#2D6A4F]',
            link:  '/dashboard/banques',
          },
          {
            label: 'En attente',
            value: `${formatAmount(stats.enAttenteFacture)} FCFA`,
            color: stats.enAttenteFacture > 0 ? 'text-[#8B4513]' : 'text-[#1A1A19]',
            link:  '/dashboard/banques',
          },
        ].map(k => (
          <Link key={k.label} href={k.link}
            className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px] hover:border-[#1A3A5C] transition-colors">
            <div className={`text-[20px] font-medium ${k.color}`}>{k.value}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[4px]">{k.label}</div>
          </Link>
        ))}
      </div>

      {/* ── GRILLE PRINCIPALE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[16px] mb-[16px]">

        {/* Activité récente (60%) */}
        <div className="lg:col-span-3 bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <div className="flex items-center justify-between p-[16px_20px] border-b border-[#E8E7E4]">
            <h2 className="text-[14px] font-medium text-[#1A1A19]">Activité récente</h2>
            <Link href="/dashboard/messages" className="text-[12px] text-[#1A3A5C] hover:underline">Voir tout →</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Aucune activité récente.</div>
          ) : (
            <div className="divide-y divide-[#E8E7E4]">
              {recentActivity.map(msg => (
                <div key={msg.id} className="flex items-start gap-[12px] p-[12px_20px]">
                  <div className={`w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[5px] ${
                    msg.direction === 'PARTNER_TO_MSP' ? 'bg-[#8B4513]' : 'bg-[#1A3A5C]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#1A1A19] truncate">
                      {msg.direction === 'PARTNER_TO_MSP' ? (
                        <><span className="font-medium">{msg.partner.orgName}</span> a envoyé : {msg.subject}</>
                      ) : (
                        <>Info transmise à <span className="font-medium">{msg.partner.orgName}</span> : {msg.subject}</>
                      )}
                    </p>
                    <span className="text-[11px] text-[#6B6A67]">{formatDate(msg.createdAt)}</span>
                  </div>
                  <Link href={`/dashboard/partners/${msg.partner.id}?tab=messages`}
                    className="text-[11px] text-[#1A3A5C] hover:underline flex-shrink-0">
                    Voir
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Étapes marchés actives (40%) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <div className="flex items-center justify-between p-[16px_20px] border-b border-[#E8E7E4]">
            <h2 className="text-[14px] font-medium text-[#1A1A19]">Étapes en cours</h2>
            <Link href="/dashboard/marche" className="text-[12px] text-[#1A3A5C] hover:underline">Voir tout →</Link>
          </div>
          {activeSteps.length === 0 ? (
            <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Aucune étape en cours.</div>
          ) : (
            <div className="divide-y divide-[#E8E7E4]">
              {activeSteps.map(step => {
                const days    = daysUntil(step.endDate);
                const isLate  = step.status === 'RETARD' || (days !== null && days < 0);
                return (
                  <div key={step.id} className="p-[12px_20px]">
                    <div className="flex items-start justify-between gap-[8px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1A1A19] truncate">{step.title}</p>
                        <p className="text-[11px] text-[#6B6A67] mt-[1px] truncate">
                          {step.market.partner.orgName} · {step.market.name}
                        </p>
                      </div>
                      <span className={`text-[11px] whitespace-nowrap flex-shrink-0 ${
                        isLate ? 'text-[#9B2335] font-medium' : 'text-[#6B6A67]'
                      }`}>
                        {days === null ? '' : days < 0 ? `${Math.abs(days)}j retard` : days === 0 ? "Auj." : `${days}j`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── PARTENAIRES RÉCENTS + DOCS EXPIRANT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[16px]">

        {/* Partenaires récents (60%) */}
        <div className="lg:col-span-3 bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <div className="flex items-center justify-between p-[16px_20px] border-b border-[#E8E7E4]">
            <h2 className="text-[14px] font-medium text-[#1A1A19]">Partenaires récents</h2>
            <Link href="/dashboard/partners" className="text-[12px] text-[#1A3A5C] hover:underline">Voir tous →</Link>
          </div>
          {recentPartners.length === 0 ? (
            <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Aucun partenaire.</div>
          ) : (
            <div className="divide-y divide-[#E8E7E4]">
              {recentPartners.map(p => (
                <Link key={p.id} href={`/dashboard/partners/${p.id}`}
                  className="flex items-center gap-[12px] p-[12px_20px] hover:bg-[#F7F7F6] transition-colors">
                  {/* Avatar initiales */}
                  <div className="w-[34px] h-[34px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[11px] font-medium text-[#1A3A5C] flex-shrink-0">
                    {p.orgName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1A1A19] truncate">{p.orgName}</div>
                    <div className="text-[11px] text-[#6B6A67]">
                      {PARTNER_TYPE_LABELS[p.type] || p.type} · {p._count.documents} docs · {p._count.markets} marchés
                    </div>
                  </div>
                  <span className={`inline-block border rounded-[4px] py-[1px] px-[6px] text-[11px] flex-shrink-0 ${STATUS_COLORS[p.status] || ''}`}>
                    {p.status === 'ACTIF' ? 'Actif' : p.status === 'INACTIF' ? 'Inactif' : 'En attente'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Documents expirant (40%) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <div className="flex items-center justify-between p-[16px_20px] border-b border-[#E8E7E4]">
            <h2 className="text-[14px] font-medium text-[#1A1A19]">Documents expirant</h2>
            <Link href="/dashboard/documents" className="text-[12px] text-[#1A3A5C] hover:underline">Voir →</Link>
          </div>
          {expiringDocs.length === 0 ? (
            <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Aucun document n&apos;expire prochainement.</div>
          ) : (
            <div className="divide-y divide-[#E8E7E4]">
              {expiringDocs.map(doc => {
                const days    = daysUntil(doc.validityDate);
                const expired = days !== null && days <= 0;
                return (
                  <div key={doc.id} className="p-[12px_20px]">
                    <div className="flex justify-between items-start gap-[8px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1A1A19] truncate">{doc.name}</p>
                        <p className="text-[11px] text-[#6B6A67] mt-[1px]">{doc.category || 'Sans catégorie'}</p>
                      </div>
                      <span className={`text-[11px] font-medium whitespace-nowrap flex-shrink-0 ${
                        expired ? 'text-[#9B2335]' : days !== null && days <= 7 ? 'text-[#9B2335]' : 'text-[#8B4513]'
                      }`}>
                        {expired ? 'Expiré' : `${days}j`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
