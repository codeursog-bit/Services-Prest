'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { sendPartnerInfo } from '@/lib/actions/messages';

export default function MessagesPage() {
  const [filterPartner, setFilterPartner] = useState('Tous');
  const [isPending, setIsPending] = useState(false);

  // Mocks
  const partners = [
    { id: '1', name: 'Société Alpha SA' },
    { id: '2', name: 'Entreprise Beta' },
    { id: '3', name: 'Construction & Co' },
  ];

  const messages = [
    { id: 1, partner: 'Société Alpha SA', partnerId: '1', subject: 'Mise à jour des protocoles QHSE', date: '10 Jan 2026', content: 'Bonjour, veuillez trouver ci-joint les nouveaux protocoles QHSE applicables à partir du mois prochain. Merci d\'en prendre connaissance et de diffuser à vos équipes sur site.', author: 'Marie L.', attached: 'Protocoles_V3.pdf' },
    { id: 2, partner: 'Entreprise Beta', partnerId: '2', subject: 'Rappel facturation', date: '05 Jan 2026', content: 'Nous sommes en attente de la facture concernant les travaux de décembre.', author: 'David P.', attached: null },
  ];

  const filteredMessages = filterPartner === 'Tous' ? messages : messages.filter(m => m.partnerId === filterPartner);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    await sendPartnerInfo(formData); // Mocké dans l'action existante
    setIsPending(false);
    (e.target as HTMLFormElement).reset();
  };

  const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]";
  const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

  return (
    <DashboardLayout userInitials="ML" pageTitle="Informations à transmettre">
      
      {/* ENVOI RAPIDE */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px] mb-[32px]">
        <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Envoi rapide</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div>
              <label className={labelClass}>Partenaire destinataire *</label>
              <select name="partnerId" required className={inputClass}>
                <option value="">Sélectionner un partenaire</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Objet *</label>
              <input type="text" name="subject" required className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Message *</label>
            <textarea name="message" rows={3} required className={`${inputClass} resize-y`}></textarea>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" disabled={isPending}
              className={`bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[20px] rounded-[6px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}
            >
              {isPending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIQUE GLOBAL */}
      <div>
        <div className="flex justify-between items-center mb-[16px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19]">Historique global</h2>
          <select 
            value={filterPartner} 
            onChange={(e) => setFilterPartner(e.target.value)}
            className="p-[6px_12px] border border-[#E8E7E4] rounded-[6px] text-[12px] bg-[#FFFFFF] text-[#6B6A67] focus:outline-none focus:border-[#1A3A5C]"
          >
            <option value="Tous">Tous les partenaires</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-[8px]">
          {filteredMessages.map(msg => (
            <div key={msg.id} className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[16px]">
              <div className="flex items-center gap-[12px] mb-[12px] pb-[12px] border-b border-[#E8E7E4]">
                <div className="w-[28px] h-[28px] rounded-full bg-[#FFFFFF] border border-[#E8E7E4] flex items-center justify-center text-[11px] font-medium text-[#1A3A5C]">
                  {msg.partner.substring(0, 2).toUpperCase()}
                </div>
                <Link href={`/dashboard/partners/${msg.partnerId}?tab=infos`} className="text-[13px] font-medium text-[#1A1A19] hover:text-[#1A3A5C] transition-colors">
                  {msg.partner}
                </Link>
              </div>

              <div className="flex justify-between items-start">
                <div className="text-[13px] font-medium text-[#1A1A19]">Objet : {msg.subject}</div>
                <div className="text-[12px] text-[#6B6A67]">{msg.date}</div>
              </div>
              
              <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[10px] line-clamp-3">
                {msg.content}
              </p>
              
              <div className="flex flex-wrap items-center gap-[16px] mt-[10px]">
                <span className="text-[12px] text-[#6B6A67]">Envoyé par : {msg.author}</span>
                <span className="bg-[#EAF3DE] text-[#2D6A4F] text-[12px] border border-[#2D6A4F] rounded-[4px] p-[2px_8px]">Email envoyé ✓</span>
                {msg.attached && (
                  <span className="flex items-center gap-[4px] text-[12px] text-[#1A3A5C]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Fichier joint : {msg.attached}
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