import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function PartnersPage({ searchParams }: { searchParams: { filter?: string } }) {
  const activeFilter = searchParams.filter || 'Tous';

  // Mock de données (Normalement fetché via Prisma ici)
  const partners = [
    { id: '1', orgName: 'Société Alpha SA', contact: 'Jean Dupont', type: 'Fournisseur', sector: 'Matériel industriel', docs: 12, lastActive: 'il y a 2j', status: 'Actif' },
    { id: '2', orgName: 'Entreprise Beta', contact: 'Marc Leblanc', type: 'Sous-traitant', sector: 'Génie civil', docs: 5, lastActive: 'Aujourd\'hui', status: 'En attente' },
    { id: '3', orgName: 'Construction & Co', contact: 'Alice Martin', type: 'Client', sector: 'Génie civil', docs: 34, lastActive: 'il y a 1sem', status: 'Actif' },
    { id: '4', orgName: 'Logistique Express', contact: 'Paul Dubois', type: 'Prestataire', sector: 'Transport', docs: 0, lastActive: 'Jamais', status: 'Inactif' }
  ];

  const filters = ['Tous', 'Clients', 'Fournisseurs', 'Sous-traitants', 'Prestataires'];

  return (
    <DashboardLayout userInitials="ML" pageTitle="Mes partenaires">
      
      {/* TOPBAR ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[16px] mb-[24px]">
        
        <div className="flex flex-col xl:flex-row gap-[16px] items-start xl:items-center w-full">
          {/* Recherche */}
          <div className="relative">
            <svg className="absolute left-[10px] top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Rechercher un partenaire..." 
              className="w-full sm:w-[280px] py-[8px] pr-[14px] pl-[36px] border border-[#E8E7E4] rounded-[6px] text-[13px] text-[#1A1A19] bg-[#FFFFFF] focus:outline-none focus:border-[#1A3A5C] transition-colors"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-[6px]">
            {filters.map(filter => (
              <Link 
                key={filter}
                href={`/dashboard/partners?filter=${filter}`}
                className={`py-[6px] px-[12px] rounded-[6px] text-[12px] border transition-colors ${
                  activeFilter === filter 
                    ? 'bg-[#1A3A5C] border-[#1A3A5C] text-[#FFFFFF]' 
                    : 'bg-[#FFFFFF] border-[#E8E7E4] text-[#6B6A67] hover:border-[#1A3A5C]'
                }`}
              >
                {filter}
              </Link>
            ))}
          </div>
        </div>

        <Link 
          href="/dashboard/partners/new"
          className="flex-shrink-0 bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors"
        >
          Ajouter un partenaire
        </Link>
      </div>

      {/* VUE TABLEAU */}
      {partners.length > 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                <tr>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] whitespace-nowrap">Partenaire</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] whitespace-nowrap">Type</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] whitespace-nowrap">Secteur</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] whitespace-nowrap">Docs</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] whitespace-nowrap">Dernière activité</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] whitespace-nowrap">Statut</th>
                  <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(partner => (
                  <tr key={partner.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6] transition-colors group cursor-pointer">
                    <td className="py-[14px] px-[20px]">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[36px] h-[36px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[13px] font-medium text-[#1A3A5C] flex-shrink-0">
                          {partner.orgName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/dashboard/partners/${partner.id}`} className="text-[14px] font-medium text-[#1A1A19] group-hover:text-[#1A3A5C] transition-colors">
                            {partner.orgName}
                          </Link>
                          <div className="text-[12px] text-[#6B6A67] mt-[2px]">{partner.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-[14px] px-[20px]">
                      <span className="inline-block border border-[#E8E7E4] bg-transparent text-[#6B6A67] py-[2px] px-[8px] rounded-[4px] text-[12px]">
                        {partner.type}
                      </span>
                    </td>
                    <td className="py-[14px] px-[20px] text-[13px] text-[#6B6A67]">{partner.sector}</td>
                    <td className="py-[14px] px-[20px] text-[13px] text-[#1A1A19]">{partner.docs} documents</td>
                    <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{partner.lastActive}</td>
                    <td className="py-[14px] px-[20px]">
                      {partner.status === 'Actif' && <span className="inline-block border border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE] rounded-[4px] p-[2px_8px] text-[12px]">Actif</span>}
                      {partner.status === 'Inactif' && <span className="inline-block border border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6] rounded-[4px] p-[2px_8px] text-[12px]">Inactif</span>}
                      {partner.status === 'En attente' && <span className="inline-block border border-[#8B4513] text-[#8B4513] bg-[#FEF3E2] rounded-[4px] p-[2px_8px] text-[12px]">En attente</span>}
                    </td>
                    <td className="py-[14px] px-[20px] text-right">
                      <button className="p-[4px] text-[#6B6A67] hover:text-[#1A1A19] hover:bg-[#E8E7E4] rounded-[4px] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-[#FFFFFF] p-[16px_20px] flex justify-between items-center border-t border-[#E8E7E4]">
            <span className="text-[12px] text-[#6B6A67]">Page 1 sur 1</span>
            <div className="flex gap-[8px]">
              <button className="border border-[#E8E7E4] bg-[#FFFFFF] py-[6px] px-[12px] rounded-[6px] text-[12px] text-[#6B6A67] opacity-50 cursor-not-allowed">Précédent</button>
              <button className="border border-[#E8E7E4] bg-[#FFFFFF] py-[6px] px-[12px] rounded-[6px] text-[12px] text-[#1A1A19] hover:border-[#1A3A5C] transition-colors">Suivant</button>
            </div>
          </div>
        </div>
      ) : (
        /* ÉTAT VIDE */
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[60px_20px] flex flex-col items-center justify-center text-center">
          <svg className="mb-[16px]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E8E7E4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/>
          </svg>
          <h2 className="text-[15px] font-medium text-[#1A1A19]">Aucun partenaire pour l'instant</h2>
          <p className="text-[13px] text-[#6B6A67] mt-[4px] mb-[20px]">Ajoutez votre premier partenaire pour commencer.</p>
          <Link href="/dashboard/partners/new" className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
            Ajouter un partenaire
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}