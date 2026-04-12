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
      if (result?.error) setError(result.error);
    });
  };

  return (
    <DashboardLayout userInitials="ML" pageTitle="Nouveau partenaire">
      <div className="max-w-[640px] mx-auto">

        <Link href="/dashboard/partners"
          className="inline-block text-[12px] mb-8 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          ← Retour à la liste
        </Link>

        {error && (
          <div className="mb-5 rounded-[6px] p-3" style={{ background: 'var(--red-bg)', border: '1px solid var(--red)' }}>
            <span className="text-[13px]" style={{ color: 'var(--red)' }}>{error}</span>
          </div>
        )}

        <div className="rounded-[10px] p-6 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[18px] font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
            Informations du partenaire
          </h2>
          <div className="h-px w-full mb-6" style={{ background: 'var(--border)' }} />

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nom de l&apos;organisation *</label>
                <input type="text" name="orgName" required className="dash-input" />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nom du contact principal *</label>
                <input type="text" name="contactName" required className="dash-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email du contact *</label>
                <input type="email" name="email" required className="dash-input" />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Téléphone</label>
                <input type="tel" name="phone" className="dash-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Type de partenaire *</label>
                <select name="type" required className="dash-input">
                  <option value="">Sélectionnez un type</option>
                  <option value="Client">Client</option>
                  <option value="Fournisseur">Fournisseur</option>
                  <option value="Sous-traitant">Sous-traitant</option>
                  <option value="Prestataire">Prestataire</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Secteur d&apos;activité</label>
                <select name="sector" className="dash-input">
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

            <div className="mb-4">
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Adresse / Localisation</label>
              <input type="text" name="address" className="dash-input" />
            </div>

            <div className="mb-8">
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Notes internes (non visibles par le partenaire)</label>
              <textarea name="notes" rows={3} className="dash-input resize-y" />
            </div>

            <div className="h-px w-full mb-6" style={{ background: 'var(--border)' }} />

            <div className="mb-8">
              <h3 className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Paramètres de notification</h3>
              <div className="flex flex-col gap-3">
                {[
                  { name: 'notifyPartner', label: 'Notifier le partenaire par email lors de chaque nouveau document partagé', checked: true },
                  { name: 'notifyAdmin',   label: "Envoyer une copie des notifications à l'admin", checked: true },
                ].map(item => (
                  <label key={item.name} className="flex items-center gap-3 cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <input type="checkbox" name={item.name} defaultChecked={item.checked} className="peer sr-only" />
                      <div className="w-9 h-5 rounded-full transition-colors duration-200 peer-checked:bg-[var(--navy)] bg-[var(--border)]" />
                      <div className="absolute left-[2px] top-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-4" />
                    </div>
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/partners"
                className="py-2.5 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Annuler
              </Link>
              <button type="submit" disabled={isPending}
                className="py-2.5 px-4 rounded-[6px] text-[13px] font-medium transition-colors disabled:opacity-70"
                style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
                {isPending ? 'Création en cours...' : "Créer l'espace partenaire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}