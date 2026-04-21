import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#091e35' }}>
      {/* Ligne déco top */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #C8A96E, transparent 60%)' }} />

      <div className="max-w-[1200px] mx-auto px-5 py-[52px] grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Identité */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[8px] bg-white/8 flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="MSP" width={36} height={36} className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Melanie Services&Prest.</div>
              <div className="text-[10px] mt-[1px]" style={{ color: '#C8A96E' }}>Votre partenaire idéal !</div>
            </div>
          </div>
          <p className="text-[12px] leading-[1.85]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Spécialiste en génie civil, hydrocarbures, QHSE et approvisionnement industriel en Afrique centrale.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#C8A96E' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Pointe-Noire, République du Congo</span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] mb-5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Navigation</div>
          <div className="flex flex-col gap-[10px]">
            {[['/', 'Accueil'], ['/about', 'À propos'], ['/services', 'Nos services'], ['/contact', 'Contact'], ['/login', 'Espace partenaire']].map(([href, label]) => (
              <Link key={href} href={href}
                className="text-[13px] w-fit transition-colors hover:text-[#C8A96E]"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] mb-5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Contact</div>
          <div className="flex flex-col gap-[14px]">
            {[
              { icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>, text: 'Avenue Principale, Pointe-Noire' },
              { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92"/>, text: '+242 06 XXX XX XX' },
              { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, text: 'contact@melanieservices.com' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-[2px] flex-shrink-0">
                  {item.icon}
                </svg>
                <span className="text-[12px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          © 2026 Melanie Services&Prest. — Tous droits réservés
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(200,169,110,0.35)' }}>Votre partenaire idéal !</span>
      </div>
    </footer>
  );
}
