import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function PartnersPage({ searchParams }: { searchParams: { filter?: string } }) {
  const activeFilter = searchParams.filter || 'Tous';

  const partners = [
    { id: '1', orgName: 'Total Gabon', contact: 'Jean Dupont', type: 'Client', sector: 'Hydrocarbures', docs: 8, lastActive: 'Aujourd\'hui', status: 'ACTIF' },
    { id: '2', orgName: 'Sogea-Satom', contact: 'Marc Leblanc', type: 'Sous-traitant', sector: 'Génie civil', docs: 3, lastActive: 'Hier', status: 'ACTIF' },
    { id: '3', orgName: 'Construction & Co', contact: 'Alice Martin', type: 'Client', sector: 'Génie civil', docs: 34, lastActive: 'il y a 1sem', status: 'EN_ATTENTE' },
    { id: '4', orgName: 'Logistique Express', contact: 'Paul Dubois', type: 'Prestataire', sector: 'Transport', docs: 0, lastActive: 'Jamais', status: 'INACTIF' },
    { id: '5', orgName: 'TotalEnergies RDC', contact: 'Sophie Nkosi', type: 'Client', sector: 'Hydrocarbures', docs: 15, lastActive: 'il y a 2j', status: 'ACTIF' },
  ];

  const filters = ['Tous', 'Clients', 'Fournisseurs', 'Sous-traitants', 'Prestataires'];

  const statusConfig: Record<string, { label: string; cls: string }> = {
    ACTIF:     { label: 'Actif',      cls: 'badge-green' },
    INACTIF:   { label: 'Inactif',    cls: 'badge-gray' },
    EN_ATTENTE:{ label: 'En attente', cls: 'badge-orange' },
  };

  return (
    <DashboardLayout userInitials="ML" pageTitle="Mes partenaires">

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <Link key={f} href={`/dashboard/partners?filter=${f}`}
              className="px-3 py-1.5 rounded-[6px] text-[12px] border transition-colors"
              style={{
                background: activeFilter === f ? 'var(--navy)' : 'var(--bg-card)',
                borderColor: activeFilter === f ? 'var(--navy)' : 'var(--border)',
                color: activeFilter === f ? '#fff' : 'var(--text-secondary)',
              }}>
              {f}
            </Link>
          ))}
        </div>
        <Link href="/dashboard/partners/new"
          className="flex-shrink-0 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-colors"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          + Ajouter un partenaire
        </Link>
      </div>

      {/* Table responsive */}
      <div className="rounded-[12px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

        {/* Vue tableau (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
                {['Partenaire', 'Type', 'Secteur', 'Docs', 'Activité', 'Statut', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium py-3 px-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 1 ? 'var(--bg-dash)' : 'var(--bg-card)' }}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
                        style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
                        {p.orgName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.orgName}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="badge badge-gray">{p.type}</span>
                  </td>
                  <td className="py-4 px-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{p.sector}</td>
                  <td className="py-4 px-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{p.docs}</td>
                  <td className="py-4 px-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>{p.lastActive}</td>
                  <td className="py-4 px-4">
                    <span className={`badge ${statusConfig[p.status]?.cls ?? 'badge-gray'}`}>
                      {statusConfig[p.status]?.label ?? p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/dashboard/partners/${p.id}`} className="text-[12px] transition-colors" style={{ color: 'var(--gold)' }}>
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vue cards (mobile) */}
        <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
          {partners.map(p => (
            <Link key={p.id} href={`/dashboard/partners/${p.id}`}
              className="flex items-center gap-3 p-4 block transition-colors active:bg-[var(--bg-dash)]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0"
                style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
                {p.orgName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.orgName}</div>
                  <span className={`badge ${statusConfig[p.status]?.cls ?? 'badge-gray'} flex-shrink-0`}>
                    {statusConfig[p.status]?.label}
                  </span>
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {p.type} · {p.sector} · {p.docs} docs
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>5 partenaires</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-[6px] text-[12px] border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>← Préc.</button>
            <button className="px-3 py-1.5 rounded-[6px] text-[12px] border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>Suiv. →</button>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}