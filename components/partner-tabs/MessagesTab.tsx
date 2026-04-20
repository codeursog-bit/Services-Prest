'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string; subject: string; content: string;
  direction: string; isRead: boolean; createdAt: string;
  author: { name: string };
  attachedDoc: { id: string; name: string; url: string } | null;
}
interface Doc { id: string; name: string; }

// ─────────────────────────────────────────────────────────────────────────────
// Onglet "Infos à transmettre" — envoyer un message + historique envois
// ─────────────────────────────────────────────────────────────────────────────
export function InfosTab({
  partnerId, partnerEmail, partnerName,
}: {
  partnerId: string; partnerEmail: string; partnerName: string;
}) {
  const [sent, setSent]         = useState<Message[]>([]);
  const [docs, setDocs]         = useState<Doc[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isPending, startT]     = useTransition();
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
  const lc = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

  const loadSent = () => {
    fetch(`/api/messages?partnerId=${partnerId}&direction=MSP_TO_PARTNER`)
      .then(r => r.json())
      .then(d => { setSent(d.messages || []); setLoading(false); });
  };

  useEffect(() => {
    loadSent();
    fetch('/api/documents?company=true').then(r => r.json()).then(d => setDocs(d.documents || []));
  }, [partnerId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const body = {
      partnerId,
      subject:       (fd.get('subject') as string).trim(),
      content:       (fd.get('content') as string).trim(),
      attachedDocId: (fd.get('attachedDocId') as string) || null,
    };

    if (!body.subject || !body.content) { setError('Objet et message requis.'); return; }
    setError('');

    startT(async () => {
      const res  = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Erreur.'); return; }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 6000);
      loadSent();
    });
  };

  return (
    <div>
      {/* FORMULAIRE */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px] mb-[24px]">
        <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[4px]">Transmettre une information</h3>
        <p className="text-[12px] text-[#6B6A67] mb-[20px]">
          Un email sera envoyé immédiatement à <strong>{partnerName}</strong> ({partnerEmail}).
          Le message sera visible dans son espace.
        </p>

        {success && (
          <div className="mb-[16px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[12px] text-[13px] text-[#2D6A4F]">
            ✓ Information transmise avec succès à {partnerName}.
          </div>
        )}
        {error && (
          <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
          <div>
            <label className={lc}>Destinataire</label>
            <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[6px] p-[10px_14px] text-[13px] text-[#6B6A67]">
              {partnerName} · {partnerEmail}
            </div>
          </div>
          <div>
            <label className={lc}>Objet *</label>
            <input type="text" name="subject" required
              placeholder="Ex: Mise à jour protocoles QHSE, Rappel facturation…"
              className={ic} />
          </div>
          <div>
            <label className={lc}>Message *</label>
            <textarea name="content" rows={5} required
              className={`${ic} resize-y`}
              placeholder="Rédigez votre information ici…"></textarea>
          </div>
          <div>
            <label className={lc}>Joindre un document (optionnel)</label>
            <select name="attachedDocId" className={ic}>
              <option value="">Aucun document joint</option>
              {docs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <p className="text-[11px] text-[#6B6A67] mt-[4px]">Documents du coffre-fort entreprise</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isPending}
              className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[20px] rounded-[6px] text-[13px] font-medium transition-colors ${
                isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'
              }`}>
              {isPending ? 'Envoi en cours…' : "Envoyer l'information"}
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIQUE */}
      <div>
        <h3 className="text-[13px] font-medium text-[#1A1A19] mb-[12px]">Historique des envois ({sent.length})</h3>
        {loading ? (
          <p className="text-[13px] text-[#6B6A67]">Chargement…</p>
        ) : sent.length === 0 ? (
          <div className="bg-[#F7F7F6] rounded-[8px] p-[24px] text-center text-[13px] text-[#6B6A67]">
            Aucune information transmise à ce partenaire.
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {sent.map(msg => (
              <div key={msg.id} className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[14px_16px]">
                <div className="flex justify-between items-start gap-[8px] mb-[6px]">
                  <span className="text-[13px] font-medium text-[#1A1A19]">{msg.subject}</span>
                  <span className="text-[11px] text-[#6B6A67] whitespace-nowrap flex-shrink-0">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-[13px] text-[#6B6A67] leading-[1.6] line-clamp-2">{msg.content}</p>
                <div className="flex items-center gap-[10px] mt-[8px] flex-wrap">
                  <span className="text-[12px] text-[#6B6A67]">Par : {msg.author.name}</span>
                  <span className="inline-block bg-[#EAF3DE] border border-[#2D6A4F] text-[#2D6A4F] rounded-[4px] py-[1px] px-[6px] text-[11px]">
                    Email envoyé ✓
                  </span>
                  {msg.attachedDoc && (
                    <a href={msg.attachedDoc.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-[4px] text-[12px] text-[#1A3A5C] hover:underline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                      </svg>
                      {msg.attachedDoc.name}
                    </a>
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

// ─────────────────────────────────────────────────────────────────────────────
// Onglet "Messages" — conversation complète avec polling 5s
// ─────────────────────────────────────────────────────────────────────────────
export function MessagesTab({
  partnerId, partnerName, partnerEmail,
}: {
  partnerId: string; partnerName: string; partnerEmail?: string;
}) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [loading, setLoading]         = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [isPending, startT]           = useTransition();
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const loadMessages = async () => {
    const res  = await fetch(`/api/messages?partnerId=${partnerId}`);
    const data = await res.json();
    if (data.success) {
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    // Polling 5s — simule la réactivité temps réel sans WebSocket
    pollRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [partnerId]);

  const handleExpand = async (msg: Message) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
    // Marquer lu automatiquement à l'ouverture
    if (!msg.isRead && msg.direction === 'PARTNER_TO_MSP') {
      await fetch(`/api/messages/${msg.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    startT(async () => {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
    });
  };

  const sorted = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[13px] text-[#6B6A67]">{sorted.length} message{sorted.length > 1 ? 's' : ''}</span>
          {unreadCount > 0 && (
            <span className="inline-block bg-[#1A3A5C] text-[#FFFFFF] text-[11px] px-[7px] py-[1px] rounded-full">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#6B6A67] italic">Actualisation auto</span>
      </div>

      {loading ? (
        <div className="p-[32px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
      ) : sorted.length === 0 ? (
        <div className="bg-[#F7F7F6] rounded-[10px] p-[32px] text-center text-[13px] text-[#6B6A67]">
          Aucun message échangé avec {partnerName}.
        </div>
      ) : (
        <div className="flex flex-col gap-[6px]">
          {sorted.map(msg => {
            const isReceived = msg.direction === 'PARTNER_TO_MSP';
            const isUnread   = !msg.isRead && isReceived;
            const isOpen     = expanded === msg.id;

            return (
              <div key={msg.id}
                className={`bg-[#FFFFFF] border rounded-[10px] transition-colors ${
                  isUnread ? 'border-[#1A3A5C]' : 'border-[#E8E7E4]'
                }`}>
                {/* ROW — cliquable */}
                <button
                  className="w-full text-left p-[12px_16px] flex items-center gap-[10px]"
                  onClick={() => handleExpand(msg)}
                >
                  {/* Point non lu */}
                  <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                    isUnread ? 'bg-[#1A3A5C]' : 'bg-transparent'
                  }`}></div>

                  {/* Badge direction */}
                  <span className={`inline-block border rounded-[4px] py-[1px] px-[6px] text-[10px] flex-shrink-0 ${
                    isReceived
                      ? 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]'
                      : 'border-[#1A3A5C] text-[#1A3A5C] bg-[#E8EEF5]'
                  }`}>
                    {isReceived ? '↓ Reçu' : '↑ Envoyé'}
                  </span>

                  <div className="flex-1 min-w-0">
                    <span className={`text-[13px] block truncate ${isUnread ? 'font-medium text-[#1A1A19]' : 'text-[#1A1A19]'}`}>
                      {msg.subject}
                    </span>
                    <span className="text-[11px] text-[#6B6A67]">{formatDate(msg.createdAt)}</span>
                  </div>

                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.5" strokeLinecap="round"
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* CONTENU ÉTENDU */}
                {isOpen && (
                  <div className="px-[16px] pb-[14px] border-t border-[#E8E7E4]">
                    <div className="flex flex-wrap gap-[10px] py-[10px] mb-[12px] text-[12px] text-[#6B6A67]">
                      <span>
                        {isReceived ? 'De' : 'À'} : <strong className="text-[#1A1A19]">
                          {isReceived ? partnerName : msg.author.name}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-[#1A1A19] leading-[1.7] whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachedDoc && (
                      <a href={msg.attachedDoc.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-[6px] mt-[10px] text-[12px] text-[#1A3A5C] hover:underline border border-[#E8E7E4] rounded-[6px] py-[5px] px-[10px] hover:bg-[#F7F7F6] transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                        </svg>
                        {msg.attachedDoc.name}
                      </a>
                    )}
                    <div className="flex justify-end mt-[10px]">
                      <button onClick={() => handleDelete(msg.id)} disabled={isPending}
                        className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Export default pour compatibilité avec import direct
export default InfosTab;
