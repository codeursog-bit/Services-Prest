import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';

const TYPE_LABELS: Record<string, string> = {
  CLIENT: 'Client', FOURNISSEUR: 'Fournisseur', SOUS_TRAITANT: 'Sous-traitant', PRESTATAIRE: 'Prestataire',
};
const STATUS_STYLES: Record<string, string> = {
  ACTIF: 'badge-green', INACTIF: 'badge-red', EN_ATTENTE: 'badge-orange',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIF: 'Actif', INACTIF: 'Inactif', EN_ATTENTE: 'En attente',
};

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { documents: true, invoices: true } } },
  });

  const totalActifs = partners.filter(p => p.status === 'ACTIF').length;

  return (
    <DashboardLayout userInitials="ML" pageTitle="Partenaires">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {partners.length} partenaire{partners.length !== 1 ? 's' : ''} · {totalActifs} actif{totalActifs !== 1 ? 's' : ''}
        </p>
        <Link href="/dashboard/partners/new"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-[6px] text-[13px] font-medium"
          style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouveau partenaire
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-[12px] p-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[14px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Aucun partenaire</p>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>Créez votre premier partenaire pour commencer le suivi.</p>
          <Link href="/dashboard/partners/new"
            className="inline-flex items-center gap-2 py-2 px-5 rounded-[6px] text-[13px] font-medium"
            style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
            Créer un partenaire
          </Link>
        </div>
      ) : (
        <div className="rounded-[12px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
                  {['Organisation', 'Contact', 'Type', 'Docs', 'Factures', 'Statut', ''].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium py-3 px-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
                          style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
                          {p.orgName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/dashboard/partners/${p.id}`}
                            className="text-[13px] font-medium hover:underline block" style={{ color: 'var(--text-primary)' }}>
                            {p.orgName}
                          </Link>
                          {p.sector && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.sector}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{p.contactName}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.email}</div>
                    </td>
                    <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {TYPE_LABELS[p.type] ?? p.type}
                    </td>
                    <td className="py-3 px-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {p._count.documents}
                    </td>
                    <td className="py-3 px-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {p._count.invoices}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_STYLES[p.status] ?? 'badge-gray'}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/dashboard/partners/${p.id}`}
                        className="text-[12px] hover:underline" style={{ color: 'var(--gold)' }}>
                        Ouvrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}