'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { STATUS_COLORS, PARTNER_TYPE_LABELS, PARTNER_STATUS_LABELS } from '@/lib/utils';

interface Partner {
  id:          string;
  orgName:     string;
  contactName: string;
  email:       string;
  type:        string;
  sector:      string | null;
  status:      string;
  createdAt:   string;
  _count: {
    documents: number;
    messages:  number;
    invoices:  number;
    markets:   number;
  };
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

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'Tous')   params.set('type',   filter);
    if (debouncedSearch)     params.set('search', debouncedSearch);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[16px] mb-[24px]">
        <div className="flex flex-col xl:flex-row gap-[12px] items-start xl:items-center w-full">
          {/* Recherche */}
          <div className="relative">
            <svg className="absolute left-[10px] top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un partenaire…"
              className="w-full sm:w-[280px] py-[8px] pr-[14px] pl-[36px] border border-[#E8E7E4] rounded-[6px] text-[13px] text-[#1A1A19] bg-[#FFFFFF] focus:outline-none focus:border-[#1A3A5C] transition-colors"
            />
          </div>
          {/* Filtres */}
          <div className="flex flex-wrap gap-[6px]">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`py-[6px] px-[12px] rounded-[6px] text-[12px] border transition-colors ${
                  filter === f ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
                }`}
              >{FILTER_LABELS[f]}</button>
            ))}
          </div>
        </div>
        <Link href="/dashboard/partners/new"
          className="flex-shrink-0 bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
          + Ajouter un partenaire
        </Link>
      </div>

      {/* TABLEAU */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
        ) : partners.length === 0 ? (
          <div className="p-[48px] text-center">
            <svg className="mx-auto mb-[12px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8E7E4" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/>
            </svg>
            <p className="text-[13px] text-[#6B6A67]">Aucun partenaire{filter !== 'Tous' ? ` de type "${FILTER_LABELS[filter]}"` : ''} trouvé.</p>
            <Link href="/dashboard/partners/new" className="inline-block mt-[12px] text-[13px] text-[#1A3A5C] hover:underline">
              Créer le premier partenaire →
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                <tr>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Organisation</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Type</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Secteur</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Docs</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Marchés</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Statut</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6] transition-colors">
                    <td className="py-[14px] px-[20px]">
                      <div className="flex items-center gap-[10px]">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[11px] font-medium text-[#1A3A5C] flex-shrink-0">
                          {p.orgName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-[#1A1A19]">{p.orgName}</div>
                          <div className="text-[11px] text-[#6B6A67]">{p.contactName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-[14px] px-[20px]">
                      <span className="inline-block border border-[#E8E7E4] text-[#6B6A67] py-[2px] px-[8px] rounded-[4px] text-[12px]">
                        {PARTNER_TYPE_LABELS[p.type] || p.type}
                      </span>
                    </td>
                    <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{p.sector || '—'}</td>
                    <td className="py-[14px] px-[20px] text-[13px] text-[#1A1A19]">{p._count.documents}</td>
                    <td className="py-[14px] px-[20px] text-[13px] text-[#1A1A19]">{p._count.markets}</td>
                    <td className="py-[14px] px-[20px]">
                      <span className={`inline-block border rounded-[4px] py-[2px] px-[8px] text-[12px] ${STATUS_COLORS[p.status] || ''}`}>
                        {PARTNER_STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-[14px] px-[20px] text-right">
                      <div className="flex gap-[12px] justify-end">
                        <Link href={`/dashboard/partners/${p.id}`} className="text-[12px] text-[#1A3A5C] hover:underline">
                          Voir
                        </Link>
                        <Link href={`/dashboard/partners/${p.id}/edit`} className="text-[12px] text-[#6B6A67] hover:underline">
                          Modifier
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.orgName)} disabled={isPending}
                          className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50">
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

      {/* COMPTEUR */}
      {!loading && partners.length > 0 && (
        <p className="text-[12px] text-[#6B6A67] mt-[12px]">
          {partners.length} partenaire{partners.length > 1 ? 's' : ''} affiché{partners.length > 1 ? 's' : ''}
        </p>
      )}
    </DashboardLayout>
  );
}
