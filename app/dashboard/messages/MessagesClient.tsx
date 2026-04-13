'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { sendPartnerInfo } from '@/lib/actions/messages';

interface Message {
  id: string; subject: string; content: string; createdAt: string;
  partner: { id: string; orgName: string };
  author: { name: string };
  attachedDoc?: { name: string } | null;
}
interface Partner { id: string; orgName: string; }

interface Props {
  initialMessages: Message[];
  partners: Partner[];
}

export default function MessagesClient({ initialMessages, partners }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [filterPartner, setFilterPartner] = useState('Tous');
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const filteredMessages = filterPartner === 'Tous'
    ? messages
    : messages.filter(m => m.partner.id === filterPartner);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        await sendPartnerInfo(formData);
        setSuccess('Message envoyé avec succès.');
        form.reset();
        setTimeout(() => setSuccess(''), 4000);
        const res = await fetch('/api/messages?all=1');
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch {
        setError("Erreur lors de l'envoi.");
        setTimeout(() => setError(''), 4000);
      }
    });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      {success && <div className="mb-5 rounded-[6px] p-3" style={{ background: 'var(--green-bg)', border: '1px solid var(--green)' }}><span className="text-[13px]" style={{ color: 'var(--green)' }}>{success}</span></div>}
      {error && <div className="mb-5 rounded-[6px] p-3" style={{ background: 'var(--red-bg)', border: '1px solid var(--red)' }}><span className="text-[13px]" style={{ color: 'var(--red)' }}>{error}</span></div>}

      <div className="rounded-[10px] p-5 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Envoi rapide</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Partenaire destinataire *</label>
              <select name="partnerId" required className="dash-input">
                <option value="">Sélectionner un partenaire</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.orgName}</option>)}
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
            <button type="submit" disabled={isPending}
              className="py-2 px-5 rounded-[6px] text-[13px] font-medium disabled:opacity-70"
              style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
              {isPending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Historique global ({messages.length})
        </h2>
        <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)} className="dash-input w-full sm:w-[220px]">
          <option value="Tous">Tous les partenaires</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.orgName}</option>)}
        </select>
      </div>

      {filteredMessages.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun message envoyé.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMessages.map(msg => (
            <div key={msg.id} className="rounded-[8px] p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--navy-mid)' }}>
                  {msg.partner.orgName.substring(0, 2).toUpperCase()}
                </div>
                <Link href={`/dashboard/partners/${msg.partner.id}?tab=infos`}
                  className="text-[13px] font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {msg.partner.orgName}
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Objet : {msg.subject}</div>
                <div className="text-[12px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{fmtDate(msg.createdAt)}</div>
              </div>
              <p className="text-[13px] leading-[1.7] line-clamp-3 mb-3" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Par : {msg.author.name}</span>
                <span className="badge badge-green">Email envoyé ✓</span>
                {msg.attachedDoc && (
                  <span className="text-[12px]" style={{ color: 'var(--navy-mid)' }}>📎 {msg.attachedDoc.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}