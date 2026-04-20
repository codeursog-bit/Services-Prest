'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { formatDate } from '@/lib/utils';

interface Doc {
  id: string; name: string; fileType: string;
  size: string; url: string; createdAt: string;
  views: { viewedAt: string }[];
}
interface Msg {
  id: string; subject: string; content: string; createdAt: string;
  attachedDoc: { name: string; url: string } | null;
}
interface Partner {
  id: string; orgName: string; contactName: string; token: string;
}

export default function PartnerSpaceClient({
  partner, documents: initialDocs, messages: initialMessages,
}: {
  partner:   Partner;
  documents: Doc[];
  messages:  Msg[];
}) {
  const [tab, setTab]               = useState<'documents' | 'messages' | 'contact'>('documents');
  const [documents]                 = useState<Doc[]>(initialDocs);
  const [messages, setMessages]     = useState<Msg[]>(initialMessages);
  const [viewedIds, setViewedIds]   = useState<Set<string>>(new Set());
  const [isPending, startT]         = useTransition();
  const [msgSent, setMsgSent]       = useState(false);
  const [msgError, setMsgError]     = useState('');
  const [newCount, setNewCount]     = useState(0);
  const prevCountRef                = useRef(initialMessages.length);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // ── Polling toutes les 5s — donne l'impression de temps réel ────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/messages/partner?token=${partner.token}`);
        const data = await res.json();
        if (!data.success) return;
        const incoming: Msg[] = data.messages || [];
        // Si nouveaux messages → badge sur l'onglet
        if (incoming.length > prevCountRef.current) {
          setNewCount(incoming.length - prevCountRef.current);
        }
        prevCountRef.current = incoming.length;
        setMessages(incoming);
      } catch {
        // silencieux — on ne veut pas perturber l'expérience
      }
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [partner.token]);

  // ── Tracker la consultation d'un doc ────────────────────────────────────
  const trackView = async (docId: string) => {
    if (viewedIds.has(docId)) return;
    setViewedIds(prev => { const next = new Set(Array.from(prev)); next.add(docId); return next; });
    fetch('/api/documents/view', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ documentId: docId, token: partner.token }),
    }).catch(() => {});
  };

  // ── Envoyer un message à MSP ─────────────────────────────────────────────
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd      = new FormData(e.currentTarget);
    const subject = (fd.get('subject') as string).trim();
    const content = (fd.get('content') as string).trim();
    setMsgError('');

    if (!subject || !content) {
      setMsgError('Objet et message requis.'); return;
    }

    startT(async () => {
      const res  = await fetch('/api/messages/partner', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: partner.token, subject, content }),
      });
      const data = await res.json();
      if (data.success) {
        setMsgSent(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setMsgError(data.error || "Erreur lors de l'envoi.");
      }
    });
  };

  const getFileIcon = (fileType: string) => {
    const color = fileType?.includes('pdf') ? '#1A3A5C'
      : fileType?.includes('sheet') || fileType?.includes('excel') ? '#2D6A4F'
      : '#6B6A67';
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">

      {/* ── HEADER ── */}
      <header className="bg-[#FFFFFF] border-b border-[#E8E7E4] px-[24px] py-[14px] flex justify-between items-center sticky top-0 z-10">
        <div>
          <span className="block text-[14px] font-medium text-[#1A1A19]">Melanie Services&amp;Prest.</span>
          <span className="block text-[11px] text-[#6B6A67] mt-[1px]">Votre partenaire idéal !</span>
        </div>
        <div className="flex items-center gap-[10px]">
          <span className="hidden sm:block text-[12px] text-[#6B6A67]">Espace de {partner.orgName}</span>
          <span className="bg-[#EAF3DE] text-[#2D6A4F] text-[11px] px-[8px] py-[2px] rounded-[4px] border border-[#2D6A4F]">
            Accès sécurisé
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[820px] mx-auto px-[24px] py-[32px]">

        {/* ── BIENVENUE ── */}
        <div className="bg-[#F7F7F6] rounded-[10px] p-[20px] mb-[28px]">
          <h2 className="text-[15px] font-medium text-[#1A1A19]">Bonjour, {partner.orgName}</h2>
          <p className="text-[13px] text-[#6B6A67] mt-[6px] leading-[1.6]">
            Bienvenue dans votre espace de collaboration sécurisé.
            Consultez vos documents, lisez les informations transmises et contactez notre équipe directement.
          </p>
        </div>

        {/* ── ONGLETS ── */}
        <div className="flex border-b border-[#E8E7E4] mb-[24px] overflow-x-auto">
          {([
            { id: 'documents', label: `Documents (${documents.length})` },
            {
              id: 'messages',
              label: `Messages reçus (${messages.length})`,
              badge: newCount > 0 ? `${newCount} nouveau${newCount > 1 ? 'x' : ''}` : null,
            },
            { id: 'contact', label: 'Nous contacter' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === 'messages') setNewCount(0); }}
              className={`relative py-[10px] px-[16px] text-[13px] border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'text-[#1A1A19] font-medium border-[#1A3A5C]'
                  : 'text-[#6B6A67] border-transparent hover:text-[#1A1A19]'
              }`}
            >
              {t.label}
              {'badge' in t && t.badge && (
                <span className="ml-[6px] inline-block bg-[#1A3A5C] text-[#FFFFFF] text-[10px] px-[6px] py-[1px] rounded-full">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ DOCUMENTS ══ */}
        {tab === 'documents' && (
          documents.length === 0 ? (
            <div className="bg-[#F7F7F6] rounded-[10px] p-[40px] text-center text-[13px] text-[#6B6A67]">
              Aucun document partagé pour le moment.
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
              {documents.map((doc, idx) => (
                <div key={doc.id}
                  className={`flex justify-between items-center p-[14px_16px] ${
                    idx !== documents.length - 1 ? 'border-b border-[#E8E7E4]' : ''
                  }`}>
                  <div className="flex items-center gap-[12px] min-w-0">
                    {getFileIcon(doc.fileType)}
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#1A1A19] truncate">{doc.name}</div>
                      <div className="text-[11px] text-[#6B6A67] mt-[2px]">
                        Partagé le {formatDate(doc.createdAt)} · {doc.size}
                      </div>
                    </div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer"
                    onClick={() => trackView(doc.id)}
                    className="flex-shrink-0 ml-[12px] text-[13px] font-medium text-[#1A3A5C] hover:underline">
                    Consulter
                  </a>
                </div>
              ))}
            </div>
          )
        )}

        {/* ══ MESSAGES REÇUS ══ */}
        {tab === 'messages' && (
          sortedMessages.length === 0 ? (
            <div className="bg-[#F7F7F6] rounded-[10px] p-[40px] text-center text-[13px] text-[#6B6A67]">
              Aucune information reçue pour le moment.
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {sortedMessages.map(msg => (
                <div key={msg.id} className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
                  <div className="flex justify-between items-start gap-[12px] mb-[8px]">
                    <h4 className="text-[13px] font-medium text-[#1A1A19]">{msg.subject}</h4>
                    <span className="text-[11px] text-[#6B6A67] whitespace-nowrap flex-shrink-0">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B6A67] leading-[1.6] whitespace-pre-wrap">{msg.content}</p>
                  {msg.attachedDoc && (
                    <a href={msg.attachedDoc.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-[6px] mt-[10px] text-[12px] text-[#1A3A5C] hover:underline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                      </svg>
                      {msg.attachedDoc.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ══ NOUS CONTACTER ══ */}
        {tab === 'contact' && (
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
            <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[4px]">
              Envoyer un message à Melanie Services&amp;Prest.
            </h3>
            <p className="text-[12px] text-[#6B6A67] mb-[20px]">
              Votre message sera transmis directement à notre équipe et nous vous répondrons dans les meilleurs délais.
            </p>

            {msgSent ? (
              <div className="bg-[#EAF3DE] border border-[#2D6A4F] rounded-[8px] p-[16px] text-[13px] text-[#2D6A4F]">
                ✓ Votre message a bien été envoyé. Nous vous répondrons très prochainement.
                <button onClick={() => setMsgSent(false)}
                  className="block mt-[8px] text-[12px] text-[#2D6A4F] underline hover:no-underline">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex flex-col gap-[16px]">
                {msgError && (
                  <div className="bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[10px] text-[13px] text-[#9B2335]">
                    {msgError}
                  </div>
                )}
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Objet *</label>
                  <input type="text" name="subject" required
                    placeholder="Ex: Demande de renseignement, Suivi facturation…"
                    className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[13px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Message *</label>
                  <textarea name="content" rows={5} required
                    placeholder="Décrivez votre demande ou information…"
                    className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[13px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors resize-y"></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isPending}
                    className={`bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[20px] rounded-[6px] text-[13px] font-medium transition-colors ${
                      isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'
                    }`}>
                    {isPending ? 'Envoi en cours…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      <footer className="w-full text-center py-[24px] border-t border-[#E8E7E4]">
        <span className="text-[12px] text-[#6B6A67]">© Melanie Services&amp;Prest. — Votre partenaire idéal !</span>
      </footer>
    </div>
  );
}
