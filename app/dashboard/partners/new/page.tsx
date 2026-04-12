'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createPartner } from '@/lib/actions/partners';

export default function NewPartnerPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createPartner(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
  const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

  return (
    <DashboardLayout userInitials="ML" pageTitle="Nouveau partenaire">
      
      <div className="max-w-[640px] mx-auto">
        <Link href="/dashboard/partners" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors mb-[32px]">
          ← Retour à la liste
        </Link>

        {error && (
          <div className="mb-[24px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px]">
            <span className="text-[13px] text-[#9B2335]">{error}</span>
          </div>
        )}

        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[32px_36px]">
          <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[28px]">
            Informations du partenaire
          </h2>
          <div className="h-[1px] w-full bg-[#E8E7E4] mb-[28px]"></div>

          <form onSubmit={handleSubmit}>
            {/* SECTION 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Nom de l'organisation *</label>
                <input type="text" name="orgName" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nom du contact principal *</label>
                <input type="text" name="contactName" required className={inputClass} />
              </div>
            </div>

            {/* SECTION 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Email du contact *</label>
                <input type="email" name="email" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input type="tel" name="phone" className={inputClass} />
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Type de partenaire *</label>
                <select name="type" required className={inputClass}>
                  <option value="">Sélectionnez un type</option>
                  <option value="Client">Client</option>
                  <option value="Fournisseur">Fournisseur</option>
                  <option value="Sous-traitant">Sous-traitant</option>
                  <option value="Prestataire">Prestataire</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Secteur d'activité</label>
                <select name="sector" className={inputClass}>
                  <option value="">Sélectionnez un secteur</option>
                  <option value="Génie civil">Génie civil</option>
                  <option value="Hydrocarbures & gaz">Hydrocarbures & gaz</option>
                  <option value="QHSE">QHSE</option>
                  <option value="Matériel industriel">Matériel industriel</option>
                  <option value="Placement personnel">Placement personnel</option>
                  <option value="Hébergement">Hébergement</option>
                  <option value="Transport">Transport</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* SECTION 4 */}
            <div className="mb-[20px]">
              <label className={labelClass}>Adresse / Localisation</label>
              <input type="text" name="address" className={inputClass} />
            </div>

            {/* SECTION 5 */}
            <div className="mb-[32px]">
              <label className={labelClass}>Notes internes (non visibles par le partenaire)</label>
              <textarea name="notes" rows={3} className={`${inputClass} resize-y`}></textarea>
            </div>

            <div className="h-[1px] w-full bg-[#E8E7E4] mb-[28px]"></div>

            {/* SECTION NOTIFICATIONS */}
            <div>
              <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Paramètres de notification</h3>
              
              <div className="flex flex-col gap-[12px]">
                <label className="flex items-center gap-[12px] cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="notifyPartner" defaultChecked className="peer sr-only" />
                    <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors duration-200"></div>
                    <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-[#FFFFFF] rounded-full transition-transform duration-200 peer-checked:translate-x-[16px]"></div>
                  </div>
                  <span className="text-[13px] text-[#1A1A19]">Notifier le partenaire par email lors de chaque nouveau document partagé</span>
                </label>

                <label className="flex items-center gap-[12px] cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="notifyAdmin" defaultChecked className="peer sr-only" />
                    <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors duration-200"></div>
                    <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-[#FFFFFF] rounded-full transition-transform duration-200 peer-checked:translate-x-[16px]"></div>
                  </div>
                  <span className="text-[13px] text-[#1A1A19]">Envoyer une copie des notifications à l'admin</span>
                </label>
              </div>
            </div>

            {/* BOUTONS */}
            <div className="flex justify-end gap-[12px] mt-[32px]">
              <Link 
                href="/dashboard/partners"
                className="border border-[#E8E7E4] text-[#1A1A19] bg-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors"
              >
                Annuler
              </Link>
              <button 
                type="submit"
                disabled={isPending}
                className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}
              >
                {isPending ? 'Création en cours...' : "Créer l'espace partenaire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}