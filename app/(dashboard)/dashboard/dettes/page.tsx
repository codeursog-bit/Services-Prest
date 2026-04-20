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
  AVANCE_SALAIRE:  { label: 'Avance sur salaire', cls: 'border-[#1A3A5C] text-[#1A3A5C] bg-[#E8EEF5]' },
  CAS_SOCIAL:      { label: 'Cas social',          cls: 'border-[#534AB7] text-[#534AB7] bg-[#EEEDFE]' },
  DETTE_ENTREPRISE:{ label: 'Dette entreprise',    cls: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]' },
  AUTRE:           { label: 'Autre',               cls: 'border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6]' },
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  ACCORDE:       { label: 'Accordé',        cls: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]' },
  REMBOURSE:     { label: 'Remboursé',      cls: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]' },
  NON_REMBOURSE: { label: 'Non remboursé',  cls: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]' },
  REFUSE:        { label: 'Refusé',         cls: 'border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6]' },
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

  const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
  const lc = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

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
          className="text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors">
          ← Banques & Créances
        </Link>
        <span className="text-[#E8E7E4]">/</span>
        <span className="text-[12px] text-[#1A1A19] font-medium">Dettes internes</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-[24px]">
        {[
          { label: 'Total accordé',       value: formatAmount(totals.totalAccorde),      color: 'text-[#1A1A19]',  sub: 'FCFA' },
          { label: 'Total remboursé',     value: formatAmount(totals.totalRembourse),    color: 'text-[#2D6A4F]',  sub: 'FCFA' },
          { label: 'Reste à recouvrer',   value: formatAmount(totals.totalNonRembourse), color: totals.totalNonRembourse > 0 ? 'text-[#9B2335]' : 'text-[#1A1A19]', sub: 'FCFA' },
        ].map(k => (
          <div key={k.label} className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
            <div className={`text-[22px] font-medium ${k.color}`}>{k.value} <span className="text-[12px] font-normal text-[#6B6A67]">{k.sub}</span></div>
            <div className="text-[12px] text-[#6B6A67] mt-[4px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ENCADRÉ INFO */}
      <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[12px_16px] mb-[20px]">
        <p className="text-[12px] text-[#6B6A67]">
          Ce registre permet d&apos;évaluer la situation financière interne de l&apos;entreprise.
          Les dettes du personnel (avances, cas sociaux) sont notées manuellement — le suivi de déduction sur salaire est géré par Konza RH.
        </p>
      </div>

      {/* FEEDBACK */}
      {success && <div className="mb-[16px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[10px_14px] text-[13px] text-[#2D6A4F]">{success}</div>}
      {error   && <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[10px_14px] text-[13px] text-[#9B2335]">{error}</div>}

      {/* FILTRES + ACTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[12px] mb-[20px]">
        <div className="flex flex-wrap gap-[8px]">
          {/* Filtre type */}
          <div className="flex flex-wrap gap-[4px]">
            {TYPE_FILTERS.map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`py-[5px] px-[10px] rounded-[6px] text-[11px] border transition-colors ${
                  typeFilter === f ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
                }`}>
                {f === 'Tous' ? 'Tous types' : TYPE_CFG[f]?.label}
              </button>
            ))}
          </div>
          {/* Filtre statut */}
          <div className="flex flex-wrap gap-[4px]">
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`py-[5px] px-[10px] rounded-[6px] text-[11px] border transition-colors ${
                  statusFilter === f ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
                }`}>
                {f === 'Tous' ? 'Tous statuts' : STATUS_CFG[f]?.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditDebt(null); }}
          className="flex-shrink-0 bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
          + Enregistrer une dette
        </button>
      </div>

      {/* FORMULAIRE DETTE */}
      {(showForm || editDebt) && (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px] mb-[20px]">
          <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[20px]">
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
                <p className="text-[11px] text-[#6B6A67] mt-[3px]">Pour le personnel : nom + fonction</p>
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
                <p className="text-[11px] text-[#6B6A67] mt-[3px]">Laisser vide si non encore remboursé</p>
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
                className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[14px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6]">
                Annuler
              </button>
              <button type="submit" disabled={isPending}
                className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                {isPending ? 'Enregistrement…' : editDebt ? 'Modifier' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTE DES DETTES */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
        ) : debts.length === 0 ? (
          <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Aucune dette enregistrée.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                <tr>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Débiteur / Créancier</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Type</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Motif</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67] text-right">Montant</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Évaluation</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Statut</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {debts.map(debt => {
                  const typeCfg   = TYPE_CFG[debt.type]   || TYPE_CFG.AUTRE;
                  const statusCfg = STATUS_CFG[debt.status] || STATUS_CFG.ACCORDE;
                  return (
                    <tr key={debt.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                      <td className="py-[13px] px-[16px]">
                        <div className="text-[13px] font-medium text-[#1A1A19]">{debt.debtorName}</div>
                        {debt.partner && (
                          <Link href={`/dashboard/partners/${debt.partner.id}`}
                            className="text-[11px] text-[#1A3A5C] hover:underline">
                            {debt.partner.orgName}
                          </Link>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <span className={`inline-block border rounded-[4px] py-[2px] px-[7px] text-[11px] ${typeCfg.cls}`}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="py-[13px] px-[16px] max-w-[200px]">
                        <span className="text-[13px] text-[#1A1A19] block truncate">{debt.motif}</span>
                        {debt.statusNote && (
                          <span className="text-[11px] text-[#8B4513] italic block mt-[1px] truncate">{debt.statusNote}</span>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px] text-right">
                        <span className="text-[13px] font-medium text-[#1A1A19]">{formatAmount(debt.amount)}</span>
                        <span className="text-[11px] text-[#6B6A67] ml-[2px]">FCFA</span>
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <div className="text-[12px] text-[#6B6A67]">Accordé : {formatDateShort(debt.grantedAt)}</div>
                        {debt.repaidAt ? (
                          <div className="text-[12px] text-[#2D6A4F] mt-[1px]">Remboursé : {formatDateShort(debt.repaidAt)}</div>
                        ) : (
                          <div className="text-[12px] text-[#9B2335] mt-[1px]">Non remboursé</div>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <select value={debt.status}
                          onChange={e => handleStatusChange(debt.id, e.target.value)}
                          disabled={isPending}
                          className={`border rounded-[4px] py-[2px] px-[6px] text-[11px] cursor-pointer focus:outline-none disabled:opacity-50 ${statusCfg.cls}`}>
                          <option value="ACCORDE">Accordé</option>
                          <option value="REMBOURSE">Remboursé</option>
                          <option value="NON_REMBOURSE">Non remboursé</option>
                          <option value="REFUSE">Refusé</option>
                        </select>
                      </td>
                      <td className="py-[13px] px-[16px] text-right">
                        <div className="flex gap-[10px] justify-end">
                          <button onClick={() => { setEditDebt(debt); setShowForm(false); }} disabled={isPending}
                            className="text-[12px] text-[#6B6A67] hover:underline disabled:opacity-50">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(debt.id, debt.debtorName)} disabled={isPending}
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

      <p className="text-[12px] text-[#6B6A67] mt-[12px]">
        {debts.length} enregistrement{debts.length > 1 ? 's' : ''} · Total accordé : {formatAmount(totals.totalAccorde)} FCFA
      </p>
    </DashboardLayout>
  );
}
