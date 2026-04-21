'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, formatDateShort, formatAmount, isOverdue } from '@/lib/utils';

interface Invoice {
  id:          string;
  ref:         string;
  description: string;
  amount:      number;
  issueDate:   string;
  dueDate:     string | null;
  status:      string;
  notes:       string | null;
  fileUrl:     string | null;
  reminderSentAt: string | null;
  partnerId:   string;
  partner:     { id: string; orgName: string; type: string };
}

interface Totals {
  total: number; totalPaye: number;
  totalEnCours: number; totalNonSolde: number; enRetard: number;
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  NON_SOLDE: { label: 'Non soldé',  cls: 'border-[var(--msp-red)] text-[var(--msp-red)] bg-[var(--msp-red-light)]' },
  EN_COURS:  { label: 'En cours',   cls: 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' },
  PAYE:      { label: 'Payé',       cls: 'border-[var(--msp-green)] text-[var(--msp-green)] bg-[var(--msp-green-light)]' },
};

const FILTERS = ['Tous', 'NON_SOLDE', 'EN_COURS', 'PAYE'];

export default function BanquesPage() {
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [totals, setTotals]       = useState<Totals>({ total: 0, totalPaye: 0, totalEnCours: 0, totalNonSolde: 0, enRetard: 0 });
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('Tous');
  const [showForm, setShowForm]   = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [partners, setPartners]   = useState<{ id: string; orgName: string }[]>([]);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [isPending, startT]       = useTransition();

  const ic = "w-full px-[13px] py-[9px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[var(--accent-ring)]";
  const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]";

  const load = (s = filter) => {
    const q = s !== 'Tous' ? `?status=${s}` : '';
    fetch(`/api/invoices${q}`)
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); if (d.totals) setTotals(d.totals); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(d.partners || []));
  }, []);

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
      partnerId:   fd.get('partnerId')   as string,
    };

    setError('');
    startT(async () => {
      const url    = editInvoice ? `/api/invoices/${editInvoice.id}` : '/api/invoices';
      const method = editInvoice ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!data.success) { fb(data.error || 'Erreur.', false); return; }
      fb(editInvoice ? 'Facture modifiée.' : 'Facture créée.');
      setShowForm(false); setEditInvoice(null);
      (e.target as HTMLFormElement).reset();
      load();
    });
  };

  const handleDelete = (id: string, ref: string) => {
    if (!confirm(`Supprimer la facture "${ref}" ?`)) return;
    startT(async () => {
      const res  = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) { fb(data.error || 'Erreur.', false); return; }
      fb('Facture supprimée.');
      setInvoices(prev => prev.filter(i => i.id !== id));
      load();
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    startT(async () => {
      await fetch(`/api/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      load();
    });
  };

  const handleReminder = (id: string, ref: string) => {
    if (!confirm(`Envoyer une relance email pour la facture "${ref}" ?`)) return;
    startT(async () => {
      const res  = await fetch(`/api/invoices/${id}/reminder`, { method: 'POST' });
      const data = await res.json();
      if (data.success) fb('Relance envoyée avec succès.');
      else fb(data.error || 'Erreur lors de l\'envoi.', false);
    });
  };

  const toDateInput = (d: string | null) => d ? new Date(d).toISOString().split('T')[0] : '';

  // Factures en retard
  const enRetardList = invoices.filter(i => i.dueDate && isOverdue(i.dueDate) && i.status !== 'PAYE');

  return (
    <DashboardLayout pageTitle="Banques & Créances">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[24px]">
        {[
          { label: 'Total facturé',   value: `${formatAmount(totals.total)} FCFA`,        color: 'text-[var(--text-primary)]' },
          { label: 'Total encaissé',  value: `${formatAmount(totals.totalPaye)} FCFA`,     color: 'text-[var(--msp-green)]' },
          { label: 'En attente',      value: `${formatAmount(totals.totalEnCours + totals.totalNonSolde)} FCFA`, color: 'text-[var(--msp-amber)]' },
          { label: 'Échéances dépassées', value: totals.enRetard,                          color: totals.enRetard > 0 ? 'text-[var(--msp-red)]' : 'text-[var(--text-primary)]' },
        ].map(k => (
          <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[16px_20px]">
            <div className={`text-[20px] font-medium ${k.color}`}>{k.value}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ALERTES RETARD */}
      {enRetardList.length > 0 && (
        <div className="bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[12px_16px] mb-[20px]">
          <div className="flex items-center gap-[8px] mb-[8px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--msp-red)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[13px] font-medium text-[var(--msp-red)]">
              {enRetardList.length} facture{enRetardList.length > 1 ? 's' : ''} en retard de paiement
            </span>
          </div>
          <div className="flex flex-col gap-[4px]">
            {enRetardList.map(inv => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-[8px]">
                <span className="text-[12px] text-[var(--msp-red)]">
                  {inv.ref} — {inv.partner.orgName} — {formatAmount(inv.amount)} FCFA — Éch. {formatDateShort(inv.dueDate)}
                </span>
                <button onClick={() => handleReminder(inv.id, inv.ref)} disabled={isPending}
                  className="text-[11px] text-[var(--msp-red)] border border-[var(--msp-red)] bg-[var(--msp-red-light)] py-[2px] px-[8px] rounded-[6px] hover:bg-[var(--msp-red-light)] disabled:opacity-50">
                  Relancer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {success && <div className="mb-[16px] bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-green)]">{success}</div>}
      {error   && <div className="mb-[16px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-red)]">{error}</div>}

      {/* BARRE ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[12px] mb-[20px]">
        <div className="flex flex-wrap gap-[6px]">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`py-[6px] px-[12px] rounded-[8px] text-[12px] border transition-colors ${
                filter === f ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--bg-card)]' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
              }`}>
              {f === 'Tous' ? 'Toutes' : STATUS_CFG[f]?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-[8px]">
          <Link href="/dashboard/dettes"
            className="border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] py-[8px] px-[14px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--bg-surface)] transition-colors">
            Dettes internes
          </Link>
          <button onClick={() => { setShowForm(true); setEditInvoice(null); }}
            className="bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
            + Nouvelle facture
          </button>
        </div>
      </div>

      {/* FORMULAIRE FACTURE */}
      {(showForm || editInvoice) && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[24px] mb-[20px]">
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-[20px]">
            {editInvoice ? `Modifier la facture ${editInvoice.ref}` : 'Nouvelle facture'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[16px]">
              {!editInvoice && (
                <div>
                  <label className={lc}>Partenaire *</label>
                  <select name="partnerId" required className={ic}>
                    <option value="">Sélectionner…</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.orgName}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={lc}>Référence *</label>
                <input type="text" name="ref" required defaultValue={editInvoice?.ref || ''}
                  placeholder="Ex: FAC-2026-041" className={ic} disabled={!!editInvoice} />
              </div>
              <div className={editInvoice ? '' : 'md:col-span-2'}>
                <label className={lc}>Description *</label>
                <input type="text" name="description" required defaultValue={editInvoice?.description || ''}
                  placeholder="Ex: Prestation génie civil — Janvier 2026" className={ic} />
              </div>
              <div>
                <label className={lc}>Montant (FCFA) *</label>
                <input type="number" name="amount" required min="1"
                  defaultValue={editInvoice?.amount || ''}
                  placeholder="Ex: 4500000" className={ic} />
              </div>
              <div>
                <label className={lc}>Statut *</label>
                <select name="status" defaultValue={editInvoice?.status || 'NON_SOLDE'} className={ic}>
                  <option value="NON_SOLDE">Non soldé</option>
                  <option value="EN_COURS">En cours de paiement</option>
                  <option value="PAYE">Payé</option>
                </select>
              </div>
              <div>
                <label className={lc}>Date d&apos;émission *</label>
                <input type="date" name="issueDate" required defaultValue={toDateInput(editInvoice?.issueDate || null)} className={ic} />
              </div>
              <div>
                <label className={lc}>Date d&apos;échéance</label>
                <input type="date" name="dueDate" defaultValue={toDateInput(editInvoice?.dueDate || null)} className={ic} />
              </div>
              <div className="md:col-span-2">
                <label className={lc}>Notes internes</label>
                <textarea name="notes" rows={2} defaultValue={editInvoice?.notes || ''} className={`${ic} resize-y`}
                  placeholder="Virement initié le…, en attente du bon de livraison…"></textarea>
              </div>
            </div>
            <div className="flex gap-[10px] justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditInvoice(null); }}
                className="border border-[var(--border)] text-[var(--text-primary)] py-[8px] px-[14px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--bg-surface)]">
                Annuler
              </button>
              <button type="submit" disabled={isPending}
                className="bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] disabled:opacity-60">
                {isPending ? 'Enregistrement…' : editInvoice ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLEAU FACTURES */}
      <div className="msp-card overflow-hidden">
        {loading ? (
          <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
        ) : invoices.length === 0 ? (
          <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">
            Aucune facture{filter !== 'Tous' ? ` avec le statut "${STATUS_CFG[filter]?.label}"` : ''}.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] whitespace-nowrap">Référence</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] whitespace-nowrap">Partenaire</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] whitespace-nowrap">Description</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] whitespace-nowrap text-right">Montant</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] whitespace-nowrap">Dates</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] whitespace-nowrap">Statut</th>
                  <th className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const late   = inv.dueDate && isOverdue(inv.dueDate) && inv.status !== 'PAYE';
                  const cfg    = STATUS_CFG[inv.status] || STATUS_CFG.NON_SOLDE;
                  return (
                    <tr key={inv.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-surface)] ${late ? 'bg-[rgba(155,35,53,0.02)]' : ''}`}>
                      <td className="py-[13px] px-[16px]">
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">{inv.ref}</span>
                        {inv.fileUrl && (
                          <a href={inv.fileUrl} target="_blank" rel="noreferrer"
                            className="block text-[11px] text-[var(--accent-primary)] hover:underline mt-[1px]">PDF</a>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <Link href={`/dashboard/partners/${inv.partner.id}`}
                          className="text-[13px] text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:underline">
                          {inv.partner.orgName}
                        </Link>
                      </td>
                      <td className="py-[13px] px-[16px] text-[12px] text-[var(--text-secondary)] max-w-[180px]">
                        <span className="truncate block">{inv.description}</span>
                        {inv.notes && <span className="block text-[11px] text-[var(--msp-amber)] italic mt-[2px] truncate">{inv.notes}</span>}
                      </td>
                      <td className="py-[13px] px-[16px] text-right">
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">{formatAmount(inv.amount)}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] ml-[3px]">FCFA</span>
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <div className="text-[12px] text-[var(--text-secondary)]">Émis : {formatDateShort(inv.issueDate)}</div>
                        {inv.dueDate && (
                          <div className={`text-[12px] mt-[1px] ${late ? 'text-[var(--msp-red)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                            Éch. : {formatDateShort(inv.dueDate)} {late ? '⚠' : ''}
                          </div>
                        )}
                        {inv.reminderSentAt && (
                          <div className="text-[11px] text-[var(--text-secondary)] mt-[1px] italic">
                            Relancé le {formatDateShort(inv.reminderSentAt)}
                          </div>
                        )}
                      </td>
                      <td className="py-[13px] px-[16px]">
                        <select value={inv.status}
                          onChange={e => handleStatusChange(inv.id, e.target.value)}
                          disabled={isPending}
                          className={`border rounded-[6px] py-[2px] px-[6px] text-[11px] cursor-pointer focus:outline-none disabled:opacity-50 ${cfg.cls}`}>
                          <option value="NON_SOLDE">Non soldé</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="PAYE">Payé</option>
                        </select>
                      </td>
                      <td className="py-[13px] px-[16px] text-right">
                        <div className="flex gap-[10px] justify-end flex-wrap">
                          {late && (
                            <button onClick={() => handleReminder(inv.id, inv.ref)} disabled={isPending}
                              className="text-[11px] text-[var(--msp-red)] hover:underline disabled:opacity-50">
                              Relancer
                            </button>
                          )}
                          <button onClick={() => { setEditInvoice(inv); setShowForm(false); }} disabled={isPending}
                            className="text-[12px] text-[var(--text-secondary)] hover:underline disabled:opacity-50">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(inv.id, inv.ref)} disabled={isPending}
                            className="text-[12px] text-[var(--msp-red)] hover:underline disabled:opacity-50">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* TOTAUX */}
              <tfoot className="bg-[var(--bg-surface)]">
                <tr>
                  <td colSpan={3} className="py-[12px] px-[16px] text-[12px] font-medium text-[var(--text-primary)]">
                    Total ({invoices.length} facture{invoices.length > 1 ? 's' : ''})
                  </td>
                  <td className="py-[12px] px-[16px] text-right">
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">
                      {formatAmount(invoices.reduce((s, i) => s + i.amount, 0))}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] ml-[3px]">FCFA</span>
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
