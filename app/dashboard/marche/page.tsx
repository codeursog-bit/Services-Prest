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

  return (
    <DashboardLayout userInitials="ML" pageTitle="Suivi des marchés">
      {/* MÉTRIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[24px]">
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#1A1A19]">{markets.length}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Marchés suivis</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#1A1A19]">{avgExec}%</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Taux d&apos;exécution moyen</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#9B2335]">{contentieuxCount}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Contentieux ouverts</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
          <div className="text-[22px] font-medium text-[#1A1A19]">{upcomingRevues}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Revues dans 30 jours</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* TABLEAU MARCHÉS */}
        <div className="lg:col-span-2">
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
            {markets.length === 0 ? (
              <div className="p-[40px] text-center text-[13px] text-[#6B6A67]">Aucun marché enregistré.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                    <tr>
                      <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Partenaire</th>
                      <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Phase</th>
                      <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] w-[180px]">Exécution</th>
                      <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Prochaine revue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markets.map(m => (
                      <tr key={m.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6] cursor-pointer group">
                        <td className="py-[14px] px-[20px]">
                          <Link href={`/dashboard/partners/${m.partner.id}?tab=marche`}
                            className="text-[13px] font-medium text-[#1A1A19] group-hover:text-[#1A3A5C]">
                            {m.partner.orgName}
                          </Link>
                          {m.name !== 'Marché principal' && <span className="block text-[12px] text-[#6B6A67]">{m.name}</span>}
                        </td>
                        <td className="py-[14px] px-[20px] text-[13px] text-[#6B6A67]">{m.phase}</td>
                        <td className="py-[14px] px-[20px]">
                          <div className="flex items-center gap-[10px]">
                            <div className="flex-1 h-[6px] bg-[#E8E7E4] rounded-full overflow-hidden">
                              <div className="h-full bg-[#1A3A5C]" style={{ width: `${m.executionRate}%` }}></div>
                            </div>
                            <span className="text-[12px] font-medium text-[#1A1A19] w-[32px] text-right">{m.executionRate}%</span>
                          </div>
                        </td>
                        <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{fmtDate(m.nextReviewDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* AUDITS RÉCENTS */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
            <h2 className="text-[15px] font-medium text-[#1A1A19] mb-[20px]">Derniers audits</h2>
            {audits.length === 0 ? (
              <p className="text-[13px] text-[#6B6A67]">Aucun audit enregistré.</p>
            ) : (
              <div className="flex flex-col gap-[16px]">
                {audits.map(a => (
                  <div key={a.id} className="border-l-[2px] border-[#1A3A5C] pl-[12px] py-[4px]">
                    <div className="text-[12px] text-[#6B6A67] mb-[2px]">
                      {a.date.toLocaleDateString('fr-FR')} · {a.partner.orgName}
                    </div>
                    <Link href={`/dashboard/partners/${a.partnerId}?tab=marche`}
                      className="text-[13px] font-medium text-[#1A1A19] hover:text-[#1A3A5C] transition-colors line-clamp-2">
                      {a.notes.substring(0, 80)}{a.notes.length > 80 ? '…' : ''}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
