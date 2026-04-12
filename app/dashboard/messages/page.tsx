'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { sendPartnerInfo } from '@/lib/actions/messages';

export default function MessagesPage() {
  const [filterPartner, setFilterPartner] = useState('Tous');
  const [isPending, setIsPending] = useState(false);

  const partners = [
    { id: '1', name: 'Société Alpha SA' },
    { id: '2', name: 'Entreprise Beta' },
    { id: '3', name: 'Construction & Co' },
  ];

  const messages = [
    {
      id: 1, partner: 'Société Alpha SA', partnerId: '1',
      subject: 'Mise à jour des protocoles QHSE', date: '10 Jan 2026',
      content: "Bonjour, veuillez trouver ci-joint les nouveaux protocoles QHSE applicables à partir du mois prochain. Merci d'en prendre connaissance et de diffuser à vos équipes sur site.",
      author: 'Marie L.', attached: 'Protocoles_V3.pdf',
    },
    {
      id: 2, partner: 'Entreprise Beta', partnerId: '2',
      subject: 'Rappel facturation', date: '05 Jan 2026',
      content: 'Nous sommes en attente de la facture concernant les travaux de décembre.',
      author: 'David P.', attached: null,
    },
  ];

  const filteredMessages = filterPartner === 'Tous' ? messages : messages.filter(m => m.partnerId === filterPartner);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    await sendPartnerInfo(formData);
    setIsPending(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <DashboardLayout userInitials="ML" pageTitle="Informations à transmettre">

      {/* ENVOI RAPIDE */}
      <div className="rounded-[10px] p-5 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Envoi rapide</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Partenaire destinataire *</label>
              <select name="partnerId" required className="dash-input">
                <option value="">Sélectionner un partenaire</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Objet *</label>
              <input type="text" name="subject" required className="dash-input" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Message *</label>
            <textarea name="message" rows={3} required className="dash-input resize-y" />
          </div>
          <div className="flex justify-end">
            <button
              type="submit" disabled={isPending}
              className="py-2 px-5 rounded-[6px] text-[13px] font-medium transition-colors disabled:opacity-70"
              style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
              {isPending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIQUE */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Historique global</h2>
          <select
            value={filterPartner}
            onChange={e => setFilterPartner(e.target.value)}
            className="dash-input w-full sm:w-[220px]">
            <option value="Tous">Tous les partenaires</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          {filteredMessages.map(msg => (
            <div key={msg.id} className="rounded-[8px] p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--navy-mid)' }}>
                  {msg.partner.substring(0, 2).toUpperCase()}
                </div>
                <Link href={`/dashboard/partners/${msg.partnerId}?tab=infos`}
                  className="text-[13px] font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {msg.partner}
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Objet : {msg.subject}</div>
                <div className="text-[12px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{msg.date}</div>
              </div>

              <p className="text-[13px] leading-[1.7] line-clamp-3 mb-3" style={{ color: 'var(--text-secondary)' }}>
                {msg.content}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Envoyé par : {msg.author}</span>
                <span className="badge badge-green">Email envoyé ✓</span>
                {msg.attached && (
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--navy-mid)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    {msg.attached}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}