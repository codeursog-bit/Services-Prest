import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

export default async function MarchePage() {
  const markets = await prisma.market.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { partner: { select: { id: true, orgName: true } } },
  });

  const contentieuxCount = await prisma.contentieux.count({ where: { status: 'EN_COURS' } });
  const audits = await prisma.marketNote.findMany({
    where: { category: 'AUDIT' },
    orderBy: { date: 'desc' },
    take: 5,
    include: { partner: { select: { orgName: true } } },
  });

  const avgExec = markets.length
    ? Math.round(markets.reduce((s, m) => s + m.executionRate, 0) / markets.length)
    : 0;

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingRevues = markets.filter(m => m.nextReviewDate && m.nextReviewDate <= in30).length;

  const metrics = [
    { val: `${markets.length}`, label: 'Marchés suivis', color: 'var(--text-primary)' },
    { val: `${avgExec}%`, label: "Taux d'exécution moyen", color: 'var(--text-primary)' },
    { val: `${contentieuxCount}`, label: 'Contentieux ouverts', color: 'var(--red)' },
    { val: `${upcomingRevues}`, label: 'Revues dans 30 jours', color: 'var(--text-primary)' },
  ];

  return (
    <DashboardLayout userInitials="ML" pageTitle="Suivi des marchés">

      {/* MÉTRIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-[10px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-[22px] font-medium" style={{ color: m.color }}>{m.val}</div>
            <div className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TABLEAU MARCHÉS */}
        <div className="lg:col-span-2 rounded-[10px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {markets.length === 0 ? (
            <div className="p-10 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun marché enregistré.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: 440 }}>
                <thead style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    {['Partenaire', 'Phase', 'Exécution', 'Prochaine revue'].map(h => (
                      <th key={h} className="py-3 px-4 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {markets.map((m, idx) => (
                    <tr key={m.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 1 ? 'var(--bg-dash)' : 'var(--bg-card)' }}>
                      <td className="py-3 px-4">
                        <Link href={`/dashboard/partners/${m.partner.id}?tab=marche`}
                          className="text-[13px] font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
                          {m.partner.orgName}
                        </Link>
                        {m.name !== 'Marché principal' && (
                          <span className="block text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{m.phase}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--border)', minWidth: 60 }}>
                            <div className="h-full rounded-full" style={{ width: `${m.executionRate}%`, background: 'var(--navy-mid)' }} />
                          </div>
                          <span className="text-[12px] font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>{m.executionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>{fmtDate(m.nextReviewDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AUDITS RÉCENTS */}
        <div className="rounded-[10px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Derniers audits</h2>
          {audits.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun audit enregistré.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {audits.map(a => (
                <div key={a.id} className="pl-3 py-1" style={{ borderLeft: '2px solid var(--navy-mid)' }}>
                  <div className="text-[12px] mb-1" style={{ color: 'var(--text-muted)' }}>
                    {a.date.toLocaleDateString('fr-FR')} · {a.partner.orgName}
                  </div>
                  <Link href={`/dashboard/partners/${a.partnerId}?tab=marche`}
                    className="text-[13px] font-medium hover:underline line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {a.notes.substring(0, 80)}{a.notes.length > 80 ? '…' : ''}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}