import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>

        {/* HERO */}
        <section className="bg-[#0F2744] pt-[120px] pb-0 px-6 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-[rgba(200,169,110,0.12)] border border-[rgba(200,169,110,0.28)] rounded-full px-4 py-[5px] mb-7">
              <div className="w-[5px] h-[5px] rounded-full bg-[#C8A96E]" />
              <span className="text-[#C8A96E] text-[11px] tracking-[0.08em] uppercase font-normal">
                Afrique centrale · Expertise industrielle
              </span>
            </div>

            {/* Titre */}
            <h1 className="font-serif text-[38px] md:text-[52px] font-medium text-white leading-[1.12] max-w-[640px] mb-5">
              Votre partenaire de confiance pour vos{' '}
              <span className="text-[#C8A96E]">marchés industriels</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-[15px] text-[rgba(255,255,255,0.6)] leading-[1.75] max-w-[480px] mb-9">
              Melanie Services&Prest. accompagne entreprises et institutions dans la réalisation de leurs projets — avec une traçabilité documentaire totale et un suivi en temps réel.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-[#C8A96E] text-[#0F2744] px-7 py-[13px] rounded-[8px] text-[14px] font-medium hover:bg-[#B8995E] transition-colors"
              >
                Accéder à mon espace
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-[rgba(255,255,255,0.22)] text-white px-7 py-[13px] rounded-[8px] text-[14px] hover:border-[rgba(200,169,110,0.5)] hover:text-[#C8A96E] transition-colors"
              >
                Nous contacter
              </Link>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[rgba(200,169,110,0.18)] bg-[rgba(200,169,110,0.07)]">
              {[
                { val: '12 ans', label: "d'expérience terrain" },
                { val: '60+', label: 'marchés exécutés' },
                { val: '100%', label: 'traçabilité documentaire' },
                { val: '24/7', label: 'accès partenaire sécurisé' },
              ].map((s, i) => (
                <div key={i} className="px-6 py-5 border-r border-[rgba(200,169,110,0.15)] last:border-r-0">
                  <div className="text-[26px] font-medium text-[#C8A96E]">{s.val}</div>
                  <div className="text-[11px] text-[rgba(255,255,255,0.45)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES PRINCIPAUX */}
        <section className="bg-[#FAFAF8] py-[80px] px-6">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-[11px] text-[#C8A96E] uppercase tracking-[0.1em] mb-3">Nos domaines</p>
            <h2 className="font-serif text-[32px] font-medium text-[#0F2744] mb-3">Ce que nous faisons</h2>
            <p className="text-[14px] text-[#7A7870] mb-12 max-w-[440px] leading-[1.7]">
              Des compétences techniques au service de vos projets les plus exigeants
            </p>

            {/* Grille 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[#DDD9D0] rounded-[12px] overflow-hidden">
              {[
                {
                  bg: 'bg-white',
                  accent: true,
                  title: 'Génie civil',
                  desc: 'Construction, réhabilitation et supervision de projets d\'infrastructure.',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 20h20"/><path d="M12 4C8 4 5 7 5 11v1h14v-1c0-4-3-7-7-7z"/>
                      <path d="M5 12H2v2a1 1 0 001 1h2"/><path d="M19 12h3v2a1 1 0 01-1 1h-2"/>
                    </svg>
                  ),
                },
                {
                  bg: 'bg-[#F5F0E8]',
                  title: 'Hydrocarbures & gaz',
                  desc: 'Expertise technique pour les projets pétroliers, gaziers et énergétiques.',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="3" width="12" height="16" rx="2"/>
                      <path d="M9 19v2M15 19v2"/><path d="M6 8h12"/><path d="M10 3V1M14 3V1"/>
                    </svg>
                  ),
                },
                {
                  bg: 'bg-[#F5F0E8]',
                  title: 'QHSE',
                  desc: 'Qualité, hygiène, sécurité et environnement — conformité et excellence opérationnelle.',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6L12 2z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  ),
                },
                {
                  bg: 'bg-white',
                  accent: true,
                  title: 'Matériel industriel',
                  desc: 'Achat, approvisionnement et livraison de matériel technique sur vos sites.',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                  ),
                },
              ].map((card, i) => (
                <div key={i} className={`${card.bg} p-8 relative`}>
                  {card.accent && (
                    <div className="absolute top-0 right-0 w-[3px] h-12 bg-[#C8A96E] rounded-bl-[3px]" />
                  )}
                  <div className="w-11 h-11 bg-[#0F2744] rounded-[10px] flex items-center justify-center mb-5">
                    {card.icon}
                  </div>
                  <h3 className="text-[16px] font-medium text-[#0F2744] mb-2">{card.title}</h3>
                  <p className="text-[13px] text-[#7A7870] leading-[1.7]">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECONDAIRES — pills */}
        <section className="bg-[#FAFAF8] pb-[64px] px-6">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-[13px] text-[#7A7870] mb-4">Également à votre service :</p>
            <div className="flex flex-wrap gap-3">
              {['Placement du personnel', 'Hébergement', 'Transport du personnel', 'Formations terrain', 'Assistance technique'].map(s => (
                <span key={s} className="inline-flex items-center gap-2 border border-[#DDD9D0] bg-white px-4 py-[9px] rounded-full text-[12px] text-[#5A5850]">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#C8A96E] flex-shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESSUS */}
        <section className="bg-[#0F2744] py-[72px] px-6">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-[11px] text-[#C8A96E] uppercase tracking-[0.1em] mb-3">Comment ça marche</p>
            <h2 className="font-serif text-[28px] font-medium text-white mb-12">
              Un suivi simple, du premier contact à la clôture
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[1px] bg-[rgba(255,255,255,0.08)] rounded-[8px] overflow-hidden">
              {[
                { num: '01', title: 'Premier contact', desc: 'Échange sur votre projet et vos besoins spécifiques.' },
                { num: '02', title: 'Espace créé', desc: 'Un espace sécurisé est ouvert pour votre marché.' },
                { num: '03', title: 'Suivi en temps réel', desc: 'Documents et rapports partagés instantanément avec notification.' },
                { num: '04', title: 'Clôture & archivage', desc: 'Tous vos livrables archivés et accessibles durablement.' },
              ].map((step) => (
                <div key={step.num} className="bg-[#0F2744] p-6">
                  <div className="text-[11px] text-[#C8A96E] tracking-[0.1em] mb-3">{step.num} —</div>
                  <h4 className="text-[14px] font-medium text-white mb-2">{step.title}</h4>
                  <p className="text-[12px] text-[rgba(255,255,255,0.42)] leading-[1.65]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-[#C8A96E] py-[72px] px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-serif text-[30px] font-medium text-[#0F2744] leading-[1.2] max-w-[420px]">
                Un projet à réaliser ensemble ?
              </h2>
              <p className="text-[14px] text-[rgba(15,39,68,0.65)] mt-3">
                Créez votre espace partenaire ou contactez-nous directement.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/login"
                className="bg-[#0F2744] text-white px-7 py-[13px] rounded-[8px] text-[14px] font-medium hover:bg-[#0a1e35] transition-colors"
              >
                Créer mon espace →
              </Link>
              <Link
                href="/contact"
                className="border border-[rgba(15,39,68,0.3)] text-[#0F2744] px-7 py-[13px] rounded-[8px] text-[14px] hover:border-[#0F2744] transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}