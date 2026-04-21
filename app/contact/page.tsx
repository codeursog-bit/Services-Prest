'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { sendContactMessage } from '@/lib/actions/contact';

const contactItems = [
  {
    icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>,
    label: 'Adresse',
    value: 'Avenue Principale, Pointe-Noire\nRépublique du Congo',
  },
  {
    icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92"/>,
    label: 'Téléphone',
    value: '+242 06 XXX XX XX',
  },
  {
    icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    label: 'Email',
    value: 'contact@melanieservices.com',
  },
];

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFormSubmit(formData: FormData) {
    setStatus('idle');
    startTransition(async () => {
      const result = await sendContactMessage(formData);
      if (result.success) { setStatus('success'); formRef.current?.reset(); }
      else setStatus('error');
    });
  }

  const inputCls = `
    w-full px-[13px] py-[10px] rounded-[8px] text-[13px] outline-none transition-all
    bg-white text-[#111827] placeholder-[#9CA3AF]
    border border-[#E5E7EB] focus:border-[#1A3A5C] focus:ring-[3px] focus:ring-[rgba(26,58,92,0.1)]
  `;

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'var(--site-bg, #F8F7F4)' }}>

        {/* Hero */}
        <section className="pt-[100px] pb-[52px] px-5" style={{ background: '#0F2744' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <Link href="/" className="hover:text-[#C8A96E] transition-colors">Accueil</Link>
              <span className="mx-2">/</span>
              <span style={{ color: '#C8A96E' }}>Contact</span>
            </div>
            <p className="section-tag mb-3">Parlons de votre projet</p>
            <h1 className="text-[34px] md:text-[44px] font-serif font-medium text-white leading-[1.15] max-w-[520px]">
              Contactez notre équipe
            </h1>
            <p className="text-[14px] mt-4 leading-[1.75]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Disponibles du lundi au vendredi de 7h30 à 17h30 — nous répondons dans les plus brefs délais.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-5 py-[72px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-[40px] lg:gap-[64px]">

              {/* GAUCHE */}
              <div className="lg:col-span-2 flex flex-col gap-[32px]">
                {/* Contact cards */}
                {contactItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-[16px]">
                    <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ background: '#0F2744' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {item.icon}
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.08em] font-medium mb-1" style={{ color: '#7A7870' }}>
                        {item.label}
                      </div>
                      <div className="text-[14px] font-medium whitespace-pre-line" style={{ color: '#1a1a18' }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ height: 1, background: '#E2DDD6' }} />

                {/* Horaires */}
                <div>
                  <div className="text-[10px] uppercase tracking-[0.08em] font-medium mb-3" style={{ color: '#7A7870' }}>
                    Horaires d'ouverture
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {[
                      { day: 'Lundi – Vendredi', hours: '7h30 – 17h30' },
                      { day: 'Samedi',           hours: '8h00 – 13h00' },
                      { day: 'Dimanche',         hours: 'Fermé' },
                    ].map(row => (
                      <div key={row.day} className="flex justify-between items-center py-[6px]"
                        style={{ borderBottom: '1px solid #F0EDE8' }}>
                        <span className="text-[13px]" style={{ color: '#1a1a18' }}>{row.day}</span>
                        <span className="text-[13px] font-medium" style={{ color: row.hours === 'Fermé' ? '#9CA3AF' : '#1A3A5C' }}>
                          {row.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DROITE — Formulaire */}
              <div className="lg:col-span-3">
                <div className="rounded-[16px] p-[36px]" style={{ background: 'white', border: '1px solid #E2DDD6', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <h2 className="text-[18px] font-semibold mb-2" style={{ color: '#1a1a18' }}>Envoyer un message</h2>
                  <p className="text-[13px] mb-[28px]" style={{ color: '#7A7870' }}>
                    Notre équipe vous répondra sous 24 heures ouvrées.
                  </p>

                  {status === 'success' && (
                    <div className="mb-[24px] flex items-start gap-[12px] p-[16px] rounded-[10px]"
                      style={{ background: '#e6f5ed', border: '1px solid #1e7e4e' }}>
                      <svg className="flex-shrink-0 mt-[2px]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1e7e4e" strokeWidth="1.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <p className="text-[13px]" style={{ color: '#1e7e4e' }}>Message envoyé avec succès. Nous vous répondrons sous 24h.</p>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="mb-[24px] p-[14px] rounded-[10px]"
                      style={{ background: '#FCEBEB', border: '1px solid #9B2335' }}>
                      <p className="text-[13px]" style={{ color: '#9B2335' }}>Une erreur est survenue. Réessayez ou contactez-nous directement.</p>
                    </div>
                  )}

                  <form ref={formRef} action={handleFormSubmit} className="flex flex-col gap-[18px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                      <div>
                        <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#1a1a18' }}>Nom complet *</label>
                        <input type="text" name="name" required className={inputCls} placeholder="Jean Dupont" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#1a1a18' }}>Société / Organisation</label>
                        <input type="text" name="company" className={inputCls} placeholder="Votre société" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                      <div>
                        <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#1a1a18' }}>Email *</label>
                        <input type="email" name="email" required className={inputCls} placeholder="jean@exemple.com" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#1a1a18' }}>Téléphone</label>
                        <input type="tel" name="phone" className={inputCls} placeholder="+242 06 XXX XX XX" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#1a1a18' }}>Objet *</label>
                      <select name="subject" required className={inputCls} style={{ cursor: 'pointer' }}>
                        <option value="">Sélectionnez un objet</option>
                        <option value="Demande commerciale">Demande commerciale</option>
                        <option value="Proposition de partenariat">Proposition de partenariat</option>
                        <option value="Candidature">Candidature</option>
                        <option value="Autre demande">Autre demande</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-[6px]" style={{ color: '#1a1a18' }}>Message *</label>
                      <textarea name="message" rows={5} required className={`${inputCls} resize-y`}
                        placeholder="Décrivez votre demande en détail…" />
                    </div>
                    <button type="submit" disabled={isPending}
                      className="w-full py-[12px] rounded-[8px] text-[14px] font-semibold transition-all mt-[4px] flex items-center justify-center gap-[8px]"
                      style={{
                        background: isPending ? '#8ba5c4' : '#1A3A5C',
                        color: 'white',
                        cursor: isPending ? 'wait' : 'pointer',
                        boxShadow: isPending ? 'none' : '0 2px 12px rgba(26,58,92,0.18)',
                      }}>
                      {isPending ? (
                        <>
                          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          Envoi en cours…
                        </>
                      ) : (
                        <>Envoyer le message</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
