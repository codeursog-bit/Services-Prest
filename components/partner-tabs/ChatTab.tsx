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
    <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] flex flex-col" style={{ height: '500px' }}>
      <div className="p-[16px_20px] border-b border-[#E8E7E4]">
        <h3 className="text-[14px] font-medium text-[#1A1A19]">Chat avec {partnerName}</h3>
        <p className="text-[12px] text-[#6B6A67] mt-[2px]">Messages en temps réel</p>
      </div>

      <div className="flex-1 overflow-y-auto p-[16px_20px] flex flex-col gap-[12px]">
        {messages.length === 0 && (
          <p className="text-[13px] text-[#6B6A67] text-center mt-[40px]">Aucun message. Démarrez la conversation.</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`text-[12px] text-[#6B6A67] mb-[4px] ${m.senderType === 'admin' ? 'text-right' : ''}`}>
              {m.senderType === 'admin' ? 'Vous' : partnerName}
            </div>
            <div className={`max-w-[70%] flex flex-col ${m.senderType === 'admin' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-[10px] p-[10px_14px] text-[13px] leading-[1.6] ${m.senderType === 'admin' ? 'bg-[#1A3A5C] text-[#FFFFFF]' : 'bg-[#F7F7F6] border border-[#E8E7E4] text-[#1A1A19]'}`}>
                {m.content}
              </div>
              <div className="text-[11px] text-[#6B6A67] mt-[4px]">
                {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>

      <div className="p-[12px_16px] border-t border-[#E8E7E4] flex gap-[8px]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Écrire un message..."
          className="flex-1 p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[13px] text-[#1A1A19] placeholder-[#6B6A67] focus:outline-none focus:border-[#1A3A5C]"
        />
        <button onClick={send} disabled={isPending || !input.trim()}
          className="bg-[#1A3A5C] text-[#FFFFFF] py-[10px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-50 transition-colors">
          Envoyer
        </button>
      </div>
    </div>
  );
}
