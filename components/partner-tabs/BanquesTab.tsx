'use client';

import { useState, useEffect, useTransition } from 'react';
import { createInvoice, updateInvoiceStatus, deleteInvoice } from '@/lib/actions/invoices';

interface BanquesTabProps {
  partnerId: string;
}

interface Invoice {
  id: string;
  ref: string;
  description: string;
  amount: number;
  issueDate: string | Date;
  dueDate?: string | Date | null;
  status: string;
  notes?: string | null;
  fileUrl?: string | null;
}

export default function BanquesTab({ partnerId, initialInvoices = [] }: BanquesTabProps & { initialInvoices?: any[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [filter, setFilter] = useState('Tous');
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filters = ['Tous', 'PAYE', 'EN_COURS', 'NON_SOLDE'];
  const filterLabels: Record<string, string> = { Tous: 'Tous', PAYE: 'Payé', EN_COURS: 'En cours', NON_SOLDE: 'Non soldé' };

  useEffect(() => {
    fetch(`/api/invoices?partnerId=${partnerId}`)
      .then(r => r.json())
      .then(data => { if (data.invoices) setInvoices(data.invoices); })
      .catch(() => {});
  }, [partnerId]);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append('partnerId', partnerId);
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await createInvoice(fd);
      if (res.success) {
        showFeedback('Facture créée.');
        form.reset();
        setShowForm(false);
        fetch(`/api/invoices?partnerId=${partnerId}`)
          .then(r => r.json()).then(data => { if (data.invoices) setInvoices(data.invoices); });
      } else showFeedback(res.error || 'Erreur.', true);
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      await updateInvoiceStatus(id, status, partnerId);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer cette facture ?')) return;
    startTransition(async () => {
      await deleteInvoice(id, partnerId);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    });
  };

  const filtered = filter === 'Tous' ? invoices : invoices.filter(inv => inv.status === filter);

  const totalFacture = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaye = invoices.filter(i => i.status === 'PAYE').reduce((s, i) => s + i.amount, 0);
  const totalEnCours = invoices.filter(i => i.status === 'EN_COURS').reduce((s, i) => s + i.amount, 0);
  const totalNonSolde = invoices.filter(i => i.status === 'NON_SOLDE').reduce((s, i) => s + i.amount, 0);

  const formatAmount = (n: number) => n.toLocaleString('fr-FR');
  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

  const statusColors: Record<string, string> = {
    PAYE: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]',
    EN_COURS: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]',
    NON_SOLDE: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]',
  };
  const statusLabel: Record<string, string> = { PAYE: 'Payé', EN_COURS: 'En cours', NON_SOLDE: 'Non soldé' };

  const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]";
  const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

  return (
    <div>
      {success && <div className="mb-[16px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[10px_14px] text-[13px] text-[#2D6A4F]">{success}</div>}
      {error && <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[10px_14px] text-[13px] text-[#9B2335]">{error}</div>}

      {/* MÉTRIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[24px]">
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[20px] font-medium text-[#1A1A19]">{formatAmount(totalFacture)} <span className="text-[12px] font-normal text-[#6B6A67]">FCFA</span></div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Total facturé</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[20px] font-medium text-[#2D6A4F]">{formatAmount(totalPaye)} <span className="text-[12px] font-normal text-[#6B6A67]">FCFA</span></div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Montant payé</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[20px] font-medium text-[#8B4513]">{formatAmount(totalEnCours)} <span className="text-[12px] font-normal text-[#6B6A67]">FCFA</span></div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">En cours</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[20px] font-medium text-[#9B2335]">{formatAmount(totalNonSolde)} <span className="text-[12px] font-normal text-[#6B6A67]">FCFA</span></div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Non soldé</div>
        </div>
      </div>

      {/* BARRE D'ACTION */}
      <div className="flex justify-between items-center mb-[16px]">
        <div className="flex gap-[6px]">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`py-[6px] px-[12px] rounded-[6px] text-[12px] border transition-colors ${filter === f ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'}`}>
              {filterLabels[f]}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
          {showForm ? 'Annuler' : 'Ajouter une facture'}
        </button>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px] mb-[20px]">
          <form onSubmit={handleCreate} className="flex flex-col gap-[16px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div><label className={labelClass}>Référence *</label><input type="text" name="ref" placeholder="FAC-2026-001" required className={inputClass} /></div>
              <div><label className={labelClass}>Description *</label><input type="text" name="description" placeholder="Prestation technique" required className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
              <div>
                <label className={labelClass}>Montant *</label>
                <div className="flex">
                  <input type="number" name="amount" required className={`${inputClass} rounded-r-none border-r-0`} />
                  <span className="bg-[#F7F7F6] border border-[#E8E7E4] border-l-0 rounded-r-[6px] px-[12px] flex items-center text-[13px] text-[#6B6A67]">FCFA</span>
                </div>
              </div>
              <div><label className={labelClass}>Date d&apos;émission *</label><input type="date" name="issueDate" required className={inputClass} /></div>
              <div><label className={labelClass}>Date d&apos;échéance</label><input type="date" name="dueDate" className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div>
                <label className={labelClass}>Statut *</label>
                <select name="status" className={inputClass}>
                  <option value="NON_SOLDE">Non soldé</option>
                  <option value="EN_COURS">En cours de paiement</option>
                  <option value="PAYE">Payé</option>
                </select>
              </div>
              <div><label className={labelClass}>Notes</label><input type="text" name="notes" className={inputClass} /></div>
            </div>
            <div className="flex justify-end gap-[12px]">
              <button type="button" onClick={() => setShowForm(false)} className="border border-[#E8E7E4] bg-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium text-[#1A1A19]">Annuler</button>
              <button type="submit" disabled={isPending} className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLEAU FACTURES */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Aucune facture{filter !== 'Tous' ? ` avec le statut "${filterLabels[filter]}"` : ''}.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
              <tr>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Référence</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Description</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Montant</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Dates</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Statut</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                  <td className="py-[14px] px-[20px] text-[13px] font-medium text-[#1A1A19]">{inv.ref}</td>
                  <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67] max-w-[150px] truncate">{inv.description}</td>
                  <td className="py-[14px] px-[20px]"><span className="text-[13px] font-medium text-[#1A1A19]">{formatAmount(inv.amount)}</span> <span className="text-[12px] text-[#6B6A67]">FCFA</span></td>
                  <td className="py-[14px] px-[20px]">
                    <div className="text-[12px] text-[#6B6A67]">Émis : {formatDate(inv.issueDate)}</div>
                    {inv.dueDate && <div className="text-[12px] text-[#9B2335] mt-[2px]">Éch. : {formatDate(inv.dueDate)}</div>}
                  </td>
                  <td className="py-[14px] px-[20px]">
                    <select value={inv.status} onChange={e => handleStatusChange(inv.id, e.target.value)}
                      className={`inline-block border rounded-[4px] py-[2px] px-[8px] text-[12px] cursor-pointer focus:outline-none ${statusColors[inv.status]}`}>
                      <option value="NON_SOLDE">Non soldé</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="PAYE">Payé</option>
                    </select>
                  </td>
                  <td className="py-[14px] px-[20px] text-right">
                    <div className="flex gap-[8px] justify-end">
                      {inv.fileUrl && <a href={inv.fileUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#1A3A5C] hover:underline">Voir PDF</a>}
                      <button onClick={() => handleDelete(inv.id)} disabled={isPending} className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#F7F7F6]">
              <tr>
                <td className="py-[14px] px-[20px] text-[13px] font-medium text-[#1A1A19]">Total</td>
                <td></td>
                <td className="py-[14px] px-[20px] text-[13px] font-medium text-[#1A1A19]">{formatAmount(filtered.reduce((s, i) => s + i.amount, 0))} <span className="text-[12px] text-[#6B6A67] font-normal">FCFA</span></td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}