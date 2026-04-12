import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ServicesPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* SECTION 1 — BANNIÈRE */}
        <section className="pt-[120px] pb-[60px] bg-[#FFFFFF] px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-[12px] text-[#6B6A67] mb-[20px]">
              <Link href="/" className="hover:text-[#1A1A19] transition-colors">Accueil</Link> / Services
            </div>
            
            <h1 className="text-[22px] md:text-[30px] font-medium text-[#1A1A19]">
              Des services industriels complets, du génie civil au QHSE
            </h1>
            
            <div className="h-[1px] w-full bg-[#E8E7E4] mt-[40px]"></div>
          </div>
        </section>

        {/* SECTION 2 — SERVICES PRINCIPAUX */}
        <section className="bg-[#FFFFFF] py-[80px] px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-[22px] font-medium text-[#1A1A19] text-center mb-[56px]">
              Nos 4 domaines principaux
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
              
              {/* CARTE 1 — Génie civil */}
              <div className="border border-[#E8E7E4] bg-[#FFFFFF] rounded-[10px] p-[32px] hover:border-[#1A3A5C] transition-colors duration-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20h20"/>
                  <path d="M12 4C8 4 5 7 5 11v1h14v-1c0-4-3-7-7-7z"/>
                  <path d="M5 12H2v2a1 1 0 001 1h2"/>
                  <path d="M19 12h3v2a1 1 0 01-1 1h-2"/>
                </svg>
                <h3 className="text-[18px] font-medium text-[#1A1A19] mt-[20px]">Génie civil</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[10px]">
                  Construction et réhabilitation d'ouvrages, supervision de chantiers, gestion de projets d'infrastructure.
                </p>
                <div className="h-[1px] bg-[#E8E7E4] my-[20px]"></div>
                <ul className="flex flex-col gap-[8px]">
                  <li className="text-[13px] text-[#1A1A19]">— Maçonnerie et gros œuvre</li>
                  <li className="text-[13px] text-[#1A1A19]">— Voirie et réseaux divers</li>
                  <li className="text-[13px] text-[#1A1A19]">— Supervision et contrôle qualité</li>
                  <li className="text-[13px] text-[#1A1A19]">— Études et métrés</li>
                </ul>
              </div>

              {/* CARTE 2 — Hydrocarbures & gaz */}
              <div className="border border-[#E8E7E4] bg-[#FFFFFF] rounded-[10px] p-[32px] hover:border-[#1A3A5C] transition-colors duration-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="3" width="12" height="16" rx="2"/>
                  <path d="M9 19v2M15 19v2"/>
                  <path d="M6 8h12"/>
                  <path d="M10 3V1M14 3V1"/>
                </svg>
                <h3 className="text-[18px] font-medium text-[#1A1A19] mt-[20px]">Hydrocarbures & gaz</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[10px]">
                  Interventions techniques sur sites pétroliers et gaziers, maintenance industrielle, montage et soudure.
                </p>
                <div className="h-[1px] bg-[#E8E7E4] my-[20px]"></div>
                <ul className="flex flex-col gap-[8px]">
                  <li className="text-[13px] text-[#1A1A19]">— Maintenance des équipements de production</li>
                  <li className="text-[13px] text-[#1A1A19]">— Contrôle et inspection technique</li>
                  <li className="text-[13px] text-[#1A1A19]">— Soudure et tuyauterie industrielle</li>
                  <li className="text-[13px] text-[#1A1A19]">— Assistance technique sur site</li>
                </ul>
              </div>

              {/* CARTE 3 — QHSE */}
              <div className="border border-[#E8E7E4] bg-[#FFFFFF] rounded-[10px] p-[32px] hover:border-[#1A3A5C] transition-colors duration-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6L12 2z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <h3 className="text-[18px] font-medium text-[#1A1A19] mt-[20px]">QHSE</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[10px]">
                  Mise en place et pilotage des systèmes qualité, hygiène, sécurité et protection de l'environnement.
                </p>
                <div className="h-[1px] bg-[#E8E7E4] my-[20px]"></div>
                <ul className="flex flex-col gap-[8px]">
                  <li className="text-[13px] text-[#1A1A19]">— Audits internes et externes</li>
                  <li className="text-[13px] text-[#1A1A19]">— Rédaction de plans QHSE</li>
                  <li className="text-[13px] text-[#1A1A19]">— Formations sécurité sur site</li>
                  <li className="text-[13px] text-[#1A1A19]">— Gestion des incidents et non-conformités</li>
                </ul>
              </div>

              {/* CARTE 4 — Matériel industriel */}
              <div className="border border-[#E8E7E4] bg-[#FFFFFF] rounded-[10px] p-[32px] hover:border-[#1A3A5C] transition-colors duration-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                <h3 className="text-[18px] font-medium text-[#1A1A19] mt-[20px]">Achat & livraison de matériel</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[10px]">
                  Sourcing, approvisionnement et livraison de matériel technique et industriel sur vos sites, en Afrique et à l'international.
                </p>
                <div className="h-[1px] bg-[#E8E7E4] my-[20px]"></div>
                <ul className="flex flex-col gap-[8px]">
                  <li className="text-[13px] text-[#1A1A19]">— Identification et sourcing fournisseurs</li>
                  <li className="text-[13px] text-[#1A1A19]">— Contrôle qualité à la réception</li>
                  <li className="text-[13px] text-[#1A1A19]">— Logistique et transport sur site</li>
                  <li className="text-[13px] text-[#1A1A19]">— Gestion des stocks et inventaires</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3 — SERVICES SECONDAIRES */}
        <section className="bg-[#F7F7F6] py-[72px] px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-[22px] font-medium text-[#1A1A19]">
              Également à votre disposition
            </h2>
            <p className="text-[14px] text-[#6B6A67] mt-[8px] mb-[40px] max-w-[600px]">
              Des services complémentaires pour faciliter la réalisation de vos projets sur le terrain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#E8E7E4] rounded-[6px] overflow-hidden">
              
              {/* BLOC 1 — Ressources humaines */}
              <div className="bg-[#F7F7F6] p-[28px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="7" r="3"/>
                  <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                  <path d="M21 21v-2a4 4 0 00-3-3.85"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[14px]">Placement du personnel</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Mise à disposition de techniciens, ingénieurs et ouvriers qualifiés pour vos chantiers et projets industriels.
                </p>
              </div>

              {/* BLOC 2 — Hébergement & transport */}
              <div className="bg-[#F7F7F6] p-[28px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12L12 3l9 9"/>
                  <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[14px]">Hébergement & logement</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Solutions d'hébergement pour vos équipes en déplacement sur site, adaptées aux environnements industriels isolés.
                </p>
              </div>

              {/* BLOC 3 — Transport */}
              <div className="bg-[#F7F7F6] p-[28px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="12" rx="1"/>
                  <path d="M16 8h4l3 3v4h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <h3 className="text-[15px] font-medium text-[#1A1A19] mt-[14px]">Transport du personnel</h3>
                <p className="text-[13px] text-[#6B6A67] leading-[1.7] mt-[8px]">
                  Organisation et gestion du transport de vos équipes entre base de vie, aéroports et sites industriels.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4 — PROCESSUS DE COLLABORATION */}
        <section className="bg-[#FFFFFF] py-[80px] px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-[22px] font-medium text-[#1A1A19] text-center">
              Comment nous travaillons avec vous
            </h2>
            {/* L'espace sous le sous-titre a été géré via margin-bottom 56px */}
            <p className="text-[14px] text-[#6B6A67] text-center mt-[8px] mb-[56px]">
              Une méthode rigoureuse pour garantir la fluidité de chaque projet.
            </p>

            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-[40px] md:gap-[16px]">
              
              {/* Étape 1 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-[240px]">
                <div className="w-[28px] h-[28px] rounded-full border border-[#1A3A5C] text-[#1A3A5C] text-[11px] flex items-center justify-center font-medium">
                  01
                </div>
                <h3 className="text-[14px] font-medium text-[#1A1A19] mt-[12px]">Premier contact</h3>
                <p className="text-[12px] text-[#6B6A67] leading-[1.6] mt-[6px]">
                  Échange sur votre projet et vos besoins spécifiques.
                </p>
              </div>

              {/* Flèche (cachée sur mobile) */}
              <div className="hidden md:flex items-center justify-center h-[28px] text-[#E8E7E4]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 12h14M14 7l5 5-5 5"/>
                </svg>
              </div>

              {/* Étape 2 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-[240px]">
                <div className="w-[28px] h-[28px] rounded-full border border-[#1A3A5C] text-[#1A3A5C] text-[11px] flex items-center justify-center font-medium">
                  02
                </div>
                <h3 className="text-[14px] font-medium text-[#1A1A19] mt-[12px]">Création de votre espace</h3>
                <p className="text-[12px] text-[#6B6A67] leading-[1.6] mt-[6px]">
                  Un espace sécurisé est ouvert pour votre marché.
                </p>
              </div>

              {/* Flèche (cachée sur mobile) */}
              <div className="hidden md:flex items-center justify-center h-[28px] text-[#E8E7E4]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 12h14M14 7l5 5-5 5"/>
                </svg>
              </div>

              {/* Étape 3 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-[240px]">
                <div className="w-[28px] h-[28px] rounded-full border border-[#1A3A5C] text-[#1A3A5C] text-[11px] flex items-center justify-center font-medium">
                  03
                </div>
                <h3 className="text-[14px] font-medium text-[#1A1A19] mt-[12px]">Exécution & suivi</h3>
                <p className="text-[12px] text-[#6B6A67] leading-[1.6] mt-[6px]">
                  Partage en temps réel des documents et rapports d'avancement.
                </p>
              </div>

              {/* Flèche (cachée sur mobile) */}
              <div className="hidden md:flex items-center justify-center h-[28px] text-[#E8E7E4]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 12h14M14 7l5 5-5 5"/>
                </svg>
              </div>

              {/* Étape 4 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-[240px]">
                <div className="w-[28px] h-[28px] rounded-full border border-[#1A3A5C] text-[#1A3A5C] text-[11px] flex items-center justify-center font-medium">
                  04
                </div>
                <h3 className="text-[14px] font-medium text-[#1A1A19] mt-[12px]">Clôture & archivage</h3>
                <p className="text-[12px] text-[#6B6A67] leading-[1.6] mt-[6px]">
                  Tous les livrables archivés et accessibles durablement.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 5 — CTA */}
        <section className="bg-[#F7F7F6] py-[64px] px-4 text-center">
          <div className="max-w-[600px] mx-auto">
            {/* L'instruction limite les tailles, j'utilise 22px qui est conforme à h2 */}
            <h2 className="text-[22px] font-medium text-[#1A1A19]">
              Prêt à démarrer votre prochain marché ?
            </h2>
            
            <div className="mt-[36px] flex flex-col sm:flex-row justify-center items-center gap-[12px]">
              <Link 
                href="/contact" 
                className="w-full sm:w-auto bg-[#1A3A5C] text-[#FFFFFF] py-[12px] px-[24px] rounded-[6px] text-[14px] font-medium hover:bg-[#142d4a] transition-colors duration-200"
              >
                Nous contacter
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto border border-[#E8E7E4] text-[#1A1A19] bg-[#FFFFFF] py-[12px] px-[24px] rounded-[6px] text-[14px] font-medium hover:border-[#1A3A5C] hover:text-[#1A3A5C] transition-colors duration-200"
              >
                Accéder à mon espace
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}