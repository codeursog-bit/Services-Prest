'use client';

import { useState, useEffect, useTransition } from 'react';
import { formatDate, formatDateShort, formatAmount, isOverdue } from '@/lib/utils';

interface Invoice {
  id: string; ref: string; description: string; amount: number;
  issueDate: string; dueDate: string | null; status: string;
  notes: string | null; fileUrl: string | null; reminderSentAt: string | null;
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  NON_SOLDE: { label: 'Non soldé', cls: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
  EN_COURS:  { label: 'En cours',  cls: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' },
  PAYE:      { label: 'Payé',      cls: 'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]' },
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

  const ic = "w-full p-[10px_14px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors";
  const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[5px]";

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
          { label: 'Total facturé',  val: formatAmount(total),     color: 'text-[var(--text-primary)]' },
          { label: 'Encaissé',       val: formatAmount(totalPaye), color: 'text-[var(--msp-green)]' },
          { label: 'En attente',     val: formatAmount(nonSolde),  color: nonSolde > 0 ? 'text-[var(--msp-amber)]' : 'text-[var(--text-primary)]' },
          { label: 'Factures',       val: invoices.length,         color: 'text-[var(--text-primary)]' },
        ].map(k => (
          <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[14px_16px]">
            <div className={`text-[18px] font-medium ${k.color}`}>{k.val}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-[3px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* FEEDBACK */}
      {success && <div className="mb-[12px] bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[10px] text-[13px] text-[var(--msp-green)]">{success}</div>}
      {error   && <div className="mb-[12px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[10px] text-[13px] text-[var(--msp-red)]">{error}</div>}

      {/* BARRE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[10px] mb-[16px]">
        <div className="flex gap-[6px] flex-wrap">
          {['Tous', 'NON_SOLDE', 'EN_COURS', 'PAYE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`py-[5px] px-[10px] rounded-[8px] text-[12px] border transition-colors ${
                filter === f ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[#FFFFFF]' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
              }`}>
              {f === 'Tous' ? 'Toutes' : STATUS_CFG[f]?.label}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditInv(null); }}
          className="flex-shrink-0 bg-[var(--accent-primary)] text-[#FFFFFF] py-[8px] px-[14px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
          {showForm ? 'Annuler' : '+ Nouvelle facture'}
        </button>
      </div>

      {/* FORMULAIRE */}
      {(showForm || editInv) && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[20px] mb-[20px]">
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-[16px]">{editInv ? `Modifier ${editInv.ref}` : 'Nouvelle facture'}</h3>
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
                className="border border-[var(--border)] text-[var(--text-primary)] py-[8px] px-[12px] rounded-[8px] text-[12px] hover:bg-[var(--bg-surface)]">Annuler</button>
              <button type="submit" disabled={isPending}
                className="bg-[var(--accent-primary)] text-[#FFFFFF] py-[8px] px-[14px] rounded-[8px] text-[12px] font-medium hover:bg-[var(--msp-blue-mid)] disabled:opacity-60">
                {isPending ? 'Enregistrement…' : editInv ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[32px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-[32px] text-center text-[13px] text-[var(--text-secondary)]">Aucune facture.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
              <tr>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Référence</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Description</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Montant</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Dates</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)]">Statut</th>
                <th className="py-[11px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const late = inv.dueDate && isOverdue(inv.dueDate) && inv.status !== 'PAYE';
                const cfg  = STATUS_CFG[inv.status] || STATUS_CFG.NON_SOLDE;
                return (
                  <tr key={inv.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                    <td className="py-[12px] px-[16px]">
                      <span className="text-[13px] font-medium text-[var(--text-primary)]">{inv.ref}</span>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <span className="text-[12px] text-[var(--text-primary)] block truncate max-w-[160px]">{inv.description}</span>
                      {inv.notes && <span className="text-[11px] text-[var(--msp-amber)] italic block mt-[1px]">{inv.notes}</span>}
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <span className="text-[13px] font-medium text-[var(--text-primary)]">{formatAmount(inv.amount)}</span>
                      <span className="text-[11px] text-[var(--text-secondary)] ml-[2px]">FCFA</span>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="text-[12px] text-[var(--text-secondary)]">{formatDateShort(inv.issueDate)}</div>
                      {inv.dueDate && (
                        <div className={`text-[11px] mt-[1px] ${late ? 'text-[var(--msp-red)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                          Éch. {formatDateShort(inv.dueDate)} {late ? '⚠' : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <select value={inv.status}
                        onChange={e => handleStatusChange(inv.id, e.target.value)}
                        disabled={isPending}
                        className={`border rounded-[6px] py-[2px] px-[6px] text-[11px] cursor-pointer focus:outline-none disabled:opacity-50 ${cfg.cls}`}>
                        <option value="NON_SOLDE">Non soldé</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="PAYE">Payé</option>
                      </select>
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <div className="flex gap-[8px] justify-end">
                        {late && (
                          <button onClick={() => handleReminder(inv.id, inv.ref)} disabled={isPending}
                            className="text-[11px] text-[var(--msp-red)] hover:underline disabled:opacity-50">Relancer</button>
                        )}
                        <button onClick={() => { setEditInv(inv); setShowForm(false); }} disabled={isPending}
                          className="text-[12px] text-[var(--text-secondary)] hover:underline disabled:opacity-50">Modifier</button>
                        <button onClick={() => handleDelete(inv.id, inv.ref)} disabled={isPending}
                          className="text-[12px] text-[var(--msp-red)] hover:underline disabled:opacity-50">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[var(--bg-surface)]">
              <tr>
                <td colSpan={2} className="py-[10px] px-[16px] text-[12px] font-medium text-[var(--text-primary)]">Total</td>
                <td className="py-[10px] px-[16px] text-right">
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">{formatAmount(filtered.reduce((s, i) => s + i.amount, 0))}</span>
                  <span className="text-[11px] text-[var(--text-secondary)] ml-[2px]">FCFA</span>
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
