import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A1E35]">
      {/* Corps */}
      <div className="max-w-[1200px] mx-auto px-6 py-[52px] grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Col 1 — Identité */}
        <div>
          <div className="text-[15px] font-medium text-white">Melanie Services&Prest.</div>
          <div className="text-[11px] text-[#C8A96E] mt-1 mb-4">Votre partenaire idéal !</div>
          <p className="text-[12px] text-[rgba(255,255,255,0.4)] leading-[1.8]">
            Spécialiste en génie civil, hydrocarbures, QHSE et approvisionnement en matériel industriel en Afrique centrale.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <div className="w-[5px] h-[5px] rounded-full bg-[#C8A96E]" />
            <span className="text-[11px] text-[rgba(255,255,255,0.35)]">Pointe-Noire, République du Congo</span>
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <div className="text-[10px] text-[rgba(255,255,255,0.35)] uppercase tracking-[0.1em] mb-4">Navigation</div>
          <div className="flex flex-col gap-3">
            {[
              { href: '/', label: 'Accueil' },
              { href: '/about', label: 'À propos' },
              { href: '/services', label: 'Nos services' },
              { href: '/contact', label: 'Contact' },
              { href: '/login', label: 'Espace partenaire' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-[rgba(255,255,255,0.45)] hover:text-[#C8A96E] transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3 — Contact */}
        <div>
          <div className="text-[10px] text-[rgba(255,255,255,0.35)] uppercase tracking-[0.1em] mb-4">Contact</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-[2px] flex-shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <span className="text-[12px] text-[rgba(255,255,255,0.45)] leading-[1.6]">
                Avenue Principale,<br/>Pointe-Noire, République du Congo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92"/>
              </svg>
              <span className="text-[12px] text-[rgba(255,255,255,0.45)]">+242 06 XXX XX XX</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span className="text-[12px] text-[rgba(255,255,255,0.45)]">contact@melanieservices.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre copyright */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-[11px] text-[rgba(255,255,255,0.25)]">
          © 2026 Melanie Services&Prest. — Tous droits réservés
        </span>
        <span className="text-[11px] text-[rgba(200,169,110,0.4)]">
          Votre partenaire idéal !
        </span>
      </div>
    </footer>
  );
}