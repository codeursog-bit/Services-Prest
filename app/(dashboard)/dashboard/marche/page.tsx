'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, formatDateShort } from '@/lib/utils';

interface Market {
  id:            string;
  name:          string;
  status:        string;
  executionRate: number;
  startDate:     string | null;
  endDate:       string | null;
  nextReviewDate:string | null;
  partner:       { id: string; orgName: string; type: string };
  steps:         { status: string; endDate: string }[];
  _count:        { notes: number; contentieux: number };
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  EN_COURS:    { label: 'En cours',    classes: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]' },
  SUSPENDU:    { label: 'Suspendu',    classes: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]' },
  CLOTURE:     { label: 'Clôturé',     classes: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]' },
  CONTENTIEUX: { label: 'Contentieux', classes: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]' },
};

const FILTERS = ['Tous', 'EN_COURS', 'SUSPENDU', 'CLOTURE', 'CONTENTIEUX'];

export default function MarchePage() {
  const [markets, setMarkets]   = useState<Market[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('Tous');
  const [isPending, startT]     = useTransition();

  useEffect(() => {
    const params = filter !== 'Tous' ? `?status=${filter}` : '';
    setLoading(true);
    fetch(`/api/marche${params}`)
      .then(r => r.json())
      .then(d => { setMarkets(d.markets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer le marché "${name}" ? Toutes les étapes, notes et contentieux seront supprimés.`)) return;
    startT(async () => {
      await fetch(`/api/marche/${id}`, { method: 'DELETE' });
      setMarkets(prev => prev.filter(m => m.id !== id));
    });
  };

  // KPIs
  const total      = markets.length;
  const actifs     = markets.filter(m => m.status === 'EN_COURS').length;
  const alertes    = markets.filter(m => m._count.contentieux > 0 || m.status === 'SUSPENDU').length;
  const tauxMoyen  = total > 0
    ? Math.round(markets.reduce((s, m) => s + m.executionRate, 0) / total)
    : 0;

  // Revues prochaines (30 jours)
  const now = new Date();
  const revues = markets.filter(m => {
    if (!m.nextReviewDate) return false;
    const d = new Date(m.nextReviewDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  const getStepAlert = (steps: Market['steps']) => {
    const today = new Date();
    return steps.some(s => {
      if (s.status === 'TERMINE') return false;
      const end = new Date(s.endDate);
      return end < today;
    });
  };

  return (
    <DashboardLayout pageTitle="Suivi des marchés">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[24px]">
        {[
          { label: 'Marchés actifs',         value: actifs,    color: 'text-[#1A1A19]' },
          { label: 'Taux d\'exécution moyen', value: `${tauxMoyen}%`, color: 'text-[#1A3A5C]' },
          { label: 'En alerte',              value: alertes,   color: alertes > 0 ? 'text-[#9B2335]' : 'text-[#1A1A19]' },
          { label: 'Revues (30 jours)',       value: revues.length, color: 'text-[#8B4513]' },
        ].map(k => (
          <div key={k.label} className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
            <div className={`text-[24px] font-medium ${k.color}`}>{k.value}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[4px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ALERTES REVUES */}
      {revues.length > 0 && (
        <div className="bg-[#FEF3E2] border border-[#8B4513] rounded-[8px] p-[12px_16px] mb-[20px]">
          <div className="flex items-center gap-[8px] mb-[6px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[13px] font-medium text-[#8B4513]">
              {revues.length} revue{revues.length > 1 ? 's' : ''} prévue{revues.length > 1 ? 's' : ''} dans les 30 prochains jours
            </span>
          </div>
          <div className="flex flex-wrap gap-[8px]">
            {revues.map(m => (
              <Link key={m.id} href={`/dashboard/marche/${m.id}`}
                className="text-[12px] text-[#8B4513] hover:underline">
                {m.name} ({m.partner.orgName}) — {formatDateShort(m.nextReviewDate)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* BARRE ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[12px] mb-[20px]">
        <div className="flex flex-wrap gap-[6px]">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`py-[6px] px-[12px] rounded-[6px] text-[12px] border transition-colors ${
                filter === f
                  ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
              }`}>
              {f === 'Tous' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
        <Link href="/dashboard/marche/new"
          className="flex-shrink-0 bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
          + Nouveau marché
        </Link>
      </div>

      {/* TABLEAU */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
        ) : markets.length === 0 ? (
          <div className="p-[48px] text-center">
            <svg className="mx-auto mb-[12px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8E7E4" strokeWidth="1.2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[13px] text-[#6B6A67]">Aucun marché trouvé.</p>
            <Link href="/dashboard/marche/new" className="inline-block mt-[12px] text-[13px] text-[#1A3A5C] hover:underline">
              Créer le premier marché →
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                <tr>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Marché</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Partenaire</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] w-[180px]">Avancement</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Période</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Statut</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map(m => {
                  const cfg     = STATUS_CONFIG[m.status] || STATUS_CONFIG.EN_COURS;
                  const hasAlert = getStepAlert(m.steps);
                  return (
                    <tr key={m.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                      <td className="py-[14px] px-[20px]">
                        <div className="flex items-center gap-[8px]">
                          {hasAlert && (
                            <div className="w-[6px] h-[6px] rounded-full bg-[#9B2335] flex-shrink-0" title="Étape en retard"></div>
                          )}
                          <div>
                            <Link href={`/dashboard/marche/${m.id}`}
                              className="text-[13px] font-medium text-[#1A1A19] hover:text-[#1A3A5C] hover:underline">
                              {m.name}
                            </Link>
                            {m._count.contentieux > 0 && (
                              <span className="ml-[6px] inline-block border border-[#9B2335] text-[#9B2335] bg-[#FCEBEB] rounded-[3px] py-[1px] px-[6px] text-[10px]">
                                {m._count.contentieux} contentieux
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <Link href={`/dashboard/partners/${m.partner.id}`}
                          className="text-[13px] text-[#1A1A19] hover:underline hover:text-[#1A3A5C]">
                          {m.partner.orgName}
                        </Link>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <div className="flex items-center gap-[8px]">
                          <div className="flex-1 h-[6px] bg-[#E8E7E4] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1A3A5C] transition-all"
                              style={{ width: `${m.executionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-[12px] font-medium text-[#1A1A19] w-[36px] text-right">
                            {m.executionRate}%
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6B6A67] mt-[2px]">
                          {m.steps.filter(s => s.status === 'TERMINE').length}/{m.steps.length} étapes
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <div className="text-[12px] text-[#6B6A67]">
                          {m.startDate ? formatDateShort(m.startDate) : '—'}
                          {' → '}
                          {m.endDate ? formatDateShort(m.endDate) : '—'}
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <span className={`inline-block border rounded-[4px] py-[2px] px-[8px] text-[12px] ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-[14px] px-[20px] text-right">
                        <div className="flex gap-[12px] justify-end">
                          <Link href={`/dashboard/marche/${m.id}`}
                            className="text-[12px] text-[#1A3A5C] hover:underline">
                            Voir
                          </Link>
                          <Link href={`/dashboard/marche/${m.id}/edit`}
                            className="text-[12px] text-[#6B6A67] hover:underline">
                            Modifier
                          </Link>
                          <button onClick={() => handleDelete(m.id, m.name)} disabled={isPending}
                            className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
