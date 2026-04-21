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
  EN_COURS:    { label: 'En cours',    classes: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' },
  SUSPENDU:    { label: 'Suspendu',    classes: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
  CLOTURE:     { label: 'Clôturé',     classes: 'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]' },
  CONTENTIEUX: { label: 'Contentieux', classes: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
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
          { label: 'Marchés actifs',         value: actifs,    color: 'text-[var(--text-primary)]' },
          { label: 'Taux d\'exécution moyen', value: `${tauxMoyen}%`, color: 'text-[var(--accent-primary)]' },
          { label: 'En alerte',              value: alertes,   color: alertes > 0 ? 'text-[var(--msp-red)]' : 'text-[var(--text-primary)]' },
          { label: 'Revues (30 jours)',       value: revues.length, color: 'text-[var(--msp-amber)]' },
        ].map(k => (
          <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[16px_20px]">
            <div className={`text-[24px] font-medium ${k.color}`}>{k.value}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ALERTES REVUES */}
      {revues.length > 0 && (
        <div className="bg-[var(--msp-amber-light)] border border-[var(--msp-amber)] rounded-[8px] p-[12px_16px] mb-[20px]">
          <div className="flex items-center gap-[8px] mb-[6px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--msp-amber)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[13px] font-medium text-[var(--msp-amber)]">
              {revues.length} revue{revues.length > 1 ? 's' : ''} prévue{revues.length > 1 ? 's' : ''} dans les 30 prochains jours
            </span>
          </div>
          <div className="flex flex-wrap gap-[8px]">
            {revues.map(m => (
              <Link key={m.id} href={`/dashboard/marche/${m.id}`}
                className="text-[12px] text-[var(--msp-amber)] hover:underline">
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
              className={`py-[6px] px-[12px] rounded-[8px] text-[12px] border transition-colors ${
                filter === f
                  ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--bg-card)]'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
              }`}>
              {f === 'Tous' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
        <Link href="/dashboard/marche/new"
          className="flex-shrink-0 bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
          + Nouveau marché
        </Link>
      </div>

      {/* TABLEAU */}
      <div className="msp-card overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
        ) : markets.length === 0 ? (
          <div className="p-[48px] text-center">
            <svg className="mx-auto mb-[12px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[13px] text-[var(--text-secondary)]">Aucun marché trouvé.</p>
            <Link href="/dashboard/marche/new" className="inline-block mt-[12px] text-[13px] text-[var(--accent-primary)] hover:underline">
              Créer le premier marché →
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Marché</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Partenaire</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)] w-[180px]">Avancement</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Période</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Statut</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map(m => {
                  const cfg     = STATUS_CONFIG[m.status] || STATUS_CONFIG.EN_COURS;
                  const hasAlert = getStepAlert(m.steps);
                  return (
                    <tr key={m.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                      <td className="py-[14px] px-[20px]">
                        <div className="flex items-center gap-[8px]">
                          {hasAlert && (
                            <div className="w-[6px] h-[6px] rounded-full bg-[var(--msp-red)] flex-shrink-0" title="Étape en retard"></div>
                          )}
                          <div>
                            <Link href={`/dashboard/marche/${m.id}`}
                              className="text-[13px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:underline">
                              {m.name}
                            </Link>
                            {m._count.contentieux > 0 && (
                              <span className="ml-[6px] inline-block border border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)] rounded-[3px] py-[1px] px-[6px] text-[10px]">
                                {m._count.contentieux} contentieux
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <Link href={`/dashboard/partners/${m.partner.id}`}
                          className="text-[13px] text-[var(--text-primary)] hover:underline hover:text-[var(--accent-primary)]">
                          {m.partner.orgName}
                        </Link>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <div className="flex items-center gap-[8px]">
                          <div className="flex-1 h-[6px] bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent-primary)] transition-all"
                              style={{ width: `${m.executionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-[12px] font-medium text-[var(--text-primary)] w-[36px] text-right">
                            {m.executionRate}%
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-[2px]">
                          {m.steps.filter(s => s.status === 'TERMINE').length}/{m.steps.length} étapes
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <div className="text-[12px] text-[var(--text-secondary)]">
                          {m.startDate ? formatDateShort(m.startDate) : '—'}
                          {' → '}
                          {m.endDate ? formatDateShort(m.endDate) : '—'}
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px]">
                        <span className={`inline-block border rounded-[6px] py-[2px] px-[8px] text-[12px] ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-[14px] px-[20px] text-right">
                        <div className="flex gap-[12px] justify-end">
                          <Link href={`/dashboard/marche/${m.id}`}
                            className="text-[12px] text-[var(--accent-primary)] hover:underline">
                            Voir
                          </Link>
                          <Link href={`/dashboard/marche/${m.id}/edit`}
                            className="text-[12px] text-[var(--text-secondary)] hover:underline">
                            Modifier
                          </Link>
                          <button onClick={() => handleDelete(m.id, m.name)} disabled={isPending}
                            className="text-[12px] text-[var(--msp-red)] hover:underline disabled:opacity-50">
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
