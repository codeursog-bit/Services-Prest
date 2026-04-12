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
      <div className="bg-[#FEF3E2] border border-[#8B4513] rounded-[8px] p-[16px] mb-[24px] flex items-start gap-[12px]">
        <svg className="flex-shrink-0 mt-[2px]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-[13px] text-[#8B4513] leading-[1.6]">
          Ce document est confidentiel et accessible uniquement aux administrateurs.<br />
          Il ne peut pas être partagé depuis les espaces partenaires.
        </p>
      </div>

      {latestVersion ? (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px] flex flex-col md:flex-row gap-[20px] items-start mb-[32px]">
          <div className="bg-[#F7F7F6] p-[16px] rounded-[8px] border border-[#E8E7E4] flex-shrink-0">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-medium text-[#1A1A19]">Contrat de prestation — Melanie Services&Prest.</h2>
            <p className="text-[13px] text-[#6B6A67] mt-[4px] leading-[1.6]">
              Version : {latestVersion.versionName}<br />
              Ajouté le : {latestVersion.createdAt.toLocaleDateString('fr-FR')}<br />
              Par : {latestVersion.author.name}
            </p>
            <div className="flex gap-[8px] mt-[16px]">
              <span className="inline-block border border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE] rounded-[4px] p-[2px_8px] text-[12px]">Version actuelle</span>
            </div>
            <div className="flex flex-wrap gap-[12px] mt-[24px]">
              <a href={latestVersion.fileUrl} target="_blank" rel="noreferrer"
                className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
                Consulter le document
              </a>
              <a href={latestVersion.fileUrl} download
                className="border border-[#E8E7E4] bg-[#FFFFFF] text-[#1A1A19] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors">
                Télécharger
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[40px] text-center mb-[32px]">
          <p className="text-[13px] text-[#6B6A67]">Aucun contrat uploadé pour le moment.</p>
        </div>
      )}

      {/* UPLOAD + HISTORIQUE */}
      <ContratClient />

      {/* HISTORIQUE DES VERSIONS */}
      {versions.length > 0 && (
        <>
          <h3 className="text-[14px] font-medium text-[#1A1A19] mt-[32px] mb-[16px]">Historique des versions</h3>
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                <tr>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Version</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Date</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Uploadé par</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={v.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                    <td className="py-[14px] px-[20px] text-[13px] font-medium text-[#1A1A19]">
                      {v.versionName}{i === 0 && <span className="ml-[8px] text-[11px] text-[#2D6A4F] border border-[#2D6A4F] rounded-[3px] px-[4px]">actuelle</span>}
                    </td>
                    <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{v.createdAt.toLocaleDateString('fr-FR')}</td>
                    <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{v.author.name}</td>
                    <td className="py-[14px] px-[20px] text-right">
                      <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#1A3A5C] hover:underline">Consulter</a>
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
