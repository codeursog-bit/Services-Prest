'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils';

interface Message {
  id:        string;
  subject:   string;
  content:   string;
  direction: string;
  isRead:    boolean;
  createdAt: string;
  author:    { name: string };
  partner:   { id: string; orgName: string; type: string };
  attachedDoc: { id: string; name: string; url: string; fileType: string } | null;
}

export default function MessagesPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [loading, setLoading]       = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter]         = useState<'all' | 'sent' | 'received'>('all');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [partners, setPartners]     = useState<{ id: string; orgName: string }[]>([]);
  const [docs, setDocs]             = useState<{ id: string; name: string }[]>([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startT] = useTransition();
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const ic = "w-full px-[13px] py-[9px] border border-[var(--border)] rounded-[8px] text-[13px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-[3px] focus:ring-[var(--accent-ring)]";
  const lc = "block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]";

  const load = async () => {
    const params = new URLSearchParams();
    if (filter === 'sent')     params.set('direction', 'MSP_TO_PARTNER');
    if (filter === 'received') params.set('direction', 'PARTNER_TO_MSP');
    if (partnerFilter)         params.set('partnerId', partnerFilter);

    const res  = await fetch(`/api/messages?${params}`);
    const data = await res.json();
    if (data.success) {
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    }
    setLoading(false);
  };

  // Chargement initial
  useEffect(() => {
    load();
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(d.partners || []));
    fetch('/api/documents?company=true').then(r => r.json()).then(d => setDocs(d.documents || []));
  }, [filter, partnerFilter]);

  // Polling toutes les 5s pour "effet temps réel"
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const res  = await fetch('/api/messages?direction=PARTNER_TO_MSP&unread=true');
      const data = await res.json();
      if (data.success && data.unreadCount !== unreadCount) {
        setUnreadCount(data.unreadCount);
        load(); // Recharger si nouveaux messages
      }
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [unreadCount, filter, partnerFilter]);

  // Marquer lu au clic
  const handleExpand = async (msg: Message) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
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

  // Envoyer un message
  const handleCompose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd  = new FormData(e.currentTarget);
    const body = {
      partnerId:     fd.get('partnerId')     as string,
      subject:       fd.get('subject')       as string,
      content:       fd.get('content')       as string,
      attachedDocId: fd.get('attachedDocId') as string || null,
    };

    if (!body.partnerId || !body.subject || !body.content) {
      setError('Destinataire, objet et message requis.'); return;
    }

    setError('');
    startT(async () => {
      const res  = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Erreur.'); return; }
      setSuccess('Message envoyé avec succès.');
      setShowCompose(false);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(''), 4000);
      load();
    });
  };

  const getFileIcon = (fileType: string) => {
    const color = fileType?.includes('pdf') ? 'var(--msp-red)'
      : fileType?.includes('sheet') || fileType?.includes('excel') ? 'var(--msp-green)'
      : 'var(--text-secondary)';
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  };

  return (
    <DashboardLayout pageTitle="Informations à transmettre">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[24px]">
        {[
          { label: 'Total messages',  value: messages.length, color: 'text-[var(--text-primary)]' },
          { label: 'Envoyés',         value: messages.filter(m => m.direction === 'MSP_TO_PARTNER').length, color: 'text-[var(--accent-primary)]' },
          { label: 'Reçus partenaires', value: messages.filter(m => m.direction === 'PARTNER_TO_MSP').length, color: 'text-[var(--msp-amber)]' },
          { label: 'Non lus',         value: unreadCount, color: unreadCount > 0 ? 'text-[var(--msp-red)]' : 'text-[var(--text-primary)]' },
        ].map(k => (
          <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[16px_20px]">
            <div className={`text-[24px] font-medium ${k.color}`}>{k.value}</div>
            <div className="text-[12px] text-[var(--text-secondary)] mt-[4px]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* FEEDBACK */}
      {success && <div className="mb-[16px] bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-green)]">{success}</div>}
      {error   && <div className="mb-[16px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-red)]">{error}</div>}

      {/* BARRE ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[12px] mb-[20px]">
        <div className="flex flex-wrap gap-[6px] items-center">
          {/* Filtre direction */}
          {[
            { id: 'all',      label: 'Tous' },
            { id: 'sent',     label: 'Envoyés' },
            { id: 'received', label: `Reçus${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={`py-[6px] px-[12px] rounded-[8px] text-[12px] border transition-colors ${
                filter === f.id
                  ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--bg-card)]'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
              }`}>
              {f.label}
            </button>
          ))}
          {/* Filtre partenaire */}
          <select value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}
            className="py-[6px] px-[10px] border border-[var(--border)] rounded-[8px] text-[12px] bg-[var(--bg-card)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)]">
            <option value="">Tous les partenaires</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.orgName}</option>)}
          </select>
        </div>
        <button onClick={() => setShowCompose(!showCompose)}
          className="flex-shrink-0 bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
          {showCompose ? '✕ Annuler' : '+ Transmettre une info'}
        </button>
      </div>

      {/* FORMULAIRE ENVOI */}
      {showCompose && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[24px] mb-[24px]">
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-[6px]">Transmettre une information</h3>
          <p className="text-[12px] text-[var(--text-secondary)] mb-[20px]">
            Le partenaire recevra un email de notification immédiatement et pourra consulter ce message dans son espace.
          </p>
          <form onSubmit={handleCompose}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[16px]">
              <div>
                <label className={lc}>Partenaire destinataire *</label>
                <select name="partnerId" required
                  value={selectedPartner}
                  onChange={e => { setSelectedPartner(e.target.value); setDocs([]); }}
                  className={ic}>
                  <option value="">Sélectionner un partenaire…</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.orgName}</option>)}
                </select>
              </div>
              <div>
                <label className={lc}>Objet *</label>
                <input type="text" name="subject" required
                  placeholder="Ex: Mise à jour protocoles QHSE, Rappel facturation…"
                  className={ic} />
              </div>
              <div className="md:col-span-2">
                <label className={lc}>Message *</label>
                <textarea name="content" rows={5} required
                  placeholder="Rédigez votre information ici…"
                  className={`${ic} resize-y`}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className={lc}>Joindre un document (optionnel)</label>
                <select name="attachedDocId" className={ic}>
                  <option value="">Aucun document joint</option>
                  {docs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <p className="text-[11px] text-[var(--text-secondary)] mt-[4px]">Documents disponibles dans le coffre-fort entreprise</p>
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <button type="button" onClick={() => setShowCompose(false)}
                className="border border-[var(--border)] text-[var(--text-primary)] py-[8px] px-[14px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--bg-surface)]">
                Annuler
              </button>
              <button type="submit" disabled={isPending}
                className="bg-[var(--accent-primary)] text-[var(--bg-card)] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] disabled:opacity-60">
                {isPending ? 'Envoi…' : 'Envoyer l\'information'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTE MESSAGES */}
      {loading ? (
        <div className="p-[48px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
      ) : messages.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-[48px] text-center">
          <svg className="mx-auto mb-[12px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <p className="text-[13px] text-[var(--text-secondary)]">Aucun message.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[6px]">
          {messages.map(msg => {
            const isReceived = msg.direction === 'PARTNER_TO_MSP';
            const isUnread   = !msg.isRead && isReceived;
            const isOpen     = expanded === msg.id;
            return (
              <div key={msg.id}
                className={`bg-[var(--bg-card)] border rounded-[10px] transition-all ${
                  isUnread ? 'border-[var(--accent-primary)]' : 'border-[var(--border)]'
                }`}>
                {/* EN-TÊTE — cliquable */}
                <button
                  className="w-full text-left p-[14px_20px] flex items-center gap-[12px]"
                  onClick={() => handleExpand(msg)}
                >
                  {/* Indicateur direction */}
                  <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                    isUnread ? 'bg-[var(--accent-primary)]' : isReceived ? 'bg-[var(--border)]' : 'bg-transparent'
                  }`}></div>

                  {/* Icône direction */}
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 ${
                    isReceived ? 'bg-[var(--msp-amber-light)]' : 'bg-[var(--msp-blue-light)]'
                  }`}>
                    {isReceived ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--msp-amber)" strokeWidth="1.5" strokeLinecap="round">
                        <polyline points="7 13 12 18 17 13"/><polyline points="12 6 12 18"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round">
                        <polyline points="7 11 12 6 17 11"/><polyline points="12 6 12 18"/>
                      </svg>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-[8px] flex-wrap">
                      <span className={`text-[13px] ${isUnread ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-primary)]'} truncate`}>
                        {msg.subject}
                      </span>
                      {isUnread && (
                        <span className="inline-block bg-[var(--accent-primary)] text-[var(--bg-card)] text-[10px] py-[1px] px-[6px] rounded-full flex-shrink-0">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-[8px] mt-[2px] text-[11px] text-[var(--text-secondary)] flex-wrap">
                      <span>{isReceived ? `De : ${msg.partner.orgName}` : `À : ${msg.partner.orgName}`}</span>
                      <span>·</span>
                      <span>{formatDate(msg.createdAt)}</span>
                      {!isOpen && (
                        <span className="truncate max-w-[200px]">— {msg.content.slice(0, 60)}{msg.content.length > 60 ? '…' : ''}</span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"
                    className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* CONTENU ÉTENDU */}
                {isOpen && (
                  <div className="px-[20px] pb-[16px] border-t border-[var(--border)]">
                    <div className="flex flex-wrap gap-[12px] text-[12px] text-[var(--text-secondary)] py-[12px] border-b border-[var(--border)] mb-[14px]">
                      <span>{isReceived ? 'De' : 'À'} : <strong className="text-[var(--text-primary)]">{msg.partner.orgName}</strong></span>
                      <span>Par : <strong className="text-[var(--text-primary)]">{msg.author.name}</strong></span>
                      <span>{formatDate(msg.createdAt)}</span>
                      <span className={`ml-auto inline-block border rounded-[6px] py-[1px] px-[6px] text-[11px] ${
                        isReceived ? 'border-[var(--msp-amber)] text-[var(--msp-amber)] bg-[var(--msp-amber-light)]' : 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--msp-blue-light)]'
                      }`}>
                        {isReceived ? 'Reçu' : 'Envoyé'}
                      </span>
                    </div>

                    <p className="text-[13px] text-[var(--text-primary)] leading-[1.7] whitespace-pre-wrap">{msg.content}</p>

                    {/* Document joint */}
                    {msg.attachedDoc && (
                      <a href={msg.attachedDoc.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-[6px] mt-[12px] border border-[var(--border)] rounded-[8px] py-[6px] px-[10px] text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
                        {getFileIcon(msg.attachedDoc.fileType)}
                        <span>{msg.attachedDoc.name}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-[14px]">
                      <div className="flex gap-[10px]">
                        {/* Répondre (crée un nouveau message vers ce partenaire) */}
                        <button
                          onClick={() => {
                            setShowCompose(true);
                            setSelectedPartner(msg.partner.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[12px] text-[var(--accent-primary)] hover:underline flex items-center gap-[4px]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/>
                          </svg>
                          Répondre
                        </button>
                        <Link href={`/dashboard/partners/${msg.partner.id}?tab=messages`}
                          className="text-[12px] text-[var(--text-secondary)] hover:underline">
                          Voir le partenaire
                        </Link>
                      </div>
                      <button onClick={() => handleDelete(msg.id)} disabled={isPending}
                        className="text-[12px] text-[var(--msp-red)] hover:underline disabled:opacity-50">
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

      {/* Indicateur polling */}
      <p className="text-[11px] text-[var(--text-secondary)] mt-[14px] text-center">
        Actualisation automatique toutes les 5 secondes
        {unreadCount > 0 && <span className="text-[var(--msp-red)] font-medium"> · {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}</span>}
      </p>
    </DashboardLayout>
  );
}
