'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, formatDateShort, formatAmount } from '@/lib/utils';

interface Debt {
  id:          string;
  type:        string;
  debtorName:  string;
  motif:       string;
  amount:      number;
  status:      string;
  grantedAt:   string;
  repaidAt:    string | null;
  statusNote:  string | null;
  notes:       string | null;
  partnerId:   string | null;
  partner:     { id: string; orgName: string } | null;
  createdAt:   string;
}

interface Totals {
  totalAccorde: number; totalRembourse: number; totalNonRembourse: number;
}

const TYPE_CFG: Record<string, { label: string; cls: string }> = {
  AVANCE_SALAIRE:  { label: 'Avance sur salaire', cls: 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--msp-blue-light)]' },
  CAS_SOCIAL:      { label: 'Cas social',          cls: 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--msp-blue-light)]' },
  DETTE_ENTREPRISE:{ label: 'Dette entreprise',    cls: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' },
  AUTRE:           { label: 'Autre',               cls: 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]' },
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  ACCORDE:       { label: 'Accordé',        cls: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' },
  REMBOURSE:     { label: 'Remboursé',      cls: 'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]' },
  NON_REMBOURSE: { label: 'Non remboursé',  cls: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
  REFUSE:        { label: 'Refusé',         cls: 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-surface)]' },
};

const TYPE_FILTERS = ['Tous', 'AVANCE_SALAIRE', 'CAS_SOCIAL', 'DETTE_ENTREPRISE', 'AUTRE'];
const STATUS_FILTERS = ['Tous', 'ACCORDE', 'REMBOURSE', 'NON_REMBOURSE', 'REFUSE'];

export default function DettesPage() {
  const [debts, setDebts]     = useState<Debt[]>([]);
  const [totals, setTotals]   = useState<Totals>({ totalAccorde: 0, totalRembourse: 0, totalNonRembourse: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter]     = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [showForm, setShowForm]         = useState(false);
  const [editDebt, setEditDebt]         = useState<Debt | null>(null);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startT] = useTransition();

  const ic = "w-full px-[13px] py-[9px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[var(--accent-ring)]";
  const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]";

  const load = () => {
    const params = new URLSearchParams();
    if (typeFilter   !== 'Tous') params.set('type',   typeFilter);
    if (statusFilter !== 'Tous') params.set('status', statusFilter);
    setLoading(true);
    fetch(`/api/dettes?${params}`)
      .then(r => r.json())
      .then(d => { setDebts(d.debts || []); if (d.totals) setTotals(d.totals); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const fb = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
    else    { setError(msg);   setTimeout(() => setError(''), 4000); }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const body = {
      type:       fd.get('type')       as string,
      debtorName: fd.get('debtorName') as string,
      motif:      fd.get('motif')      as string,
      amount:     Number(fd.get('amount')),
      status:     fd.get('status')     as string,
      grantedAt:  fd.get('grantedAt')  as string,
      repaidAt:   fd.get('repaidAt')   as string || null,
      statusNote: fd.get('statusNote') as string || null,
      notes:      fd.get('notes')      as string || null,
    };

    setError('');
    startT(async () => {
      const url    = editDebt ? `/api/dettes/${editDebt.id}` : '/api/dettes';
      const method = editDebt ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!data.success) { fb(data.error || 'Erreur.', false); return; }
      fb(editDebt ? 'Dette modifiée.' : 'Dette enregistrée.');
      setShowForm(false); setEditDebt(null);
      (e.target as HTMLFormElement).reset();
      load();
    });
  };

  const handleDelete = (id: string, debtorName: string) => {
    if (!confirm(`Supprimer la dette de "${debtorName}" ?`)) return;
    startT(async () => {
      await fetch(`/api/dettes/${id}`, { method: 'DELETE' });
      fb('Dette supprimée.');
      setDebts(prev => prev.filter(d => d.id !== id));
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    startT(async () => {
      // Si remboursé, on enregistre la date du jour
      const repaidAt = status === 'REMBOURSE' ? new Date().toISOString().split('T')[0] : null;
      await fetch(`/api/dettes/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(repaidAt ? { repaidAt } : {}) }),
      });
      fb('Statut mis à jour.'); load();
    });
  };

  const toDateInput = (d: string | null) => d ? new Date(d).toISOString().split('T')[0] : '';

  return (
    <DashboardLayout pageTitle="Dettes internes">

      {/* NAVIGATION */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <Link href="/dashboard/banques"
          className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          ← Banques & Créances
        </Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[12px] text-[var(--text-primary)] font-medium">Dettes internes</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-[24px]">
        {[
          { label: 'Total accordé',       value: formatAmount(totals.totalAccorde),      color: 'text-[var(--text-primary)]',  sub: 'FCFA' },
          { label: 'Total remboursé',     value: formatAmount(totals.totalRembourse),    color: 'text-[var(--msp-green)]',  sub: 'FCFA' },
          { label: 'Reste à recouvrer',   value: formatAmount(totals.totalNonRembourse), color: totals.totalNonRembourse > 0 ? 'text-[var(--msp-red)]' : 'text-[var(--text-primary)]', sub: 'FCFA' },
        ].map(k => (
          <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[16px_20px]">
            <div className={`text-[22px] font-medium ${k.color}`}>{k.value} <span className="text-[12px] font-normal text-[var(--text-secondary)]">{k.sub}</span></div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ENCADRÉ INFO */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[8px] p-[12px_16px] mb-[20px]">
        <p className="text-[12px] text-[var(--text-secondary)]">
          Ce registre permet d&apos;évaluer la situation financière interne de l&apos;entreprise.
          Les dettes du personnel (avances, cas sociaux) sont notées manuellement — le suivi de déduction sur salaire est géré par Konza RH.
        </p>
      </div>

      {/* FEEDBACK */}
      {success && <div className="mb-[16px] bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-green)]">{success}</div>}
      {error   && <div className="mb-[16px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-red)]">{error}</div>}

      {/* FILTRES + ACTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[12px] mb-[20px]">
        <div className="flex flex-wrap gap-[8px]">
          {/* Filtre type */}
          <div className="flex flex-wrap gap-[4px]">
            {TYPE_FILTERS.map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`py-[5px] px-[10px] rounded-[8px] text-[11px] border transition-colors ${
                  typeFilter === f ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--bg-card)]' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                }`}>
                {f === 'Tous' ? 'Tous types' : TYPE_CFG[f]?.label}
              </button>
            ))}
          </div>
          {/* Filtre statut */}
          <div className="flex flex-wrap gap-[4px]">
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`py-[5px] px-[10px] rounded-[8px] text-[11px] border transition-colors ${
                  statusFilter === f ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--bg-card)]' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
                }`}>
                {f === 'Tous' ? 'Tous statuts' : STATUS_CFG[f]?.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditDebt(null); }}
          className="flex-shrink-0 bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
          + Enregistrer une dette
        </button>
      </div>

      {/* FORMULAIRE DETTE */}
      {(showForm || editDebt) && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[24px] mb-[20px]">
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-[20px]">
            {editDebt ? 'Modifier la dette' : 'Enregistrer une dette'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[16px]">
              {/* Type */}
              <div>
                <label className={lc}>Type de dette *</label>
                <select name="type" required defaultValue={editDebt?.type || ''} className={ic}>
                  <option value="">Sélectionner…</option>
                  <option value="AVANCE_SALAIRE">Avance sur salaire</option>
                  <option value="CAS_SOCIAL">Cas social</option>
                  <option value="DETTE_ENTREPRISE">Dette de l&apos;entreprise</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              {/* Nom du débiteur */}
              <div>
                <label className={lc}>Nom du débiteur / créancier *</label>
                <input type="text" name="debtorName" required
                  defaultValue={editDebt?.debtorName || ''}
                  placeholder="Ex: Jean Mbemba — Chauffeur"
                  className={ic} />
                <p className="text-[11px] text-[var(--text-secondary)] mt-[3px]">Pour le personnel : nom + fonction</p>
              </div>
              {/* Motif */}
              <div className="md:col-span-2">
                <label className={lc}>Motif *</label>
                <input type="text" name="motif" required
                  defaultValue={editDebt?.motif || ''}
                  placeholder="Ex: Avance sur salaire — Janvier 2026 / Soins médicaux famille"
                  className={ic} />
              </div>
              {/* Montant */}
              <div>
                <label className={lc}>Montant (FCFA) *</label>
                <input type="number" name="amount" required min="1"
                  defaultValue={editDebt?.amount || ''}
                  placeholder="Ex: 50000" className={ic} />
              </div>
              {/* Statut */}
              <div>
                <label className={lc}>Statut *</label>
                <select name="status" required defaultValue={editDebt?.status || 'ACCORDE'} className={ic}>
                  <option value="ACCORDE">Accordé</option>
                  <option value="REMBOURSE">Remboursé</option>
                  <option value="NON_REMBOURSE">Non remboursé</option>
                  <option value="REFUSE">Refusé</option>
                </select>
              </div>
              {/* Date accord */}
              <div>
                <label className={lc}>Accordé le *</label>
                <input type="date" name="grantedAt" required
                  defaultValue={toDateInput(editDebt?.grantedAt || null)} className={ic} />
              </div>
              {/* Date remboursement */}
              <div>
                <label className={lc}>Remboursé le</label>
                <input type="date" name="repaidAt"
                  defaultValue={toDateInput(editDebt?.repaidAt || null)} className={ic} />
                <p className="text-[11px] text-[var(--text-secondary)] mt-[3px]">Laisser vide si non encore remboursé</p>
              </div>
              {/* Motif statut (refus, non remboursé) */}
              <div className="md:col-span-2">
                <label className={lc}>Précision sur le statut</label>
                <input type="text" name="statusNote"
                  defaultValue={editDebt?.statusNote || ''}
                  placeholder="Ex: Refusé car solde insuffisant / En cours de recouvrement…"
                  className={ic} />
              </div>
              {/* Notes */}
              <div className="md:col-span-2">
                <label className={lc}>Notes internes</label>
                <textarea name="notes" rows={2}
                  defaultValue={editDebt?.notes || ''}
                  className={`${ic} resize-y`}
                  placeholder="Contexte supplémentaire…"></textarea>
              </div>
            </div>
            <div className="flex gap-[10px] justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditDebt(null); }}
                className="border border-[var(--border)] text-[var(--text-primary)] py-[8px] px-[14px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--bg-surface)]">
                Annuler
              </button>
              <button type="submit" disabled={isPending}
                className="bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] disabled:opacity-60">
                {isPending ? 'Enregistrement…' : editDebt ? 'Modifier' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTE DES DETTES */}
      <div className="msp-card overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
        ) : debts.length === 0 ? (
          <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Aucune dette enregistrée.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Débiteur / Créancier</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Type</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Motif</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Montant</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Évaluation</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Statut</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {debts.map(debt => {
                  const typeCfg   = TYPE_CFG[debt.type]   || TYPE_CFG.AUTRE;
                  const statusCfg = STATUS_CFG[debt.status] || STATUS_CFG.ACCORDE;
                  return (
                    <tr key={debt.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                      <td className="py-[13px] px-[16px]">
                        <div className="text-[13px] font-medium text-[var(--text-primary)]">{debt.debtorName}</div>
                        {debt.partner && (
                          <Link href={`/dashboard/partners/${debt.partner.id}`}
                            className="text-[11px] text-[var(--accent-primary)] hover:underline">
                            {debt.partner.orgName}
                          </Link>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <span className={`inline-block border rounded-[6px] py-[2px] px-[7px] text-[11px] ${typeCfg.cls}`}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="py-[13px] px-[16px] max-w-[200px]">
                        <span className="text-[13px] text-[var(--text-primary)] block truncate">{debt.motif}</span>
                        {debt.statusNote && (
                          <span className="text-[11px] text-[var(--msp-amber)] italic block mt-[1px] truncate">{debt.statusNote}</span>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px] text-right">
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">{formatAmount(debt.amount)}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] ml-[2px]">FCFA</span>
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <div className="text-[12px] text-[var(--text-secondary)]">Accordé : {formatDateShort(debt.grantedAt)}</div>
                        {debt.repaidAt ? (
                          <div className="text-[12px] text-[var(--msp-green)] mt-[1px]">Remboursé : {formatDateShort(debt.repaidAt)}</div>
                        ) : (
                          <div className="text-[12px] text-[var(--msp-red)] mt-[1px]">Non remboursé</div>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <select value={debt.status}
                          onChange={e => handleStatusChange(debt.id, e.target.value)}
                          disabled={isPending}
                          className={`border rounded-[6px] py-[2px] px-[6px] text-[11px] cursor-pointer focus:outline-none disabled:opacity-50 ${statusCfg.cls}`}>
                          <option value="ACCORDE">Accordé</option>
                          <option value="REMBOURSE">Remboursé</option>
                          <option value="NON_REMBOURSE">Non remboursé</option>
                          <option value="REFUSE">Refusé</option>
                        </select>
                      </td>
                      <td className="py-[13px] px-[16px] text-right">
                        <div className="flex gap-[10px] justify-end">
                          <button onClick={() => { setEditDebt(debt); setShowForm(false); }} disabled={isPending}
                            className="text-[12px] text-[var(--text-secondary)] hover:underline disabled:opacity-50">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(debt.id, debt.debtorName)} disabled={isPending}
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

      <p className="text-[12px] text-[var(--text-secondary)] mt-[12px]">
        {debts.length} enregistrement{debts.length > 1 ? 's' : ''} · Total accordé : {formatAmount(totals.totalAccorde)} FCFA
      </p>
    </DashboardLayout>
  );
}
