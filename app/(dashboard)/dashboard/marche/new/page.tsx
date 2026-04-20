'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
const lc = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

export default function NewMarchePage() {
  const router  = useRouter();
  const [partners, setPartners] = useState<{ id: string; orgName: string }[]>([]);
  const [isPending, startT] = useTransition();
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/partners?status=ACTIF')
      .then(r => r.json())
      .then(d => setPartners(d.partners || []));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      partnerId:   fd.get('partnerId')   as string,
      name:        fd.get('name')        as string,
      description: fd.get('description') as string,
      startDate:   fd.get('startDate')   as string,
      endDate:     fd.get('endDate')     as string,
      status:      fd.get('status')      as string,
    };

    if (!body.partnerId || !body.name) {
      setError('Partenaire et nom du marché requis.'); return;
    }

    setError('');
    startT(async () => {
      const res  = await fetch('/api/marche', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Erreur.'); return; }
      router.push(`/dashboard/marche/${data.market.id}`);
    });
  };

  return (
    <DashboardLayout pageTitle="Nouveau marché">
      <div className="max-w-[680px] mx-auto">
        <Link href="/dashboard/marche" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] mb-[32px]">
          ← Retour aux marchés
        </Link>

        {error && (
          <div className="mb-[20px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">{error}</div>
        )}

        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[32px_36px]">
          <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[8px]">Créer un marché</h2>
          <p className="text-[13px] text-[#6B6A67] mb-[28px]">
            Un marché est un projet ou contrat à exécuter avec un partenaire. Vous pourrez ensuite ajouter les étapes du planning.
          </p>
          <div className="h-[1px] bg-[#E8E7E4] mb-[28px]"></div>

          <form onSubmit={handleSubmit}>
            {/* Partenaire */}
            <div className="mb-[20px]">
              <label className={lc}>Partenaire concerné *</label>
              <select name="partnerId" required className={ic}>
                <option value="">Sélectionner un partenaire</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.orgName}</option>
                ))}
              </select>
              {partners.length === 0 && (
                <p className="text-[11px] text-[#8B4513] mt-[4px]">
                  Aucun partenaire actif.{' '}
                  <Link href="/dashboard/partners/new" className="underline">En créer un</Link>
                </p>
              )}
            </div>

            {/* Nom du marché */}
            <div className="mb-[20px]">
              <label className={lc}>Nom du marché *</label>
              <input type="text" name="name" required placeholder="Ex: Construction bloc B — Port Autonome" className={ic} />
            </div>

            {/* Description */}
            <div className="mb-[20px]">
              <label className={lc}>Description</label>
              <textarea name="description" rows={3} placeholder="Contexte, objectifs, conditions particulières…" className={`${ic} resize-y`}></textarea>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[20px]">
              <div>
                <label className={lc}>Date de début</label>
                <input type="date" name="startDate" className={ic} />
              </div>
              <div>
                <label className={lc}>Date de fin prévisionnelle</label>
                <input type="date" name="endDate" className={ic} />
              </div>
            </div>

            {/* Statut initial */}
            <div className="mb-[32px]">
              <label className={lc}>Statut initial</label>
              <select name="status" defaultValue="EN_COURS" className={ic}>
                <option value="EN_COURS">En cours</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>

            <div className="h-[1px] bg-[#E8E7E4] mb-[24px]"></div>

            <div className="bg-[#F7F7F6] rounded-[8px] p-[14px] mb-[24px]">
              <p className="text-[12px] text-[#6B6A67]">
                💡 Après la création, vous pourrez ajouter les étapes du planning d&apos;exécution, les audits, comptes-rendus et suivre l&apos;avancement.
              </p>
            </div>

            <div className="flex justify-end gap-[12px]">
              <Link href="/dashboard/marche"
                className="border border-[#E8E7E4] text-[#1A1A19] bg-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={isPending}
                className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}>
                {isPending ? 'Création…' : 'Créer le marché'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
