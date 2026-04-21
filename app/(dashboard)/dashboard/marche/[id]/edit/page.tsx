'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ic = "w-full px-[13px] py-[9px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[var(--accent-ring)]";
const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]";

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

  if (loading) return <DashboardLayout pageTitle="Chargement…"><div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div></DashboardLayout>;
  if (!market) return <DashboardLayout pageTitle="Introuvable"><div className="p-[48px] text-center text-[13px] text-[var(--msp-red)]">Marché introuvable.</div></DashboardLayout>;

  return (
    <DashboardLayout pageTitle={`Modifier — ${market.name}`}>
      <div className="max-w-[680px] mx-auto">
        <Link href={`/dashboard/marche/${params.id}`} className="inline-block text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-[32px]">
          ← Retour au marché
        </Link>

        {error   && <div className="mb-[16px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[12px] text-[13px] text-[var(--msp-red)]">{error}</div>}
        {success && <div className="mb-[16px] bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[12px] text-[13px] text-[var(--msp-green)]">Modifications enregistrées.</div>}

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[32px_36px]">
          <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-[28px]">Modifier le marché</h2>
          <div className="h-[1px] bg-[var(--border)] mb-[28px]"></div>

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
                className="border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)] py-[10px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--bg-surface)] transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={isPending || success}
                className={`bg-[var(--accent-primary)] text-[var(--bg-card)] py-[10px] px-[16px] rounded-[8px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[var(--msp-blue-mid)]'}`}>
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
