'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { STATUS_COLORS, PARTNER_TYPE_LABELS, PARTNER_STATUS_LABELS } from '@/lib/utils';
import { ic, lc, card, btnPrimary, btnSecondary, filterActive, filterInactive, th, tr, td, STATUS_BADGE, feedbackOk, feedbackErr } from '@/lib/dash-styles';

interface Partner {
  id: string; orgName: string; contactName: string; email: string;
  type: string; sector: string | null; status: string; createdAt: string;
  _count: { documents: number; messages: number; invoices: number; markets: number };
}

const FILTERS = ['Tous', 'CLIENT', 'FOURNISSEUR', 'SOUS_TRAITANT', 'PRESTATAIRE'];
const FILTER_LABELS: Record<string, string> = {
  Tous: 'Tous', CLIENT: 'Clients', FOURNISSEUR: 'Fournisseurs',
  SOUS_TRAITANT: 'Sous-traitants', PRESTATAIRE: 'Prestataires',
};

export default function PartnersPage() {
  const [partners, setPartners]   = useState<Partner[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('Tous');
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'Tous') params.set('type', filter);
    if (debouncedSearch)   params.set('search', debouncedSearch);
    setLoading(true);
    fetch(`/api/partners?${params}`)
      .then(r => r.json())
      .then(d => { setPartners(d.partners || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter, debouncedSearch]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer le partenaire "${name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      setPartners(prev => prev.filter(p => p.id !== id));
    });
  };

  return (
    <DashboardLayout pageTitle="Mes partenaires">

      {/* TOPBAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-[14px] mb-[24px]">
        <div className="flex flex-col sm:flex-row gap-[10px] items-start sm:items-center flex-1">
          {/* Recherche */}
          <div className="relative">
            <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un partenaire…"
              className={`${ic} w-[260px] pl-[36px] py-[8px]`} />
          </div>
          {/* Filtres */}
          <div className="flex flex-wrap gap-[6px]">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`py-[5px] px-[12px] rounded-[8px] text-[12px] border font-medium transition-all ${filter === f ? filterActive : filterInactive}`}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <Link href="/dashboard/partners/new"
          className={`${btnPrimary} flex-shrink-0`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter un partenaire
        </Link>
      </div>

      {/* TABLEAU */}
      <div className={card}>
        {loading ? (
          <div className="p-[48px] text-center text-[13px]" style={{ color: 'var(--text-secondary)' }}>Chargement…</div>
        ) : partners.length === 0 ? (
          <div className="p-[56px] text-center">
            <svg className="mx-auto mb-[14px]" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/>
            </svg>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              Aucun partenaire{filter !== 'Tous' ? ` de type "${FILTER_LABELS[filter]}"` : ''} trouvé.
            </p>
            <Link href="/dashboard/partners/new"
              className="inline-block mt-[12px] text-[13px] font-medium transition-colors"
              style={{ color: 'var(--accent-primary)' }}>
              Créer le premier partenaire →
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className={th}>Organisation</th>
                  <th className={th}>Type</th>
                  <th className={th}>Secteur</th>
                  <th className={th}>Docs</th>
                  <th className={th}>Marchés</th>
                  <th className={th}>Statut</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id} className={tr}>
                    <td className={td}>
                      <div className="flex items-center gap-[10px]">
                        <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--msp-blue), var(--accent-orange))' }}>
                          {p.orgName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.orgName}</div>
                          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.contactName}</div>
                        </div>
                      </div>
                    </td>
                    <td className={td}>
                      <span className="inline-block px-[8px] py-[2px] rounded-[6px] text-[11px] font-medium"
                        style={{ background: 'var(--msp-blue-light)', color: 'var(--msp-blue)' }}>
                        {PARTNER_TYPE_LABELS[p.type] || p.type}
                      </span>
                    </td>
                    <td className={`${td} text-[12px]`} style={{ color: 'var(--text-secondary)' }}>{p.sector || '—'}</td>
                    <td className={`${td} text-[13px]`} style={{ color: 'var(--text-primary)' }}>{p._count.documents}</td>
                    <td className={`${td} text-[13px]`} style={{ color: 'var(--text-primary)' }}>{p._count.markets}</td>
                    <td className={td}>
                      <span className={`inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[11px] font-medium ${STATUS_BADGE[p.status] || ''}`}>
                        {PARTNER_STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex gap-[10px] justify-end items-center">
                        <Link href={`/dashboard/partners/${p.id}`}
                          className="text-[12px] font-medium transition-colors hover:underline"
                          style={{ color: 'var(--accent-primary)' }}>
                          Voir
                        </Link>
                        <Link href={`/dashboard/partners/${p.id}/edit`}
                          className="text-[12px] transition-colors hover:underline"
                          style={{ color: 'var(--text-secondary)' }}>
                          Modifier
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.orgName)} disabled={isPending}
                          className="text-[12px] transition-colors hover:underline disabled:opacity-50"
                          style={{ color: 'var(--msp-red)' }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && partners.length > 0 && (
        <p className="text-[12px] mt-[10px]" style={{ color: 'var(--text-muted)' }}>
          {partners.length} partenaire{partners.length > 1 ? 's' : ''} affiché{partners.length > 1 ? 's' : ''}
        </p>
      )}
    </DashboardLayout>
  );
}
