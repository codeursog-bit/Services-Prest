'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessageAsPartner } from '@/lib/actions/chat';

interface Doc { id: string; name: string; fileType: string; size: string; url: string; createdAt: string; category?: string | null; }
interface Msg { id: string; subject: string; content: string; createdAt: string; author: { name: string }; }
interface ChatMsg { id: string; content: string; senderType: string; createdAt: string; }

interface Props {
  partner: {
    id: string; orgName: string; token: string;
    documents: Doc[]; messages: Msg[]; chatMessages: ChatMsg[];
  };
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PartnerSpaceClient({ partner }: Props) {
  const [tab, setTab] = useState<'documents' | 'messages' | 'chat'>('documents');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(partner.chatMessages);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Polling léger pour les nouveaux messages chat
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat?partnerId=${partner.id}`);
        const data = await res.json();
        if (data.messages) setChatMessages(data.messages);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [partner.id]);

  const sendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setChatInput('');
    const optimistic: ChatMsg = { id: `opt-${Date.now()}`, content: trimmed, senderType: 'partner', createdAt: new Date().toISOString() };
    setChatMessages(prev => [...prev, optimistic]);
    await sendChatMessageAsPartner(partner.token, trimmed);
    setSending(false);
  };

  const tabs = [
    { id: 'documents' as const, label: `Documents (${partner.documents.length})` },
    { id: 'messages' as const, label: `Informations reçues (${partner.messages.length})` },
    { id: 'chat' as const, label: 'Chat en direct' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      {/* HEADER */}
      <header className="bg-[#FFFFFF] border-b border-[#E8E7E4] p-[16px_24px] flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-[14px] font-medium text-[#1A1A19]">Melanie Services&Prest.</h1>
          <span className="block text-[12px] text-[#6B6A67] mt-[2px]">Votre partenaire idéal !</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="hidden sm:inline text-[13px] text-[#6B6A67]">Espace de {partner.orgName}</span>
          <span className="bg-[#EAF3DE] text-[#2D6A4F] text-[12px] px-[8px] py-[2px] rounded-[4px]">Accès sécurisé</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto p-[32px_24px]">
        {/* BIENVENUE */}
        <div className="bg-[#F7F7F6] rounded-[10px] p-[20px] mb-[28px]">
          <h2 className="text-[15px] font-medium text-[#1A1A19]">Bonjour {partner.orgName},</h2>
          <p className="text-[13px] text-[#6B6A67] mt-[8px] leading-[1.6]">
            Voici votre espace sécurisé partagé avec Melanie Services&Prest.<br/>
            Vous pouvez consulter les documents partagés, les informations transmises et échanger en direct.
          </p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#E8E7E4] mb-[24px] overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`whitespace-nowrap py-[10px] px-[20px] text-[13px] border-b-2 transition-colors ${tab === t.id ? 'text-[#1A1A19] font-medium border-[#1A3A5C]' : 'text-[#6B6A67] border-transparent hover:text-[#1A1A19]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* DOCUMENTS */}
        {tab === 'documents' && (
          <div>
            {partner.documents.length === 0 ? (
              <p className="text-[13px] text-[#6B6A67]">Aucun document partagé pour l&apos;instant.</p>
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[8px] flex flex-col">
                {partner.documents.map((doc, i) => (
                  <div key={doc.id} className={`flex justify-between items-center p-[14px_16px] ${i !== partner.documents.length - 1 ? 'border-b border-[#E8E7E4]' : ''}`}>
                    <div className="flex items-center gap-[12px]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/>
                      </svg>
                      <div>
                        <div className="text-[13px] font-medium text-[#1A1A19]">{doc.name}</div>
                        <div className="text-[12px] text-[#6B6A67] mt-[2px]">Partagé le {fmtDate(doc.createdAt)}{doc.category ? ` · ${doc.category}` : ''}</div>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-[13px] text-[#1A3A5C] hover:underline font-medium">Consulter</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div className="flex flex-col gap-[8px]">
            {partner.messages.length === 0 ? (
              <p className="text-[13px] text-[#6B6A67]">Aucune information reçue.</p>
            ) : partner.messages.map(msg => (
              <div key={msg.id} className="bg-[#F7F7F6] rounded-[8px] p-[16px]">
                <div className="flex justify-between items-start">
                  <h4 className="text-[13px] font-medium text-[#1A1A19]">Objet : {msg.subject}</h4>
                  <span className="text-[12px] text-[#6B6A67] whitespace-nowrap ml-[12px]">{fmtDate(msg.createdAt)}</span>
                </div>
                <p className="text-[13px] text-[#6B6A67] mt-[8px] leading-[1.6]">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* CHAT */}
        {tab === 'chat' && (
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto flex flex-col gap-[12px] mb-[16px] pr-[4px]">
              {chatMessages.length === 0 && (
                <p className="text-[13px] text-[#6B6A67] text-center mt-[40px]">Démarrez la conversation avec Melanie Services&Prest.</p>
              )}
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.senderType === 'partner' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-[10px] p-[10px_14px] text-[13px] leading-[1.6] ${m.senderType === 'partner' ? 'bg-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#F7F7F6] border border-[#E8E7E4] text-[#1A1A19]'}`}>
                    {m.content}
                    <div className={`text-[11px] mt-[4px] ${m.senderType === 'partner' ? 'text-[rgba(255,255,255,0.6)]' : 'text-[#6B6A67]'}`}>
                      {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>
            <div className="flex gap-[8px] border-t border-[#E8E7E4] pt-[16px]">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Votre message..."
                className="flex-1 p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[13px] text-[#1A1A19] placeholder-[#6B6A67] focus:outline-none focus:border-[#1A3A5C]"
              />
              <button onClick={sendChat} disabled={sending || !chatInput.trim()}
                className="bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-50 transition-colors">
                Envoyer
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full text-center p-[32px_0] border-t border-[#E8E7E4]">
        <span className="text-[13px] text-[#6B6A67]">Melanie Services&Prest. — Votre partenaire idéal !</span>
      </footer>
    </div>
  );
}
