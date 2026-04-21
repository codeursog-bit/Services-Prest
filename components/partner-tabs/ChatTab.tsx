'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { sendChatMessage } from '@/lib/actions/chat';

interface ChatMsg { id: string; content: string; senderType: string; createdAt: string; }

interface Props {
  partnerId: string;
  partnerName: string;
  initialMessages: ChatMsg[];
}

export default function ChatTab({ partnerId, partnerName, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Polling toutes les 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat?partnerId=${partnerId}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [partnerId]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    setInput('');
    const optimistic: ChatMsg = { id: `opt-${Date.now()}`, content: trimmed, senderType: 'admin', createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    startTransition(async () => {
      await sendChatMessage(partnerId, trimmed);
      const res = await fetch(`/api/chat?partnerId=${partnerId}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    });
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] flex flex-col" style={{ height: '500px' }}>
      <div className="p-[16px_20px] border-b border-[var(--border)]">
        <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Chat avec {partnerName}</h3>
        <p className="text-[12px] text-[var(--text-secondary)] mt-[2px]">Messages en temps réel</p>
      </div>

      <div className="flex-1 overflow-y-auto p-[16px_20px] flex flex-col gap-[12px]">
        {messages.length === 0 && (
          <p className="text-[13px] text-[var(--text-secondary)] text-center mt-[40px]">Aucun message. Démarrez la conversation.</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`text-[12px] text-[var(--text-secondary)] mb-[4px] ${m.senderType === 'admin' ? 'text-right' : ''}`}>
              {m.senderType === 'admin' ? 'Vous' : partnerName}
            </div>
            <div className={`max-w-[70%] flex flex-col ${m.senderType === 'admin' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-[10px] p-[10px_14px] text-[13px] leading-[1.6] ${m.senderType === 'admin' ? 'bg-[var(--accent-primary)] text-[#FFFFFF]' : 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)]'}`}>
                {m.content}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-[4px]">
                {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>

      <div className="p-[12px_16px] border-t border-[var(--border)] flex gap-[8px]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Écrire un message..."
          className="flex-1 p-[10px_14px] border border-[var(--border)] rounded-[8px] text-[13px] text-[var(--text-primary)] placeholder-[#6B6A67] focus:outline-none focus:border-[var(--accent-primary)]"
        />
        <button onClick={send} disabled={isPending || !input.trim()}
          className="bg-[var(--accent-primary)] text-[#FFFFFF] py-[10px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] disabled:opacity-50 transition-colors">
          Envoyer
        </button>
      </div>
    </div>
  );
}
