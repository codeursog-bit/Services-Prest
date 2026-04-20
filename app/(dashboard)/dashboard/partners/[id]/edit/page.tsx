'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

export default function EditPartnerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/partners/${params.id}`)
      .then(r => r.json())
      .then(d => { setPartner(d.partner); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

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
      status:      fd.get('status')      as string,
      notifyOnDoc: fd.get('notifyOnDoc') === 'on',
      notifyAdmin: fd.get('notifyAdmin') === 'on',
    };

    setError(null);
    startTransition(async () => {
      const res  = await fetch(`/api/partners/${params.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Erreur.'); return; }
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/partners/${params.id}`), 1000);
    });
  };

  if (loading) return (
    <DashboardLayout pageTitle="Modifier le partenaire">
      <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
    </DashboardLayout>
  );

  if (!partner) return (
    <DashboardLayout pageTitle="Modifier le partenaire">
      <div className="p-[48px] text-center text-[13px] text-[#9B2335]">Partenaire introuvable.</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout pageTitle={`Modifier — ${partner.orgName}`}>
      <div className="max-w-[640px] mx-auto">
        <Link href={`/dashboard/partners/${params.id}`} className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors mb-[32px]">
          ← Retour au partenaire
        </Link>

        {error && (
          <div className="mb-[20px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">{error}</div>
        )}
        {success && (
          <div className="mb-[20px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[12px] text-[13px] text-[#2D6A4F]">Modifications enregistrées. Redirection…</div>
        )}

        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[32px_36px]">
          <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[28px]">Modifier le partenaire</h2>
          <div className="h-[1px] w-full bg-[#E8E7E4] mb-[28px]"></div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Nom de l&apos;organisation *</label>
                <input type="text" name="orgName" required defaultValue={partner.orgName} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nom du contact principal *</label>
                <input type="text" name="contactName" required defaultValue={partner.contactName} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" name="email" required defaultValue={partner.email} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input type="tel" name="phone" defaultValue={partner.phone || ''} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Type *</label>
                <select name="type" required defaultValue={partner.type} className={inputClass}>
                  <option value="CLIENT">Client</option>
                  <option value="FOURNISSEUR">Fournisseur</option>
                  <option value="SOUS_TRAITANT">Sous-traitant</option>
                  <option value="PRESTATAIRE">Prestataire</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Statut</label>
                <select name="status" defaultValue={partner.status} className={inputClass}>
                  <option value="ACTIF">Actif</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[20px]">
              <div>
                <label className={labelClass}>Secteur d&apos;activité</label>
                <select name="sector" defaultValue={partner.sector || ''} className={inputClass}>
                  <option value="">—</option>
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
              <div>
                <label className={labelClass}>Adresse</label>
                <input type="text" name="address" defaultValue={partner.address || ''} className={inputClass} />
              </div>
            </div>

            <div className="mb-[28px]">
              <label className={labelClass}>Notes internes</label>
              <textarea name="notes" rows={3} defaultValue={partner.notes || ''} className={`${inputClass} resize-y`}></textarea>
            </div>

            <div className="h-[1px] w-full bg-[#E8E7E4] mb-[24px]"></div>

            <div className="mb-[32px]">
              <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Notifications</h3>
              <div className="flex flex-col gap-[14px]">
                {[
                  { name: 'notifyOnDoc', checked: partner.notifyOnDoc, label: 'Notifier le partenaire à chaque document partagé' },
                  { name: 'notifyAdmin', checked: partner.notifyAdmin, label: 'Recevoir une copie des notifications' },
                ].map(t => (
                  <label key={t.name} className="flex items-center gap-[12px] cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" name={t.name} defaultChecked={t.checked} className="peer sr-only" />
                      <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors"></div>
                      <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-white rounded-full transition-transform peer-checked:translate-x-[16px]"></div>
                    </div>
                    <span className="text-[13px] text-[#1A1A19]">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-[12px]">
              <Link href={`/dashboard/partners/${params.id}`}
                className="border border-[#E8E7E4] text-[#1A1A19] bg-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={isPending || success}
                className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}>
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
