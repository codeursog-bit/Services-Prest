'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { sendContactMessage } from '@/lib/actions/contact';

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFormSubmit(formData: FormData) {
    setStatus('idle');
    startTransition(async () => {
      const result = await sendContactMessage(formData);
      if (result.success) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
      }
    });
  }

  // Classes partagées pour les inputs (respect strict des règles CSS)
  const inputClassName = `w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] focus:ring-[3px] focus:ring-[rgba(26,58,92,0.08)] transition-all duration-150`;
  const labelClassName = `block text-[12px] font-medium text-[#1A1A19] mb-[6px]`;

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <section className="pt-[120px] pb-[80px] px-4">
          <div className="max-w-[1200px] mx-auto">
            
            {/* Grille : 2 colonnes desktop (40/60), 1 colonne mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-[40px] lg:gap-[80px]">
              
              {/* COLONNE GAUCHE — Informations (40%) */}
              <div className="lg:col-span-2">
                <div className="text-[12px] text-[#6B6A67] mb-[20px]">
                  <Link href="/" className="hover:text-[#1A1A19] transition-colors">Accueil</Link> / Nous contacter
                </div>
                
                <h1 className="text-[28px] font-medium text-[#1A1A19]">
                  Nous contacter
                </h1>
                
                <p className="text-[14px] text-[#6B6A67] leading-[1.8] mt-[16px]">
                  Notre équipe est disponible pour répondre à vos demandes dans les plus brefs délais.
                </p>

                <div className="h-[1px] bg-[#E8E7E4] my-[32px]"></div>

                <div className="flex flex-col gap-[24px]">
                  {/* BLOC Adresse */}
                  <div className="flex items-start gap-[14px]">
                    <div className="mt-[2px]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] text-[#6B6A67] uppercase tracking-[0.08em]">Adresse</span>
                      <span className="block text-[14px] text-[#1A1A19] font-medium mt-[2px]">Avenue Principale, Pointe-Noire, République du Congo</span>
                    </div>
                  </div>

                  {/* BLOC Téléphone */}
                  <div className="flex items-start gap-[14px]">
                    <div className="mt-[2px]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] text-[#6B6A67] uppercase tracking-[0.08em]">Téléphone</span>
                      <span className="block text-[14px] text-[#1A1A19] font-medium mt-[2px]">+242 06 XXX XX XX</span>
                    </div>
                  </div>

                  {/* BLOC Email */}
                  <div className="flex items-start gap-[14px]">
                    <div className="mt-[2px]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] text-[#6B6A67] uppercase tracking-[0.08em]">Email</span>
                      <span className="block text-[14px] text-[#1A1A19] font-medium mt-[2px]">contact@melanieservices.com</span>
                    </div>
                  </div>
                </div>

                <div className="mt-[32px]">
                  <div className="h-[1px] bg-[#E8E7E4] mb-[24px]"></div>
                  <span className="block text-[11px] text-[#6B6A67] uppercase tracking-[0.08em]">Horaires d'ouverture</span>
                  <div className="text-[13px] text-[#1A1A19] mt-[8px] leading-[1.8]">
                    Lundi – Vendredi : 7h30 – 17h30<br />
                    Samedi : 8h00 – 13h00
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE — Formulaire (60%) */}
              <div className="lg:col-span-3">
                <div className="bg-[#F7F7F6] p-[40px] rounded-[10px] border border-[#E8E7E4]">
                  <h2 className="text-[16px] font-medium text-[#1A1A19] mb-[28px]">
                    Envoyer un message
                  </h2>

                  {/* Messages de statut */}
                  {status === 'success' && (
                    <div className="mb-[24px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[16px] flex items-start gap-[12px]">
                      <svg className="flex-shrink-0 mt-[2px]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p className="text-[13px] text-[#2D6A4F]">
                        Votre message a bien été envoyé. Nous vous répondrons sous 24h.
                      </p>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="mb-[24px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[16px]">
                      <p className="text-[13px] text-[#9B2335]">
                        Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
                      </p>
                    </div>
                  )}

                  <form ref={formRef} action={handleFormSubmit} className="flex flex-col gap-[20px]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                      {/* CHAMP 1 : Nom */}
                      <div>
                        <label htmlFor="name" className={labelClassName}>Nom complet *</label>
                        <input id="name" type="text" name="name" required className={inputClassName} />
                      </div>

                      {/* CHAMP 2 : Société */}
                      <div>
                        <label htmlFor="company" className={labelClassName}>Société / Organisation</label>
                        <input id="company" type="text" name="company" className={inputClassName} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                      {/* CHAMP 3 : Email */}
                      <div>
                        <label htmlFor="email" className={labelClassName}>Email *</label>
                        <input id="email" type="email" name="email" required className={inputClassName} />
                      </div>

                      {/* CHAMP 4 : Téléphone */}
                      <div>
                        <label htmlFor="phone" className={labelClassName}>Téléphone</label>
                        <input id="phone" type="tel" name="phone" className={inputClassName} />
                      </div>
                    </div>

                    {/* CHAMP 5 : Objet */}
                    <div>
                      <label htmlFor="subject" className={labelClassName}>Objet de votre demande *</label>
                      <select id="subject" name="subject" required className={inputClassName}>
                        <option value="">Sélectionnez un objet</option>
                        <option value="Demande commerciale">Demande commerciale</option>
                        <option value="Proposition de partenariat">Proposition de partenariat</option>
                        <option value="Candidature">Candidature</option>
                        <option value="Autre demande">Autre demande</option>
                      </select>
                    </div>

                    {/* CHAMP 6 : Message */}
                    <div>
                      <label htmlFor="message" className={labelClassName}>Message *</label>
                      <textarea id="message" name="message" rows={5} required className={`${inputClassName} resize-y`}></textarea>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[12px] rounded-[6px] text-[14px] font-medium mt-[4px] transition-all duration-200 
                        ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}
                    >
                      {isPending ? 'Envoi en cours…' : 'Envoyer le message'}
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