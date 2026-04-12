'use client';

import { useState, useEffect, useTransition } from 'react';
import { sendPartnerInfo } from '@/lib/actions/messages';

interface InfosTabProps {
  partnerId: string;
  partnerEmail: string;
  partnerName: string;
}

interface MessageItem {
  id: string;
  subject: string;
  content: string;
  createdAt: string | Date;
  author: { name: string };
  attachedDoc?: { name: string } | null;
}

export default function InfosTab({ partnerId, partnerEmail, partnerName, initialMessages = [] }: InfosTabProps & { initialMessages?: any[] }) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/messages?partnerId=${partnerId}`)
      .then(r => r.json())
      .then(data => { if (data.messages) setMessages(data.messages); })
      .catch(() => {});
  }, [partnerId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('partnerId', partnerId);
    const form = e.currentTarget;

    startTransition(async () => {
      const res = await sendPartnerInfo(formData);
      if (res.success) {
        setSuccess(true);
        setError('');
        form.reset();
        setTimeout(() => setSuccess(false), 5000);
        fetch(`/api/messages?partnerId=${partnerId}`)
          .then(r => r.json())
          .then(data => { if (data.messages) setMessages(data.messages); });
      } else {
        setError(res.error || 'Erreur lors de l\'envoi.');
      }
    });
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]";
  const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

  return (
    <div>
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px] mb-[20px]">
        <h2 className="text-[14px] font-medium text-[#1A1A19]">Transmettre une information</h2>
        <p className="text-[12px] text-[#6B6A67] mt-[4px] mb-[20px]">Cette information sera envoyée par email au partenaire et conservée dans l&apos;historique.</p>

        {success && (
          <div className="mb-[16px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[12px] text-[13px] text-[#2D6A4F]">
            L&apos;information a bien été transmise au partenaire.
          </div>
        )}
        {error && (
          <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <div>
            <label className={labelClass}>Destinataire</label>
            <div className="bg-[#F7F7F6] border border-[#E8E7E4] p-[8px_12px] rounded-[6px] text-[13px] text-[#6B6A67]">
              {partnerName} — {partnerEmail}
            </div>
          </div>
          <div>
            <label className={labelClass}>Objet *</label>
            <input type="text" name="subject" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Message *</label>
            <textarea name="message" rows={5} required className={`${inputClass} resize-y`}></textarea>
          </div>
          <div>
            <button type="submit" disabled={isPending}
              className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[20px] rounded-[6px] text-[13px] font-medium transition-colors ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}>
              {isPending ? 'Envoi en cours…' : "Envoyer l'information"}
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIQUE */}
      <div>
        <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">Historique ({messages.length})</h2>
        {messages.length === 0 ? (
          <p className="text-[13px] text-[#6B6A67]">Aucune information transmise à ce partenaire.</p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {messages.map(msg => (
              <div key={msg.id} className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[16px]">
                <div className="flex justify-between items-start">
                  <div className="text-[13px] font-medium text-[#1A1A19]">Objet : {msg.subject}</div>
                  <div className="text-[12px] text-[#6B6A67]">{formatDate(msg.createdAt)}</div>
                </div>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[10px] line-clamp-3">{msg.content}</p>
                <div className="flex items-center gap-[16px] mt-[10px]">
                  <span className="text-[12px] text-[#6B6A67]">Envoyé par : {msg.author?.name || '—'}</span>
                  <span className="bg-[#EAF3DE] text-[#2D6A4F] text-[12px] border border-[#2D6A4F] rounded-[4px] p-[2px_8px]">Email envoyé ✓</span>
                  {msg.attachedDoc && (
                    <span className="flex items-center gap-[4px] text-[12px] text-[#1A3A5C]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                      {msg.attachedDoc.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}