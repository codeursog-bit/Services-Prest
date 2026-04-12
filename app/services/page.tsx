import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const mainServices = [
  {
    title: 'Génie civil',
    desc: 'Construction et réhabilitation d\'ouvrages, supervision de chantiers, gestion de projets d\'infrastructure.',
    items: ['Maçonnerie et gros œuvre', 'Voirie et réseaux divers', 'Supervision et contrôle qualité', 'Études et métrés'],
    icon: <><path d="M2 20h20"/><path d="M12 4C8 4 5 7 5 11v1h14v-1c0-4-3-7-7-7z"/><path d="M5 12H2v2a1 1 0 001 1h2"/><path d="M19 12h3v2a1 1 0 01-1 1h-2"/></>,
  },
  {
    title: 'Hydrocarbures & gaz',
    desc: 'Interventions techniques sur sites pétroliers et gaziers, maintenance industrielle, montage et soudure.',
    items: ['Maintenance des équipements de production', 'Contrôle et inspection technique', 'Soudure et tuyauterie industrielle', 'Assistance technique sur site'],
    icon: <><rect x="6" y="3" width="12" height="16" rx="2"/><path d="M9 19v2M15 19v2"/><path d="M6 8h12"/><path d="M10 3V1M14 3V1"/></>,
  },
  {
    title: 'QHSE',
    desc: 'Mise en place et pilotage des systèmes qualité, hygiène, sécurité et protection de l\'environnement.',
    items: ['Audits internes et externes', 'Rédaction de plans QHSE', 'Formations sécurité sur site', 'Gestion des incidents et non-conformités'],
    icon: <><path d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6L12 2z"/><path d="M9 12l2 2 4-4"/></>,
  },
  {
    title: 'Matériel industriel',
    desc: 'Sourcing, approvisionnement et livraison de matériel technique et industriel sur vos sites.',
    items: ['Identification et sourcing fournisseurs', 'Contrôle qualité à la réception', 'Logistique et transport sur site', 'Gestion des stocks et inventaires'],
    icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9"/></>,
  },
];

const secondary = [
  { title: 'Ressources humaines', desc: 'Mise à disposition de techniciens, ingénieurs et ouvriers qualifiés pour vos chantiers.', icon: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></> },
  { title: 'Hébergement & logement', desc: 'Solutions d\'hébergement pour vos équipes en déplacement, adaptées aux environnements isolés.', icon: <><path d="M3 12L12 3l9 9"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/></> },
  { title: 'Transport du personnel', desc: 'Organisation et gestion du transport de vos équipes entre base de vie, aéroports et sites.', icon: <><rect x="1" y="3" width="15" height="12" rx="1"/><path d="M16 8h4l3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
];

const steps = [
  { n: '01', title: 'Premier contact', desc: 'Échange sur votre projet et vos besoins spécifiques.' },
  { n: '02', title: 'Espace créé', desc: 'Un espace sécurisé est ouvert pour votre marché.' },
  { n: '03', title: 'Suivi en temps réel', desc: 'Documents et rapports partagés instantanément avec notification.' },
  { n: '04', title: 'Clôture & archivage', desc: 'Tous vos livrables archivés et accessibles durablement.' },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh' }}>

        {/* Bannière */}
        <section style={{ background: 'var(--navy)', paddingTop: 120, paddingBottom: 64 }} className="px-5">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Link href="/" className="hover:text-[var(--gold)] transition-colors">Accueil</Link>
              <span className="mx-2">/</span>
              <span style={{ color: 'var(--gold)' }}>Services</span>
            </div>
            <p className="section-tag mb-3">Ce que nous faisons</p>
            <h1 className="font-serif text-[36px] md:text-[48px] font-medium text-white leading-[1.15] max-w-[640px]">
              Des services industriels complets, du génie civil au QHSE
            </h1>
          </div>
        </section>

        {/* 4 services principaux */}
        <section className="px-5 py-[80px]" style={{ background: 'var(--bg-page)' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="section-tag mb-3">Expertise principale</p>
              <h2 className="font-serif text-[30px] font-medium" style={{ color: 'var(--text-primary)' }}>Nos 4 domaines principaux</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {mainServices.map((s, i) => (
                <div key={i} className="rounded-[12px] p-7 transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-5" style={{ background: 'var(--navy)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {s.icon}
                    </svg>
                  </div>
                  <h3 className="text-[16px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-[13px] leading-[1.7] mb-4" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                  <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
                  <ul className="flex flex-col gap-2">
                    {s.items.map(item => (
                      <li key={item} className="text-[12px] flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0 }}>—</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services secondaires */}
        <section className="px-5 py-[72px]" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-10">
              <p className="section-tag mb-3">Complémentaires</p>
              <h2 className="font-serif text-[26px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Également à votre disposition</h2>
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Des services complémentaires pour faciliter la réalisation de vos projets sur le terrain.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px]" style={{ background: 'var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {secondary.map((s, i) => (
                <div key={i} className="p-7" style={{ background: 'var(--bg-surface)' }}>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4" style={{ background: 'var(--navy)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {s.icon}
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="px-5 py-[72px]" style={{ background: 'var(--navy)' }}>
          <div className="max-w-[1200px] mx-auto">
            <p className="section-tag mb-3">Méthode</p>
            <h2 className="font-serif text-[26px] font-medium text-white mb-12">Comment nous travaillons avec vous</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px]" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
              {steps.map(s => (
                <div key={s.n} className="p-6" style={{ background: 'var(--navy)' }}>
                  <div className="text-[11px] mb-3 tracking-[0.1em]" style={{ color: 'var(--gold)' }}>{s.n} —</div>
                  <h4 className="text-[14px] font-medium text-white mb-2">{s.title}</h4>
                  <p className="text-[12px] leading-[1.65]" style={{ color: 'rgba(255,255,255,0.42)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-[72px]" style={{ background: 'var(--gold)' }}>
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-serif text-[28px] font-medium leading-[1.2]" style={{ color: 'var(--navy)' }}>Prêt à démarrer votre prochain marché ?</h2>
              <p className="text-[14px] mt-2" style={{ color: 'rgba(15,39,68,0.65)' }}>Contactez-nous ou créez directement votre espace partenaire.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/contact" className="px-6 py-3 rounded-[8px] text-[14px] font-medium transition-colors" style={{ background: 'var(--navy)', color: '#fff' }}>Nous contacter</Link>
              <Link href="/login" className="px-6 py-3 rounded-[8px] text-[14px] border transition-colors" style={{ borderColor: 'rgba(15,39,68,0.35)', color: 'var(--navy)' }}>Mon espace</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}