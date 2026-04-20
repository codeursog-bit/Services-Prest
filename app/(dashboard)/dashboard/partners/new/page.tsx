'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

export default function NewPartnerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const body = {
      orgName:     fd.get('orgName')     as string,
      contactName: fd.get('contactName') as string,
      email:       fd.get('email')       as string,
      phone:       fd.get('phone')       as string,
      type:        fd.get('type')        as string,
      sector:      fd.get('sector')      as string,
      address:     fd.get('address')     as string,
      notes:       fd.get('notes')       as string,
      notifyOnDoc: fd.get('notifyOnDoc') === 'on',
      notifyAdmin: fd.get('notifyAdmin') === 'on',
    };

    setError(null);
    startTransition(async () => {
      const res  = await fetch('/api/partners', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Une erreur est survenue.');
        return;
      }
      router.push(`/dashboard/partners/${data.partner.id}`);
    });
  };

  return (
    <DashboardLayout pageTitle="Nouveau partenaire">
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
          <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[8px]">Informations du partenaire</h2>
          <p className="text-[13px] text-[#6B6A67] mb-[28px]">Un email d&apos;invitation sera envoyé automatiquement avec le lien d&apos;accès à son espace.</p>
          <div className="h-[1px] w-full bg-[#E8E7E4] mb-[28px]"></div>

          <form onSubmit={handleSubmit}>
            {/* Identité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Nom de l&apos;organisation *</label>
                <input type="text" name="orgName" required className={inputClass} placeholder="Ex: Alpha Industries SA" />
              </div>
              <div>
                <label className={labelClass}>Nom du contact principal *</label>
                <input type="text" name="contactName" required className={inputClass} placeholder="Ex: Jean Dupont" />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Email du contact *</label>
                <input type="email" name="email" required className={inputClass} placeholder="contact@organisation.com" />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input type="tel" name="phone" className={inputClass} placeholder="+242 06 XXX XX XX" />
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Type de partenaire *</label>
                <select name="type" required className={inputClass}>
                  <option value="">Sélectionnez un type</option>
                  <option value="CLIENT">Client</option>
                  <option value="FOURNISSEUR">Fournisseur</option>
                  <option value="SOUS_TRAITANT">Sous-traitant</option>
                  <option value="PRESTATAIRE">Prestataire</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Secteur d&apos;activité</label>
                <select name="sector" className={inputClass}>
                  <option value="">Sélectionnez un secteur</option>
                  <option value="Génie civil">Génie civil</option>
                  <option value="Hydrocarbures & gaz">Hydrocarbures &amp; gaz</option>
                  <option value="QHSE">QHSE</option>
                  <option value="Matériel industriel">Matériel industriel</option>
                  <option value="Placement personnel">Placement personnel</option>
                  <option value="Hébergement">Hébergement</option>
                  <option value="Transport">Transport</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Adresse */}
            <div className="mb-[20px]">
              <label className={labelClass}>Adresse / Localisation</label>
              <input type="text" name="address" className={inputClass} placeholder="Ex: Avenue de l'Indépendance, Pointe-Noire" />
            </div>

            {/* Notes internes */}
            <div className="mb-[32px]">
              <label className={labelClass}>Notes internes</label>
              <p className="text-[11px] text-[#6B6A67] mb-[6px]">Ces notes ne sont jamais visibles par le partenaire.</p>
              <textarea name="notes" rows={3} className={`${inputClass} resize-y`} placeholder="Contexte, conditions particulières…"></textarea>
            </div>

            <div className="h-[1px] w-full bg-[#E8E7E4] mb-[28px]"></div>

            {/* Notifications */}
            <div className="mb-[32px]">
              <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Paramètres de notification</h3>
              <div className="flex flex-col gap-[14px]">
                <Toggle name="notifyOnDoc" defaultChecked label="Notifier le partenaire par email lors de chaque nouveau document partagé" />
                <Toggle name="notifyAdmin" defaultChecked label="Recevoir une copie des notifications par email" />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-[12px]">
              <Link href="/dashboard/partners"
                className="border border-[#E8E7E4] text-[#1A1A19] bg-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={isPending}
                className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}>
                {isPending ? 'Création…' : "Créer l'espace partenaire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Composant toggle réutilisable
function Toggle({ name, defaultChecked, label }: { name: string; defaultChecked?: boolean; label: string }) {
  return (
    <label className="flex items-center gap-[12px] cursor-pointer">
      <div className="relative flex-shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors duration-200"></div>
        <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-[#FFFFFF] rounded-full transition-transform duration-200 peer-checked:translate-x-[16px]"></div>
      </div>
      <span className="text-[13px] text-[#1A1A19]">{label}</span>
    </label>
  );
}
