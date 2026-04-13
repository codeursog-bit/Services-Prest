'use client';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const values = [
  {
    title: 'Fiabilité',
    desc: 'Nos engagements sont tenus. Chaque délai, chaque livrable, chaque rapport.',
    icon: <><circle cx="12" cy="5" r="2"/><path d="M12 7v13M5 11H2a10 10 0 0020 0h-3"/><path d="M12 20l-3-3M12 20l3-3"/></>,
  },
  {
    title: 'Confidentialité',
    desc: 'Vos données et documents sont protégés et accessibles uniquement aux parties autorisées.',
    icon: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/><circle cx="12" cy="16" r="1" fill="var(--gold)"/></>,
  },
  {
    title: 'Réactivité',
    desc: 'Notifications immédiates, partage en temps réel, réponse rapide à chaque sollicitation.',
    icon: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
  },
  {
    title: 'Excellence',
    desc: 'Normes internationales, processus certifiés, résultats mesurables et documentés.',
    icon: <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7L2 9l7-1 3-6z"/>,
  },
];

const team = [
  { initials: 'ML', name: 'Mélanie L.', role: 'Directrice générale', bio: "15 ans d'expérience dans la gestion de marchés industriels en Afrique centrale." },
  { initials: 'DP', name: 'D. Pierre', role: 'Responsable technique', bio: 'Expert en génie civil et hydrocarbures, supervision de chantiers complexes.' },
  { initials: 'AC', name: 'A. Christelle', role: 'Responsable QHSE', bio: 'Certification ISO 9001, pilotage des audits et de la conformité réglementaire.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh' }}>

        <section style={{ background: 'var(--navy)', paddingTop: 120, paddingBottom: 64 }} className="px-5">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Link href="/" className="hover:text-[var(--gold)] transition-colors">Accueil</Link>
              <span className="mx-2">/</span>
              <span style={{ color: 'var(--gold)' }}>À propos</span>
            </div>
            <p className="section-tag mb-3">Notre histoire</p>
            <h1 className="font-serif text-[36px] md:text-[48px] font-medium text-white leading-[1.15] max-w-[600px]">
              À propos de<br />Melanie Services&Prest.
            </h1>
          </div>
        </section>

        <section className="px-5 py-[80px]" style={{ background: 'var(--bg-page)' }}>
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <div className="section-tag mb-3">Notre mission</div>
              <h2 className="font-serif text-[26px] font-medium leading-[1.3] mb-4" style={{ color: 'var(--text-primary)' }}>
                Être le partenaire de confiance de vos projets industriels
              </h2>
              <p className="text-[14px] leading-[1.85]" style={{ color: 'var(--text-secondary)' }}>
                Depuis notre création, Melanie Services&Prest. s'engage à offrir des services techniques de haut niveau, avec une rigueur documentaire et une transparence totale dans le suivi d'exécution de chaque marché.
              </p>
            </div>
            <div>
              <div className="section-tag mb-3">Notre vision</div>
              <h2 className="font-serif text-[26px] font-medium leading-[1.3] mb-4" style={{ color: 'var(--text-primary)' }}>
                Un suivi d'excellence, à chaque étape de vos marchés
              </h2>
              <p className="text-[14px] leading-[1.85]" style={{ color: 'var(--text-secondary)' }}>
                Nous croyons qu'une exécution réussie repose sur la communication en temps réel, la traçabilité des documents et la confiance mutuelle entre toutes les parties prenantes d'un marché.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-[80px]" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="section-tag mb-3">Ce qui nous guide</p>
              <h2 className="font-serif text-[30px] font-medium" style={{ color: 'var(--text-primary)' }}>Nos valeurs fondamentales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px]" style={{ background: 'var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {values.map((v, i) => (
                <div key={i} className="p-8" style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-surface)' }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4" style={{ background: 'var(--navy)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {v.icon}
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                  <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-[80px]" style={{ background: 'var(--bg-page)' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="section-tag mb-3">Les personnes</p>
              <h2 className="font-serif text-[30px] font-medium" style={{ color: 'var(--text-primary)' }}>Notre équipe</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {team.map((m, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-[18px] font-medium mx-auto" style={{ background: 'var(--navy)', color: 'var(--gold)' }}>
                    {m.initials}
                  </div>
                  <div className="text-[15px] font-medium mt-4" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                  <div className="text-[12px] mt-1" style={{ color: 'var(--gold)' }}>{m.role}</div>
                  <div className="w-6 h-px mx-auto my-3" style={{ background: 'var(--border)' }} />
                  <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-[64px] text-center" style={{ background: 'var(--navy)' }}>
          <p className="section-tag mb-3">Melanie Services&Prest.</p>
          <h2 className="font-serif text-[26px] font-medium text-white mb-3">Votre partenaire idéal !</h2>
          <p className="text-[14px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>Basée en Afrique centrale, présente là où vos projets se réalisent.</p>
          <Link href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-[8px] text-[14px] font-medium transition-colors"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
            Nous contacter
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}