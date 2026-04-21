'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { formatDateShort, formatDate } from '@/lib/utils';

interface Market {
  id:            string;
  name:          string;
  status:        string;
  executionRate: number;
  startDate:     string | null;
  endDate:       string | null;
  steps:         { status: string; endDate: string }[];
  _count:        { notes: number; contentieux: number };
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  EN_COURS:    { label: 'En cours',    cls: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' },
  SUSPENDU:    { label: 'Suspendu',    cls: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
  CLOTURE:     { label: 'Clôturé',     cls: 'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]' },
  CONTENTIEUX: { label: 'Contentieux', cls: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
};

export default function MarcheTab({ partnerId }: { partnerId: string }) {
  const [markets, setMarkets]   = useState<Market[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isPending, startT]     = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const ic = "w-full p-[10px_14px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors";
  const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]";

  useEffect(() => {
    fetch(`/api/marche?partnerId=${partnerId}`)
      .then(r => r.json())
      .then(d => { setMarkets(d.markets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [partnerId]);

  const reload = () => {
    fetch(`/api/marche?partnerId=${partnerId}`)
      .then(r => r.json())
      .then(d => setMarkets(d.markets || []));
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const body = {
      partnerId,
      name:      fd.get('name')      as string,
      description: fd.get('description') as string,
      startDate: fd.get('startDate') as string,
      endDate:   fd.get('endDate')   as string,
      status:    'EN_COURS',
    };

    if (!body.name) { setError('Nom requis.'); return; }
    setError('');

    startT(async () => {
      const res  = await fetch('/api/marche', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Erreur.'); return; }
      setSuccess('Marché créé.'); setShowForm(false);
      (e.target as HTMLFormElement).reset();
      reload();
      setTimeout(() => setSuccess(''), 3000);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer le marché "${name}" ?`)) return;
    startT(async () => {
      await fetch(`/api/marche/${id}`, { method: 'DELETE' });
      setMarkets(prev => prev.filter(m => m.id !== id));
    });
  };

  return (
    <div>
      {/* BARRE */}
      <div className="flex justify-between items-center mb-[16px]">
        <p className="text-[13px] text-[var(--text-secondary)]">{markets.length} marché{markets.length > 1 ? 's' : ''} avec ce partenaire</p>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[var(--accent-primary)] text-[#FFFFFF] py-[8px] px-[14px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
          {showForm ? 'Annuler' : '+ Nouveau marché'}
        </button>
      </div>

      {/* FEEDBACK */}
      {error   && <div className="mb-[12px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[10px] text-[13px] text-[var(--msp-red)]">{error}</div>}
      {success && <div className="mb-[12px] bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[10px] text-[13px] text-[var(--msp-green)]">{success}</div>}

      {/* FORM CRÉATION RAPIDE */}
      {showForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[20px] mb-[20px]">
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-[16px]">Créer un marché</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[14px]">
              <div className="md:col-span-2">
                <label className={lc}>Nom du marché *</label>
                <input type="text" name="name" required placeholder="Ex: Construction bloc B" className={ic} />
              </div>
              <div>
                <label className={lc}>Date de début</label>
                <input type="date" name="startDate" className={ic} />
              </div>
              <div>
                <label className={lc}>Date de fin prévisionnelle</label>
                <input type="date" name="endDate" className={ic} />
              </div>
              <div className="md:col-span-2">
                <label className={lc}>Description</label>
                <textarea name="description" rows={2} className={`${ic} resize-y`} placeholder="Contexte, objectifs…"></textarea>
              </div>
            </div>
            <div className="flex gap-[10px] justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-[var(--border)] text-[var(--text-primary)] py-[8px] px-[14px] rounded-[8px] text-[12px] hover:bg-[var(--bg-surface)]">
                Annuler
              </button>
              <button type="submit" disabled={isPending}
                className="bg-[var(--accent-primary)] text-[#FFFFFF] py-[8px] px-[14px] rounded-[8px] text-[12px] font-medium hover:bg-[var(--msp-blue-mid)] disabled:opacity-60">
                {isPending ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTE MARCHÉS */}
      {loading ? (
        <div className="p-[32px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
      ) : markets.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[40px] text-center text-[13px] text-[var(--text-secondary)]">
          Aucun marché avec ce partenaire.
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {markets.map(m => {
            const cfg   = STATUS_CFG[m.status] || STATUS_CFG.EN_COURS;
            const done  = m.steps.filter(s => s.status === 'TERMINE').length;
            const late  = m.steps.filter(s => s.status !== 'TERMINE' && s.status !== 'ANNULE' && new Date(s.endDate) < new Date()).length;
            return (
              <div key={m.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[16px_20px]">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-[12px]">
                  <div className="flex-1">
                    <div className="flex items-center gap-[8px] flex-wrap mb-[4px]">
                      <Link href={`/dashboard/marche/${m.id}`}
                        className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:underline">
                        {m.name}
                      </Link>
                      <span className={`inline-block border rounded-[6px] py-[1px] px-[6px] text-[11px] ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      {m._count.contentieux > 0 && (
                        <span className="inline-block border border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)] rounded-[3px] py-[1px] px-[6px] text-[10px]">
                          {m._count.contentieux} contentieux
                        </span>
                      )}
                    </div>

                    {/* Barre progression */}
                    <div className="flex items-center gap-[8px] mt-[8px]">
                      <div className="flex-1 h-[5px] bg-[#E8E7E4] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-primary)] transition-all" style={{ width: `${m.executionRate}%` }}></div>
                      </div>
                      <span className="text-[12px] font-medium text-[var(--text-primary)] w-[36px] text-right">{m.executionRate}%</span>
                    </div>

                    <div className="flex flex-wrap gap-[12px] mt-[6px] text-[12px] text-[var(--text-secondary)]">
                      <span>{done}/{m.steps.length} étapes</span>
                      {late > 0 && <span className="text-[var(--msp-red)]">{late} en retard</span>}
                      {m.startDate && <span>{formatDateShort(m.startDate)} → {m.endDate ? formatDateShort(m.endDate) : '?'}</span>}
                    </div>
                  </div>

                  <div className="flex gap-[8px] flex-shrink-0">
                    <Link href={`/dashboard/marche/${m.id}`}
                      className="text-[12px] text-[var(--accent-primary)] hover:underline">
                      Détail
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
