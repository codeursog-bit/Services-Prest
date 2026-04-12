import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  PAYE: 'Payé',
  EN_COURS: 'En cours',
  NON_SOLDE: 'Non soldé',
};

const STATUS_CLS: Record<string, string> = {
  PAYE: 'status-paye',
  EN_COURS: 'status-cours',
  NON_SOLDE: 'status-solde',
};

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

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

  const lateInvoices = invoices.filter(i => i.status === 'NON_SOLDE' && i.dueDate && i.dueDate < now);

  const metrics = [
    { val: `${fmt(totalFacture)} FCFA`, label: 'Total facturé', valColor: 'var(--text-primary)' },
    { val: `${fmt(totalEncaisse)} FCFA`, label: 'Total encaissé', valColor: 'var(--green)' },
    { val: `${fmt(enAttente)} FCFA`, label: 'En attente', valColor: 'var(--orange)' },
    { val: `${depasees}`, label: 'Échéances dépassées', valColor: 'var(--red)' },
  ];

  return (
    <DashboardLayout userInitials="ML" pageTitle="Banques & Créances">

      {/* MÉTRIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-[10px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-[22px] font-medium leading-tight" style={{ color: m.valColor }}>{m.val}</div>
            <div className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ALERTE */}
      {lateInvoices.length > 0 && (
        <div className="rounded-[8px] p-4 mb-6 flex items-start gap-3" style={{ background: 'var(--red-bg)', border: '1px solid var(--red)' }}>
          <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--red)' }}>
              {lateInvoices.length} facture(s) ont dépassé leur échéance.
            </p>
            <ul className="flex flex-col gap-1">
              {lateInvoices.map(i => (
                <li key={i.id} className="text-[12px]" style={{ color: 'var(--red)' }}>
                  <span className="font-medium">{i.ref}</span> — {(i as any).partner?.orgName} ({fmt(i.amount)} FCFA) — Échue le {fmtDate(i.dueDate)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TABLEAU */}
      {invoices.length === 0 ? (
        <div className="rounded-[10px] p-10 text-center text-[13px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          Aucune facture enregistrée. Ajoutez-en depuis la fiche d&apos;un partenaire.
        </div>
      ) : (
        <div className="rounded-[10px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 640 }}>
              <thead style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['Référence', 'Partenaire', 'Description', 'Montant', 'Émission', 'Échéance', 'Statut', 'Fiche'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-[11px] font-medium ${i === 7 ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => {
                  const isLate = inv.status === 'NON_SOLDE' && inv.dueDate && inv.dueDate < now;
                  return (
                    <tr key={inv.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 1 ? 'var(--bg-dash)' : 'var(--bg-card)' }}>
                      <td className="py-3 px-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{inv.ref}</td>
                      <td className="py-3 px-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{(inv as any).partner?.orgName}</td>
                      <td className="py-3 px-4 text-[12px] max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>{inv.description}</td>
                      <td className="py-3 px-4">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{inv.amount.toLocaleString('fr-FR')}</span>{' '}
                        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>FCFA</span>
                      </td>
                      <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>{fmtDate(inv.issueDate)}</td>
                      <td className="py-3 px-4 text-[12px]" style={{ color: isLate ? 'var(--red)' : 'var(--text-muted)', fontWeight: isLate ? 500 : 400 }}>{fmtDate(inv.dueDate)}</td>
                      <td className="py-3 px-4">
                        <span className={STATUS_CLS[inv.status] ?? 'badge-gray'}>
                          {STATUS_LABELS[inv.status] ?? inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/partners/${(inv as any).partner?.id}?tab=banques`} className="text-[12px] hover:underline" style={{ color: 'var(--navy-mid)' }}>
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