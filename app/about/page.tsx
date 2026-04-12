import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* SECTION 1 — BANNIÈRE TITRE */}
        <section className="pt-[120px] pb-[60px] bg-[#FFFFFF] px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-[12px] text-[#6B6A67] mb-[20px]">
              <Link href="/" className="hover:text-[#1A1A19] transition-colors">Accueil</Link> / À propos
            </div>
            
            {/* Respect strict de la règle des tailles (22px mobile, 30px desktop) */}
            <h1 className="text-[22px] md:text-[30px] font-medium text-[#1A1A19]">
              À propos de Melanie Services&Prest.
            </h1>
            
            <div className="h-[1px] bg-[#E8E7E4] w-full mt-[40px]"></div>
          </div>
        </section>

        {/* SECTION 2 — MISSION & VISION */}
        <section className="bg-[#FFFFFF] py-[72px] px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[80px]">
              
              {/* COLONNE GAUCHE — Mission */}
              <div>
                <span className="block text-[11px] text-[#1A3A5C] uppercase tracking-[0.1em]">
                  Notre mission
                </span>
                {/* Règle absolue: utilisation de 22px au lieu de 20px car 20px est interdit */}
                <h2 className="text-[22px] font-medium text-[#1A1A19] mt-[12px] leading-[1.3]">
                  Être le partenaire de confiance de vos projets industriels
                </h2>
                <p className="text-[14px] text-[#6B6A67] leading-[1.8] mt-[16px]">
                  Depuis notre création, Melanie Services&Prest. s'engage à offrir 
                  des services techniques de haut niveau, avec une rigueur documentaire 
                  et une transparence totale dans le suivi d'exécution de chaque marché.
                </p>
              </div>

              {/* COLONNE DROITE — Vision */}
              <div>
                <span className="block text-[11px] text-[#1A3A5C] uppercase tracking-[0.1em]">
                  Notre vision
                </span>
                <h2 className="text-[22px] font-medium text-[#1A1A19] mt-[12px] leading-[1.3]">
                  Un suivi d'excellence, à chaque étape de vos marchés
                </h2>
                <p className="text-[14px] text-[#6B6A67] leading-[1.8] mt-[16px]">
                  Nous croyons qu'une exécution réussie repose sur la communication 
                  en temps réel, la traçabilité des documents et la confiance mutuelle 
                  entre toutes les parties prenantes d'un marché.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3 — NOS VALEURS */}
        <section className="bg-[#F7F7F6] py-[80px] px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-[22px] font-medium text-[#1A1A19] text-center mb-[48px]">
              Ce qui nous guide
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#E8E7E4]">
              
              {/* BLOC 1 — Fiabilité */}
              <div className="bg-[#F7F7F6] p-[28px] md:p-[36px_28px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v13M5 11H2a10 10 0 0020 0h-3"/>
                  <path d="M12 20l-3-3M12 20l3-3"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">Fiabilité</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Nos engagements sont tenus. Chaque délai, chaque livrable, chaque rapport.
                </p>
              </div>

              {/* BLOC 2 — Confidentialité */}
              <div className="bg-[#F7F7F6] p-[28px] md:p-[36px_28px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 018 0v4"/>
                  <circle cx="12" cy="16" r="1" fill="#1A3A5C"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">Confidentialité</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Vos données, vos documents, vos échanges : protégés et accessibles uniquement aux parties autorisées.
                </p>
              </div>

              {/* BLOC 3 — Réactivité */}
              <div className="bg-[#F7F7F6] p-[28px] md:p-[36px_28px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">Réactivité</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Notifications immédiates, partage en temps réel, réponse rapide à chaque sollicitation.
                </p>
              </div>

              {/* BLOC 4 — Excellence */}
              <div className="bg-[#F7F7F6] p-[28px] md:p-[36px_28px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7L2 9l7-1 3-6z"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">Excellence</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Normes internationales, processus certifiés, résultats mesurables et documentés.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4 — ÉQUIPE */}
        <section className="bg-[#FFFFFF] py-[80px] px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-[22px] font-medium text-[#1A1A19] text-center mb-[48px]">
              Notre équipe
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
              
              {/* PROFIL 1 */}
              <div className="text-center">
                <div className="w-[64px] h-[64px] bg-[#F7F7F6] border border-[#E8E7E4] rounded-full mx-auto flex items-center justify-center">
                  <span className="text-[18px] font-medium text-[#1A3A5C]">ML</span>
                </div>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">Marie L.</h3>
                <div className="text-[13px] text-[#6B6A67] mt-[4px]">Directrice générale</div>
                <div className="h-[1px] w-[24px] bg-[#E8E7E4] mx-auto mt-[16px]"></div>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[12px] max-w-[280px] mx-auto">
                  15 ans d'expérience dans la gestion de marchés industriels en Afrique centrale.
                </p>
              </div>

              {/* PROFIL 2 */}
              <div className="text-center">
                <div className="w-[64px] h-[64px] bg-[#F7F7F6] border border-[#E8E7E4] rounded-full mx-auto flex items-center justify-center">
                  <span className="text-[18px] font-medium text-[#1A3A5C]">DP</span>
                </div>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">David P.</h3>
                <div className="text-[13px] text-[#6B6A67] mt-[4px]">Responsable technique</div>
                <div className="h-[1px] w-[24px] bg-[#E8E7E4] mx-auto mt-[16px]"></div>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[12px] max-w-[280px] mx-auto">
                  Expert en génie civil et hydrocarbures, supervision de chantiers complexes.
                </p>
              </div>

              {/* PROFIL 3 */}
              <div className="text-center">
                <div className="w-[64px] h-[64px] bg-[#F7F7F6] border border-[#E8E7E4] rounded-full mx-auto flex items-center justify-center">
                  <span className="text-[18px] font-medium text-[#1A3A5C]">AC</span>
                </div>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[16px]">Alice C.</h3>
                <div className="text-[13px] text-[#6B6A67] mt-[4px]">Responsable QHSE & documentation</div>
                <div className="h-[1px] w-[24px] bg-[#E8E7E4] mx-auto mt-[16px]"></div>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[12px] max-w-[280px] mx-auto">
                  Certification ISO 9001, pilotage des audits et de la conformité réglementaire.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 5 — BANNIÈRE ENGAGEMENT */}
        <section className="bg-[#F7F7F6] py-[60px] border-t border-[#E8E7E4] px-4 text-center">
          <div className="max-w-[600px] mx-auto">
            <h2 className="text-[18px] font-medium text-[#1A1A19]">
              Melanie Services&Prest. — Votre partenaire idéal !
            </h2>
            <p className="text-[14px] text-[#6B6A67] mt-[8px]">
              Basée en Afrique centrale, présente là où vos projets se réalisent.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}