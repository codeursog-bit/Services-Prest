'use client';

import { useState, useEffect, useTransition } from 'react';
import { formatDate, formatDateShort, formatAmount, isOverdue } from '@/lib/utils';

interface Invoice {
  id: string; ref: string; description: string; amount: number;
  issueDate: string; dueDate: string | null; status: string;
  notes: string | null; fileUrl: string | null; reminderSentAt: string | null;
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  NON_SOLDE: { label: 'Non soldé', cls: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]' },
  EN_COURS:  { label: 'En cours',  cls: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]' },
  PAYE:      { label: 'Payé',      cls: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]' },
};

export default function BanquesTab({ partnerId }: { partnerId: string }) {
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editInv, setEditInv]     = useState<Invoice | null>(null);
  const [filter, setFilter]       = useState('Tous');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [isPending, startT]       = useTransition();

  const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[13px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
  const lc = "block text-[12px] font-medium text-[#1A1A19] mb-[5px]";

  const load = () => {
    fetch(`/api/invoices?partnerId=${partnerId}`)
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setLoading(false); });
  };

  useEffect(() => { load(); }, [partnerId]);

  const fb = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
    else    { setError(msg);   setTimeout(() => setError(''), 4000); }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const body = {
      ref:         fd.get('ref')         as string,
      description: fd.get('description') as string,
      amount:      Number(fd.get('amount')),
      issueDate:   fd.get('issueDate')   as string,
      dueDate:     fd.get('dueDate')     as string || null,
      status:      fd.get('status')      as string,
      notes:       fd.get('notes')       as string || null,
      partnerId,
    };

    setError('');
    startT(async () => {
      const url    = editInv ? `/api/invoices/${editInv.id}` : '/api/invoices';
      const method = editInv ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!data.success) { fb(data.error || 'Erreur.', false); return; }
      fb(editInv ? 'Facture modifiée.' : 'Facture créée.');
      setShowForm(false); setEditInv(null);
      (e.target as HTMLFormElement).reset(); load();
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    startT(async () => {
      await fetch(`/api/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      load();
    });
  };

  const handleDelete = (id: string, ref: string) => {
    if (!confirm(`Supprimer la facture "${ref}" ?`)) return;
    startT(async () => {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      setInvoices(prev => prev.filter(i => i.id !== id)); load();
    });
  };

  const handleReminder = (id: string, ref: string) => {
    if (!confirm(`Envoyer une relance pour "${ref}" ?`)) return;
    startT(async () => {
      const res  = await fetch(`/api/invoices/${id}/reminder`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fb('Relance envoyée.');
      else fb(data.error || 'Erreur.', false);
    });
  };

  const toDateInput = (d: string | null) => d ? new Date(d).toISOString().split('T')[0] : '';

  const filtered     = filter === 'Tous' ? invoices : invoices.filter(i => i.status === filter);
  const total        = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaye    = invoices.filter(i => i.status === 'PAYE').reduce((s, i) => s + i.amount, 0);
  const nonSolde     = invoices.filter(i => i.status !== 'PAYE').reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      {/* MÉTRIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-[20px]">
        {[
          { label: 'Total facturé',  val: formatAmount(total),     color: 'text-[#1A1A19]' },
          { label: 'Encaissé',       val: formatAmount(totalPaye), color: 'text-[#2D6A4F]' },
          { label: 'En attente',     val: formatAmount(nonSolde),  color: nonSolde > 0 ? 'text-[#8B4513]' : 'text-[#1A1A19]' },
          { label: 'Factures',       val: invoices.length,         color: 'text-[#1A1A19]' },
        ].map(k => (
          <div key={k.label} className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[14px_16px]">
            <div className={`text-[18px] font-medium ${k.color}`}>{k.val}</div>
            <div className="text-[12px] text-[#6B6A67] mt-[3px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* FEEDBACK */}
      {success && <div className="mb-[12px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[10px] text-[13px] text-[#2D6A4F]">{success}</div>}
      {error   && <div className="mb-[12px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[10px] text-[13px] text-[#9B2335]">{error}</div>}

      {/* BARRE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[10px] mb-[16px]">
        <div className="flex gap-[6px] flex-wrap">
          {['Tous', 'NON_SOLDE', 'EN_COURS', 'PAYE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`py-[5px] px-[10px] rounded-[6px] text-[12px] border transition-colors ${
                filter === f ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
              }`}>
              {f === 'Tous' ? 'Toutes' : STATUS_CFG[f]?.label}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditInv(null); }}
          className="flex-shrink-0 bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
          {showForm ? 'Annuler' : '+ Nouvelle facture'}
        </button>
      </div>

      {/* FORMULAIRE */}
      {(showForm || editInv) && (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px] mb-[20px]">
          <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">{editInv ? `Modifier ${editInv.ref}` : 'Nouvelle facture'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[14px]">
              <div>
                <label className={lc}>Référence *</label>
                <input type="text" name="ref" required defaultValue={editInv?.ref || ''}
                  placeholder="FAC-2026-001" className={ic} disabled={!!editInv} />
              </div>
              <div>
                <label className={lc}>Montant (FCFA) *</label>
                <input type="number" name="amount" required min="1" defaultValue={editInv?.amount || ''} className={ic} />
              </div>
              <div className="md:col-span-2">
                <label className={lc}>Description *</label>
                <input type="text" name="description" required defaultValue={editInv?.description || ''}
                  placeholder="Ex: Prestation technique — Janvier 2026" className={ic} />
              </div>
              <div>
                <label className={lc}>Date d&apos;émission *</label>
                <input type="date" name="issueDate" required defaultValue={toDateInput(editInv?.issueDate || null)} className={ic} />
              </div>
              <div>
                <label className={lc}>Date d&apos;échéance</label>
                <input type="date" name="dueDate" defaultValue={toDateInput(editInv?.dueDate || null)} className={ic} />
              </div>
              <div>
                <label className={lc}>Statut *</label>
                <select name="status" defaultValue={editInv?.status || 'NON_SOLDE'} className={ic}>
                  <option value="NON_SOLDE">Non soldé</option>
                  <option value="EN_COURS">En cours de paiement</option>
                  <option value="PAYE">Payé</option>
                </select>
              </div>
              <div>
                <label className={lc}>Notes</label>
                <input type="text" name="notes" defaultValue={editInv?.notes || ''}
                  placeholder="Virement initié le…" className={ic} />
              </div>
            </div>
            <div className="flex gap-[10px] justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditInv(null); }}
                className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[12px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6]">Annuler</button>
              <button type="submit" disabled={isPending}
                className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                {isPending ? 'Enregistrement…' : editInv ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Aucune facture.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
              <tr>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Référence</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Description</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[#6B6A67] text-right">Montant</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Dates</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Statut</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const late = inv.dueDate && isOverdue(inv.dueDate) && inv.status !== 'PAYE';
                const cfg  = STATUS_CFG[inv.status] || STATUS_CFG.NON_SOLDE;
                return (
                  <tr key={inv.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                    <td className="py-[12px] px-[16px]">
                      <span className="text-[13px] font-medium text-[#1A1A19]">{inv.ref}</span>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <span className="text-[12px] text-[#1A1A19] block truncate max-w-[160px]">{inv.description}</span>
                      {inv.notes && <span className="text-[11px] text-[#8B4513] italic block mt-[1px]">{inv.notes}</span>}
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <span className="text-[13px] font-medium text-[#1A1A19]">{formatAmount(inv.amount)}</span>
                      <span className="text-[11px] text-[#6B6A67] ml-[2px]">FCFA</span>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="text-[12px] text-[#6B6A67]">{formatDateShort(inv.issueDate)}</div>
                      {inv.dueDate && (
                        <div className={`text-[11px] mt-[1px] ${late ? 'text-[#9B2335] font-medium' : 'text-[#6B6A67]'}`}>
                          Éch. {formatDateShort(inv.dueDate)} {late ? '⚠' : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <select value={inv.status}
                        onChange={e => handleStatusChange(inv.id, e.target.value)}
                        disabled={isPending}
                        className={`border rounded-[4px] py-[2px] px-[6px] text-[11px] cursor-pointer focus:outline-none disabled:opacity-50 ${cfg.cls}`}>
                        <option value="NON_SOLDE">Non soldé</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="PAYE">Payé</option>
                      </select>
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <div className="flex gap-[8px] justify-end">
                        {late && (
                          <button onClick={() => handleReminder(inv.id, inv.ref)} disabled={isPending}
                            className="text-[11px] text-[#9B2335] hover:underline disabled:opacity-50">Relancer</button>
                        )}
                        <button onClick={() => { setEditInv(inv); setShowForm(false); }} disabled={isPending}
                          className="text-[12px] text-[#6B6A67] hover:underline disabled:opacity-50">Modifier</button>
                        <button onClick={() => handleDelete(inv.id, inv.ref)} disabled={isPending}
                          className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#F7F7F6]">
              <tr>
                <td colSpan={2} className="py-[10px] px-[16px] text-[12px] font-medium text-[#1A1A19]">Total</td>
                <td className="py-[10px] px-[16px] text-right">
                  <span className="text-[13px] font-medium text-[#1A1A19]">{formatAmount(filtered.reduce((s, i) => s + i.amount, 0))}</span>
                  <span className="text-[11px] text-[#6B6A67] ml-[2px]">FCFA</span>
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
