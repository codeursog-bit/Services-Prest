'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
const lc = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

export default function EditMarchePage({ params }: { params: { id: string } }) {
  const router  = useRouter();
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startT] = useTransition();
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/marche/${params.id}`)
      .then(r => r.json())
      .then(d => { setMarket(d.market); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const toDateInput = (d: string | null) => {
    if (!d) return '';
    return new Date(d).toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name:          fd.get('name')          as string,
      description:   fd.get('description')   as string,
      status:        fd.get('status')        as string,
      startDate:     fd.get('startDate')     as string,
      endDate:       fd.get('endDate')       as string,
      nextReviewDate:fd.get('nextReviewDate') as string,
    };

    setError('');
    startT(async () => {
      const res  = await fetch(`/api/marche/${params.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Erreur.'); return; }
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/marche/${params.id}`), 800);
    });
  };

  if (loading) return <DashboardLayout pageTitle="Chargement…"><div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div></DashboardLayout>;
  if (!market) return <DashboardLayout pageTitle="Introuvable"><div className="p-[48px] text-center text-[13px] text-[#9B2335]">Marché introuvable.</div></DashboardLayout>;

  return (
    <DashboardLayout pageTitle={`Modifier — ${market.name}`}>
      <div className="max-w-[680px] mx-auto">
        <Link href={`/dashboard/marche/${params.id}`} className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] mb-[32px]">
          ← Retour au marché
        </Link>

        {error   && <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">{error}</div>}
        {success && <div className="mb-[16px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[12px] text-[13px] text-[#2D6A4F]">Modifications enregistrées.</div>}

        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[32px_36px]">
          <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[28px]">Modifier le marché</h2>
          <div className="h-[1px] bg-[#E8E7E4] mb-[28px]"></div>

          <form onSubmit={handleSubmit}>
            <div className="mb-[20px]">
              <label className={lc}>Nom du marché *</label>
              <input type="text" name="name" required defaultValue={market.name} className={ic} />
            </div>

            <div className="mb-[20px]">
              <label className={lc}>Description</label>
              <textarea name="description" rows={3} defaultValue={market.description || ''} className={`${ic} resize-y`}></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[20px]">
              <div>
                <label className={lc}>Date de début</label>
                <input type="date" name="startDate" defaultValue={toDateInput(market.startDate)} className={ic} />
              </div>
              <div>
                <label className={lc}>Date de fin prévisionnelle</label>
                <input type="date" name="endDate" defaultValue={toDateInput(market.endDate)} className={ic} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[20px]">
              <div>
                <label className={lc}>Prochaine revue</label>
                <input type="date" name="nextReviewDate" defaultValue={toDateInput(market.nextReviewDate)} className={ic} />
              </div>
              <div>
                <label className={lc}>Statut</label>
                <select name="status" defaultValue={market.status} className={ic}>
                  <option value="EN_COURS">En cours</option>
                  <option value="SUSPENDU">Suspendu</option>
                  <option value="CLOTURE">Clôturé</option>
                  <option value="CONTENTIEUX">Contentieux</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-[12px] mt-[28px]">
              <Link href={`/dashboard/marche/${params.id}`}
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
