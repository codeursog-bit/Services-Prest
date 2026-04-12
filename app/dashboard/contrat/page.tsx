import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContratClient from './ContratClient';

export default async function ContratPage() {
  const versions = await prisma.contractVersion.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });

  const latestVersion = versions[0] ?? null;

  return (
    <DashboardLayout userInitials="ML" pageTitle="Notre contrat">

      {/* ALERTE CONFIDENTIALITÉ */}
      <div className="rounded-[8px] p-4 mb-6 flex items-start gap-3" style={{ background: 'var(--orange-bg)', border: '1px solid var(--orange)' }}>
        <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--orange)' }}>
          Ce document est confidentiel et accessible uniquement aux administrateurs.<br />
          Il ne peut pas être partagé depuis les espaces partenaires.
        </p>
      </div>

      {/* VERSION ACTUELLE */}
      {latestVersion ? (
        <div className="rounded-[10px] p-6 flex flex-col md:flex-row gap-5 items-start mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="p-4 rounded-[8px] flex-shrink-0" style={{ background: 'var(--bg-dash)', border: '1px solid var(--border)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--navy-mid)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>Contrat de prestation — Melanie Services&amp;Prest.</h2>
            <p className="text-[13px] mt-1 leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
              Version : {latestVersion.versionName}<br />
              Ajouté le : {latestVersion.createdAt.toLocaleDateString('fr-FR')}<br />
              Par : {latestVersion.author.name}
            </p>
            <div className="mt-3">
              <span className="status-paye">Version actuelle</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <a href={latestVersion.fileUrl} target="_blank" rel="noreferrer"
                className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
                style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
                Consulter le document
              </a>
              <a href={latestVersion.fileUrl} download
                className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Télécharger
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] p-10 text-center mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun contrat uploadé pour le moment.</p>
        </div>
      )}

      {/* UPLOAD */}
      <ContratClient />

      {/* HISTORIQUE DES VERSIONS */}
      {versions.length > 0 && (
        <>
          <h3 className="text-[14px] font-medium mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>Historique des versions</h3>
          <div className="rounded-[10px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <table className="w-full text-left">
              <thead style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['Version', 'Date', 'Uploadé par', 'Actions'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-[11px] font-medium ${i === 3 ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={v.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 px-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {v.versionName}
                      {i === 0 && (
                        <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-[3px]" style={{ color: 'var(--green)', border: '1px solid var(--green)', background: 'var(--green-bg)' }}>
                          actuelle
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>{v.createdAt.toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>{v.author.name}</td>
                    <td className="py-3 px-4 text-right">
                      <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-[12px] hover:underline" style={{ color: 'var(--navy-mid)' }}>Consulter</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}