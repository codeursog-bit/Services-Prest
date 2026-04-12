import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  PAYE: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]',
  EN_COURS: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]',
  NON_SOLDE: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]',
};
const STATUS_LABELS: Record<string, string> = { PAYE: 'Payé', EN_COURS: 'En cours', NON_SOLDE: 'Non soldé' };

export default async function BanquesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: 'desc' },
    include: { partner: { select: { id: true, orgName: true } } },
  });

  const totalFacture = invoices.reduce((s, i) => s + i.amount, 0);
  const totalEncaisse = invoices.filter(i => i.status === 'PAYE').reduce((s, i) => s + i.amount, 0);
  const enAttente = invoices.filter(i => i.status !== 'PAYE').reduce((s, i) => s + i.amount, 0);
  const now = new Date();
  const depasees = invoices.filter(i => i.status === 'NON_SOLDE' && i.dueDate && i.dueDate < now).length;

  const fmt = (n: number) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

  const fmtDate = (d: Date | null) => d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

  const lateInvoices = invoices.filter(i => i.status === 'NON_SOLDE' && i.dueDate && i.dueDate < now);

  return (
    <DashboardLayout userInitials="ML" pageTitle="Banques & Créances">
      {/* MÉTRIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[24px]">
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#1A1A19]">{fmt(totalFacture)} FCFA</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Total facturé</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#2D6A4F]">{fmt(totalEncaisse)} FCFA</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Total encaissé</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#8B4513]">{fmt(enAttente)} FCFA</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">En attente</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#9B2335]">{depasees}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Échéances dépassées</div>
        </div>
      </div>

      {/* ALERTE */}
      {lateInvoices.length > 0 && (
        <div className="bg-[#FCEBEB] border border-[#9B2335] rounded-[8px] p-[14px] mb-[24px]">
          <div className="flex items-center gap-[10px] mb-[8px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[13px] font-medium text-[#9B2335]">{lateInvoices.length} facture(s) ont dépassé leur échéance.</span>
          </div>
          <ul className="pl-[28px] flex flex-col gap-[4px]">
            {lateInvoices.map(i => (
              <li key={i.id} className="text-[12px] text-[#9B2335]">
                <span className="font-medium">{i.ref}</span> — {(i as any).partner?.orgName} ({fmt(i.amount)} FCFA) — Échue le {fmtDate(i.dueDate)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TABLEAU */}
      {invoices.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[40px] text-center text-[13px] text-[#6B6A67]">
          Aucune facture enregistrée. Ajoutez-en depuis la fiche d&apos;un partenaire.
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                <tr>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Référence</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Partenaire</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Description</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Montant</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Émission</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Échéance</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Statut</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Fiche</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const isLate = inv.status === 'NON_SOLDE' && inv.dueDate && inv.dueDate < now;
                  return (
                    <tr key={inv.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                      <td className="py-[14px] px-[20px] text-[13px] font-medium text-[#1A1A19]">{inv.ref}</td>
                      <td className="py-[14px] px-[20px] text-[13px] text-[#1A1A19]">{(inv as any).partner?.orgName}</td>
                      <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67] max-w-[150px] truncate">{inv.description}</td>
                      <td className="py-[14px] px-[20px]">
                        <span className="text-[13px] font-medium text-[#1A1A19]">{inv.amount.toLocaleString('fr-FR')}</span>{' '}
                        <span className="text-[12px] text-[#6B6A67]">FCFA</span>
                      </td>
                      <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{fmtDate(inv.issueDate)}</td>
                      <td className={`py-[14px] px-[20px] text-[12px] ${isLate ? 'text-[#9B2335] font-medium' : 'text-[#6B6A67]'}`}>{fmtDate(inv.dueDate)}</td>
                      <td className="py-[14px] px-[20px]">
                        <span className={`inline-block border rounded-[4px] py-[2px] px-[8px] text-[12px] ${STATUS_STYLES[inv.status] ?? ''}`}>
                          {STATUS_LABELS[inv.status] ?? inv.status}
                        </span>
                      </td>
                      <td className="py-[14px] px-[20px] text-right">
                        <Link href={`/dashboard/partners/${(inv as any).partner?.id}?tab=banques`} className="text-[12px] text-[#1A3A5C] hover:underline">
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
