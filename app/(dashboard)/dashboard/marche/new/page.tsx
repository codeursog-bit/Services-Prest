'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ic = "w-full px-[13px] py-[9px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[var(--accent-ring)]";
const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]";

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
        <Link href="/dashboard/marche" className="inline-block text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-[32px]">
          ← Retour aux marchés
        </Link>

        {error && (
          <div className="mb-[20px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[12px] text-[13px] text-[var(--msp-red)]">{error}</div>
        )}

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[32px_36px]">
          <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-[8px]">Créer un marché</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mb-[28px]">
            Un marché est un projet ou contrat à exécuter avec un partenaire. Vous pourrez ensuite ajouter les étapes du planning.
          </p>
          <div className="h-[1px] bg-[var(--border)] mb-[28px]"></div>

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
                <p className="text-[11px] text-[var(--msp-amber)] mt-[4px]">
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

            <div className="h-[1px] bg-[var(--border)] mb-[24px]"></div>

            <div className="bg-[var(--bg-surface)] rounded-[8px] p-[14px] mb-[24px]">
              <p className="text-[12px] text-[var(--text-secondary)]">
                💡 Après la création, vous pourrez ajouter les étapes du planning d&apos;exécution, les audits, comptes-rendus et suivre l&apos;avancement.
              </p>
            </div>

            <div className="flex justify-end gap-[12px]">
              <Link href="/dashboard/marche"
                className="border border-[var(--border)] text-[var(--text-primary)] bg-[var(--bg-card)] py-[10px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--bg-surface)] transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={isPending}
                className={`bg-[var(--accent-primary)] text-[var(--bg-card)] py-[10px] px-[16px] rounded-[8px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[var(--msp-blue-mid)]'}`}>
                {isPending ? 'Création…' : 'Créer le marché'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
