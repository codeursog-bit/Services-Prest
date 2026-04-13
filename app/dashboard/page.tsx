import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export default async function DashboardHomePage() {
  const session = await auth();
  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ML';

  const [
    totalPartners,
    activePartners,
    totalDocs,
    docsThisMonth,
    pendingInvoices,
    pendingAmount,
    activeMarkets,
    notifications,
    recentPartners,
    recentActivity,
  ] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.count({ where: { status: 'ACTIF' } }),
    prisma.document.count(),
    prisma.document.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.invoice.count({ where: { status: 'EN_COURS' } }),
    prisma.invoice.aggregate({ where: { status: 'EN_COURS' }, _sum: { amount: true } }),
    prisma.market.count(),
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { partner: { select: { orgName: true } } },
    }),
    prisma.partner.findMany({
      where: { status: 'ACTIF' },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: { _count: { select: { documents: true } } },
    }),
    prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { partner: { select: { id: true, orgName: true } } },
    }),
  ]);

  const fmtAmount = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

  const pendingAmountVal = pendingAmount._sum.amount ?? 0;

  const fmtTime = (d: Date) => {
    const diff = Date.now() - d.getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'il y a < 1h';
    if (h < 24) return `il y a ${h}h`;
    return `il y a ${Math.floor(h / 24)}j`;
  };

  const TYPE_LABELS: Record<string, string> = {
    CLIENT: 'Client', FOURNISSEUR: 'Fournisseur', SOUS_TRAITANT: 'Sous-traitant', PRESTATAIRE: 'Prestataire',
  };

  return (
    <DashboardLayout userInitials={userInitials} pageTitle="Vue d'ensemble">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="rounded-[10px] p-5" style={{ background: 'var(--navy)', border: 'none' }}>
          <div className="text-[28px] font-medium" style={{ color: 'var(--gold)' }}>{activePartners}</div>
          <div className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Partenaires actifs</div>
          <div className="text-[11px] mt-3 pt-2" style={{ color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {totalPartners} au total
          </div>
        </div>
        <div className="rounded-[10px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-[28px] font-medium" style={{ color: 'var(--text-primary)' }}>{docsThisMonth}</div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>Documents ce mois</div>
          <div className="text-[11px] mt-3 pt-2" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
            {totalDocs} au total
          </div>
        </div>
        <div className="rounded-[10px] p-5" style={{ background: 'var(--orange-bg)', border: '1px solid var(--orange)' }}>
          <div className="text-[28px] font-medium" style={{ color: 'var(--orange)' }}>{pendingInvoices}</div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>Factures en cours</div>
          <div className="text-[11px] mt-3 pt-2" style={{ color: 'var(--orange)', borderTop: '1px solid rgba(139,69,19,0.2)' }}>
            {fmtAmount(pendingAmountVal)} FCFA en attente
          </div>
        </div>
        <div className="rounded-[10px] p-5" style={{ background: 'var(--green-bg)', border: '1px solid var(--green)' }}>
          <div className="text-[28px] font-medium" style={{ color: 'var(--green)' }}>{activeMarkets}</div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>Marchés suivis</div>
          <div className="text-[11px] mt-3 pt-2" style={{ color: 'var(--green)', borderTop: '1px solid rgba(45,106,79,0.2)' }}>
            Base de données
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 rounded-[12px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Documents récents</div>
            <Link href="/dashboard/partners" className="text-[12px]" style={{ color: 'var(--gold)' }}>Voir tout →</Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun document partagé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 360 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-dash)' }}>
                    {['Partenaire', 'Document', 'Date', 'Statut'].map(h => (
                      <th key={h} className="text-left text-[11px] font-medium py-2 px-3 first:rounded-l-[6px] last:rounded-r-[6px]"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(doc => (
                    <tr key={doc.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="py-3 px-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {(doc as any).partner?.orgName ?? '—'}
                      </td>
                      <td className="py-3 px-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                        {doc.name.length > 30 ? doc.name.substring(0, 30) + '…' : doc.name}
                      </td>
                      <td className="py-3 px-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        {doc.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-3"><span className="badge badge-green">Partagé</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[12px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Notifications</div>
          {notifications.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucune notification.</p>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n, i) => (
                <div key={n.id} className="flex gap-3 py-3"
                  style={{ borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: n.isRead ? 'var(--border)' : 'var(--gold)' }} />
                  <div>
                    <div className="text-[12px] leading-[1.5]"
                      style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {n.content}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{fmtTime(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[12px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Partenaires récents</div>
          <Link href="/dashboard/partners" className="text-[12px]" style={{ color: 'var(--gold)' }}>Voir tous →</Link>
        </div>
        {recentPartners.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun partenaire créé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentPartners.map(p => (
              <Link key={p.id} href={`/dashboard/partners/${p.id}`}
                className="rounded-[8px] p-4 block transition-all card-hover"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-dash)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium mb-3"
                  style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
                  {p.orgName.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.orgName}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{TYPE_LABELS[p.type] ?? p.type}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p._count.documents} docs</span>
                  <span className="badge badge-green">Actif</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}