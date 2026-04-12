import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardHomePage() {
  // Dans un cas réel, ces données viendraient de la DB via le Server Component
  const userInitials = "ML";
  const mockMetrics = {
    partners: 14,
    docs: 32,
    invoices: 4,
    totalAmount: "12 500 000",
    projects: 5
  };

  return (
    <DashboardLayout userInitials={userInitials} pageTitle="Vue d'ensemble">
      
      {/* ROW 1 — 4 métriques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {/* M1 */}
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px]">
          <div className="text-[28px] font-medium text-[#1A1A19]">{mockMetrics.partners}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Partenaires actifs</div>
          <div className="text-[11px] text-[#6B6A67] mt-[12px] border-t border-[#E8E7E4] pt-[10px]">
            Dernière mise à jour aujourd'hui
          </div>
        </div>

        {/* M2 */}
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px]">
          <div className="text-[28px] font-medium text-[#1A1A19]">{mockMetrics.docs}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Documents partagés ce mois</div>
          <div className="text-[11px] text-[#6B6A67] mt-[12px] border-t border-[#E8E7E4] pt-[10px]">
            +8 cette semaine
          </div>
        </div>

        {/* M3 */}
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px]">
          <div className="text-[28px] font-medium text-[#1A1A19]">{mockMetrics.invoices}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Factures en cours</div>
          <div className="text-[11px] text-[#6B6A67] mt-[12px] border-t border-[#E8E7E4] pt-[10px]">
            {mockMetrics.totalAmount} FCFA
          </div>
        </div>

        {/* M4 */}
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px]">
          <div className="text-[28px] font-medium text-[#1A1A19]">{mockMetrics.projects}</div>
          <div className="text-[12px] text-[#6B6A67] mt-[4px]">Marchés en cours</div>
          <div className="text-[11px] text-[#6B6A67] mt-[12px] border-t border-[#E8E7E4] pt-[10px]">
            1 en clôture ce mois
          </div>
        </div>
      </div>

      {/* ROW 2 — Activité et Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] mt-[20px]">
        
        {/* COLONNE GRANDE (66%) — Activité récente */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Activité récente</h2>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-[12px] text-[12px] font-medium text-[#6B6A67] border-b border-[#E8E7E4]">Partenaire</th>
                  <th className="pb-[12px] text-[12px] font-medium text-[#6B6A67] border-b border-[#E8E7E4]">Action</th>
                  <th className="pb-[12px] text-[12px] font-medium text-[#6B6A67] border-b border-[#E8E7E4]">Date</th>
                  <th className="pb-[12px] text-[12px] font-medium text-[#6B6A67] border-b border-[#E8E7E4]">Statut</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#1A1A19]">
                {/* Ligne 1 */}
                <tr className="bg-[#FFFFFF]">
                  <td className="py-[12px] border-b border-[#E8E7E4]">Société Alpha SA</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">Partage document (Kbis)</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">Aujourd'hui, 10:45</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">
                    <span className="inline-block border border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE] rounded-[4px] p-[2px_8px] text-[10px]">Partagé</span>
                  </td>
                </tr>
                {/* Ligne 2 */}
                <tr className="bg-[#F7F7F6]">
                  <td className="py-[12px] border-b border-[#E8E7E4] pl-[8px]">Entreprise Beta</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">Signature contrat</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">Hier, 16:30</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">
                    <span className="inline-block border border-[#8B4513] text-[#8B4513] bg-[#FEF3E2] rounded-[4px] p-[2px_8px] text-[10px]">En attente</span>
                  </td>
                </tr>
                {/* Ligne 3 */}
                <tr className="bg-[#FFFFFF]">
                  <td className="py-[12px] border-b border-[#E8E7E4]">Construction & Co</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">Lecture rapport QHSE</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">12 Jan, 09:15</td>
                  <td className="py-[12px] border-b border-[#E8E7E4]">
                    <span className="inline-block border border-[#6B6A67] text-[#6B6A67] bg-[#F7F7F6] rounded-[4px] p-[2px_8px] text-[10px]">Vu</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Link href="/dashboard/activity" className="inline-block text-[12px] text-[#1A3A5C] mt-[16px] hover:underline">
            Voir tout →
          </Link>
        </div>

        {/* COLONNE PETITE (34%) — Notifications */}
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Notifications</h2>
          
          <ul className="flex flex-col">
            <li className="flex items-start gap-[12px] py-[10px] border-b border-[#E8E7E4]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#1A3A5C] flex-shrink-0 mt-[6px]"></div>
              <div>
                <p className="text-[12px] text-[#1A1A19] leading-[1.5]">Nouveau document ajouté par <span className="font-medium">Société Alpha SA</span></p>
                <span className="block text-[11px] text-[#6B6A67] mt-[2px]">Il y a 2 heures</span>
              </div>
            </li>
            <li className="flex items-start gap-[12px] py-[10px] border-b border-[#E8E7E4]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#1A3A5C] flex-shrink-0 mt-[6px]"></div>
              <div>
                <p className="text-[12px] text-[#1A1A19] leading-[1.5]">Rappel : Validation du rapport d'inspection requise.</p>
                <span className="block text-[11px] text-[#6B6A67] mt-[2px]">Aujourd'hui, 08:00</span>
              </div>
            </li>
            <li className="flex items-start gap-[12px] py-[10px] border-b border-[#E8E7E4]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#E8E7E4] flex-shrink-0 mt-[6px]"></div>
              <div>
                <p className="text-[12px] text-[#1A1A19] leading-[1.5]">Paiement de la facture F-2026-004 reçu.</p>
                <span className="block text-[11px] text-[#6B6A67] mt-[2px]">Hier, 14:20</span>
              </div>
            </li>
            <li className="flex items-start gap-[12px] py-[10px] border-b border-[#E8E7E4]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#E8E7E4] flex-shrink-0 mt-[6px]"></div>
              <div>
                <p className="text-[12px] text-[#1A1A19] leading-[1.5]">Clôture du marché "Projet Delta" finalisée.</p>
                <span className="block text-[11px] text-[#6B6A67] mt-[2px]">10 Jan, 16:45</span>
              </div>
            </li>
          </ul>

          <button className="text-[11px] text-[#6B6A67] mt-[12px] hover:text-[#1A1A19] transition-colors">
            Tout marquer comme lu
          </button>
        </div>

      </div>

      {/* ROW 3 — Partenaires récents */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px_24px] mt-[20px]">
        <div className="flex items-center justify-between border-b border-[#E8E7E4] pb-[16px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19]">Partenaires récents</h2>
          <Link href="/dashboard/partners" className="text-[12px] text-[#1A3A5C] hover:underline">
            Voir tous →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px] mt-[16px]">
          
          {/* Carte partenaire 1 */}
          <Link href="/dashboard/partners/1" className="block border border-[#E8E7E4] rounded-[8px] p-[16px] hover:border-[#1A3A5C] transition-colors duration-200">
            <div className="w-[36px] h-[36px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[13px] font-medium text-[#1A3A5C]">
              SA
            </div>
            <h3 className="text-[13px] font-medium text-[#1A1A19] mt-[10px]">Société Alpha SA</h3>
            <div className="text-[11px] text-[#6B6A67] mt-[2px]">Fournisseur Matériel</div>
            <span className="inline-block border border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE] rounded-[4px] p-[2px_8px] text-[10px] mt-[8px]">Actif</span>
          </Link>

          {/* Carte partenaire 2 */}
          <Link href="/dashboard/partners/2" className="block border border-[#E8E7E4] rounded-[8px] p-[16px] hover:border-[#1A3A5C] transition-colors duration-200">
            <div className="w-[36px] h-[36px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[13px] font-medium text-[#1A3A5C]">
              EB
            </div>
            <h3 className="text-[13px] font-medium text-[#1A1A19] mt-[10px]">Entreprise Beta</h3>
            <div className="text-[11px] text-[#6B6A67] mt-[2px]">Sous-traitant Génie Civil</div>
            <span className="inline-block border border-[#8B4513] text-[#8B4513] bg-[#FEF3E2] rounded-[4px] p-[2px_8px] text-[10px] mt-[8px]">En cours</span>
          </Link>

          {/* Carte partenaire 3 */}
          <Link href="/dashboard/partners/3" className="block border border-[#E8E7E4] rounded-[8px] p-[16px] hover:border-[#1A3A5C] transition-colors duration-200">
            <div className="w-[36px] h-[36px] rounded-full bg-[#F7F7F6] border border-[#E8E7E4] flex items-center justify-center text-[13px] font-medium text-[#1A3A5C]">
              CC
            </div>
            <h3 className="text-[13px] font-medium text-[#1A1A19] mt-[10px]">Construction & Co</h3>
            <div className="text-[11px] text-[#6B6A67] mt-[2px]">Client / Institution</div>
            <span className="inline-block border border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE] rounded-[4px] p-[2px_8px] text-[10px] mt-[8px]">Actif</span>
          </Link>

        </div>
      </div>

    </DashboardLayout>
  );
}