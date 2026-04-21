'use client';

import Image from 'next/image';
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
  const [tab, setTab]             = useState<'documents' | 'messages' | 'contact'>('documents');
  const [documents]               = useState<Doc[]>(initialDocs);
  const [messages, setMessages]   = useState<Msg[]>(initialMessages);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [isPending, startT]       = useTransition();
  const [msgSent, setMsgSent]     = useState(false);
  const [msgError, setMsgError]   = useState('');
  const [newCount, setNewCount]   = useState(0);
  const prevCountRef = useRef(initialMessages.length);
  const pollRef      = useRef<ReturnType<typeof setInterval>>();

  // Polling 5s
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/messages/partner?token=${partner.token}`);
        const data = await res.json();
        if (!data.success) return;
        const incoming: Msg[] = data.messages || [];
        if (incoming.length > prevCountRef.current) {
          setNewCount(incoming.length - prevCountRef.current);
        }
        prevCountRef.current = incoming.length;
        setMessages(incoming);
      } catch { /* silencieux */ }
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [partner.token]);

  const trackView = async (docId: string) => {
    if (viewedIds.has(docId)) return;
    setViewedIds(prev => { const next = new Set(Array.from(prev)); next.add(docId); return next; });
    fetch('/api/documents/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId, token: partner.token }),
    }).catch(() => {});
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd      = new FormData(e.currentTarget);
    const subject = (fd.get('subject') as string).trim();
    const content = (fd.get('content') as string).trim();
    setMsgError('');
    if (!subject || !content) { setMsgError('Objet et message requis.'); return; }
    startT(async () => {
      const res  = await fetch('/api/messages/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: partner.token, subject, content }),
      });
      const data = await res.json();
      if (data.success) { setMsgSent(true); (e.target as HTMLFormElement).reset(); }
      else setMsgError(data.error || "Erreur lors de l'envoi.");
    });
  };

  const getFileExt = (ft: string) => {
    if (ft?.includes('pdf'))   return { label: 'PDF',  bg: '#fff0eb', color: '#E8500A' };
    if (ft?.includes('sheet') || ft?.includes('excel')) return { label: 'XLS', bg: '#e6f5ed', color: '#1e7e4e' };
    if (ft?.includes('word'))  return { label: 'DOC',  bg: '#e8f0f8', color: '#1A3A5C' };
    return { label: 'FIC', bg: '#F3F4F6', color: '#6B7280' };
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const inputCls = `w-full px-[13px] py-[10px] rounded-[8px] text-[13px] outline-none transition-all
    bg-white text-[#111827] placeholder-[#9CA3AF]
    border border-[#E5E7EB] focus:border-[#1A3A5C] focus:ring-[3px] focus:ring-[rgba(26,58,92,0.1)]`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F4F8' }}>

      {/* HEADER */}
      <header className="sticky top-0 z-10" style={{ background: '#0F2744', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div className="max-w-[900px] mx-auto px-[20px] h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <div className="w-8 h-8 rounded-[8px] bg-white/10 flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="MSP" width={32} height={32} className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <span className="block text-[13px] font-semibold text-white">Melanie Services&Prest.</span>
              <span className="block text-[10px]" style={{ color: 'rgba(200,169,110,0.75)' }}>Espace partenaire</span>
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <span className="hidden sm:block text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {partner.orgName}
            </span>
            <span className="flex items-center gap-[5px] text-[11px] font-medium px-[10px] py-[4px] rounded-full"
              style={{ background: 'rgba(30,126,78,0.2)', color: '#34a86b', border: '1px solid rgba(30,126,78,0.3)' }}>
              <span className="w-[5px] h-[5px] rounded-full bg-[#34a86b] animate-pulse-dot" />
              Accès sécurisé
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[900px] mx-auto px-[16px] py-[28px]">

        {/* Bienvenue card */}
        <div className="rounded-[14px] p-[20px_24px] mb-[24px] flex items-start gap-[16px]"
          style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1A3A5C, #E8500A)' }}>
            {partner.orgName.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: '#111827' }}>
              Bonjour, {partner.orgName} 👋
            </h2>
            <p className="text-[13px] mt-[4px] leading-[1.6]" style={{ color: '#6B7280' }}>
              Bienvenue dans votre espace de collaboration sécurisé. Consultez vos documents, lisez les informations transmises et contactez notre équipe directement.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-[4px] mb-[20px] p-[4px] rounded-[10px]"
          style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          {([
            { id: 'documents', label: 'Documents', count: documents.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            { id: 'messages',  label: 'Messages',  count: messages.length,  badge: newCount, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            { id: 'contact',   label: 'Nous contacter', count: 0, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92"/></svg> },
          ] as const).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id}
                onClick={() => { setTab(t.id); if (t.id === 'messages') setNewCount(0); }}
                className="flex-1 flex items-center justify-center gap-[6px] py-[8px] rounded-[7px] text-[12.5px] font-medium transition-all"
                style={{
                  background: active ? '#1A3A5C' : 'transparent',
                  color:      active ? 'white'   : '#6B7280',
                }}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                {t.count > 0 && (
                  <span className="text-[10px] px-[6px] py-[1px] rounded-full font-medium"
                    style={{
                      background: active ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                      color:      active ? 'white' : '#6B7280',
                    }}>
                    {t.count}
                  </span>
                )}
                {'badge' in t && (t as any).badge > 0 && (
                  <span className="text-[10px] px-[5px] py-[1px] rounded-full font-medium text-white"
                    style={{ background: '#E8500A' }}>
                    {(t as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* DOCUMENTS */}
        {tab === 'documents' && (
          documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] rounded-[14px]"
              style={{ background: 'white', border: '1px solid #E5E7EB' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" className="mb-3">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-[13px]" style={{ color: '#9CA3AF' }}>Aucun document partagé pour le moment.</p>
            </div>
          ) : (
            <div className="rounded-[14px] overflow-hidden" style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {documents.map((doc, idx) => {
                const ext = getFileExt(doc.fileType);
                return (
                  <div key={doc.id}
                    className="flex items-center gap-[14px] px-[20px] py-[14px] transition-colors"
                    style={{ borderBottom: idx !== documents.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="w-[38px] h-[38px] rounded-[8px] flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: ext.bg, color: ext.color }}>
                      {ext.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: '#111827' }}>{doc.name}</div>
                      <div className="text-[11px] mt-[2px]" style={{ color: '#9CA3AF' }}>
                        {formatDate(doc.createdAt)} · {doc.size}
                        {doc.views.length > 0 && (
                          <span className="ml-2" style={{ color: '#1e7e4e' }}>✓ Consulté</span>
                        )}
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" onClick={() => trackView(doc.id)}
                      className="flex-shrink-0 flex items-center gap-[5px] px-[12px] py-[6px] rounded-[6px] text-[12px] font-medium transition-all"
                      style={{ background: '#1A3A5C', color: 'white' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#2a5080')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#1A3A5C')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Ouvrir
                    </a>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* MESSAGES */}
        {tab === 'messages' && (
          sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] rounded-[14px]"
              style={{ background: 'white', border: '1px solid #E5E7EB' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" className="mb-3">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <p className="text-[13px]" style={{ color: '#9CA3AF' }}>Aucune information reçue pour le moment.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {sortedMessages.map(msg => (
                <div key={msg.id} className="rounded-[12px] p-[18px_20px]"
                  style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex justify-between items-start gap-[12px] mb-[10px]">
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: '#E8500A' }} />
                      <h4 className="text-[13px] font-semibold" style={{ color: '#111827' }}>{msg.subject}</h4>
                    </div>
                    <span className="text-[11px] flex-shrink-0" style={{ color: '#9CA3AF' }}>{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-[13px] leading-[1.65] whitespace-pre-wrap pl-[16px]" style={{ color: '#6B7280' }}>{msg.content}</p>
                  {msg.attachedDoc && (
                    <a href={msg.attachedDoc.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-[6px] mt-[12px] ml-[16px] text-[12px] font-medium px-[10px] py-[5px] rounded-[6px] transition-all"
                      style={{ background: '#e8f0f8', color: '#1A3A5C' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                      {msg.attachedDoc.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* CONTACT */}
        {tab === 'contact' && (
          <div className="rounded-[14px] p-[28px]" style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: '#111827' }}>
              Envoyer un message à Melanie Services&Prest.
            </h3>
            <p className="text-[13px] mb-[24px]" style={{ color: '#6B7280' }}>
              Votre message sera transmis directement à notre équipe. Nous vous répondrons dans les meilleurs délais.
            </p>

            {msgSent ? (
              <div className="flex items-start gap-[12px] p-[18px] rounded-[10px]"
                style={{ background: '#e6f5ed', border: '1px solid #1e7e4e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e7e4e" strokeWidth="1.8" strokeLinecap="round" className="flex-shrink-0 mt-[1px]"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: '#1e7e4e' }}>Message envoyé avec succès !</p>
                  <p className="text-[12px] mt-1" style={{ color: '#1e7e4e' }}>Nous vous répondrons très prochainement.</p>
                  <button onClick={() => setMsgSent(false)}
                    className="text-[12px] mt-2 underline hover:no-underline" style={{ color: '#1e7e4e' }}>
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex flex-col gap-[16px]">
                {msgError && (
                  <div className="p-[12px] rounded-[8px] text-[13px]" style={{ background: '#FCEBEB', border: '1px solid #9B2335', color: '#9B2335' }}>
                    {msgError}
                  </div>
                )}
                <div>
                  <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#111827' }}>Objet *</label>
                  <input type="text" name="subject" required className={inputCls}
                    placeholder="Ex : Suivi facturation, demande d'information…" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#111827' }}>Message *</label>
                  <textarea name="content" rows={5} required className={`${inputCls} resize-y`}
                    placeholder="Décrivez votre demande ou information…" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isPending}
                    className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-[8px] text-[13px] font-semibold transition-all"
                    style={{
                      background: isPending ? '#8ba5c4' : '#1A3A5C',
                      color: 'white',
                      cursor: isPending ? 'wait' : 'pointer',
                      boxShadow: isPending ? 'none' : '0 2px 10px rgba(26,58,92,0.2)',
                    }}>
                    {isPending ? 'Envoi…' : 'Envoyer le message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-[20px]" style={{ borderTop: '1px solid #E5E7EB' }}>
        <span className="text-[11px]" style={{ color: '#9CA3AF' }}>
          © Melanie Services&Prest. — Votre partenaire idéal !
        </span>
      </footer>
    </div>
  );
}
