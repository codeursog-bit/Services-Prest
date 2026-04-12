'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : true;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/about', label: 'À propos' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--navy)] border-b border-[var(--gold-border)]">
      <div className="max-w-[1200px] mx-auto px-5 h-[64px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-[14px] font-medium text-white">Melanie Services&Prest.</span>
          <span className="text-[10px] text-[var(--gold)] mt-[2px]">Votre partenaire idéal !</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-[13px] transition-colors ${pathname === l.href ? 'text-[var(--gold)]' : 'text-[rgba(255,255,255,0.6)] hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-3">
          {/* Toggle dark/light */}
          <button onClick={toggleDark} aria-label="Changer le thème"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--gold-border)] text-[var(--gold)] hover:bg-[var(--gold-light)] transition-colors">
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          {/* CTA desktop */}
          <Link href="/login"
            className="hidden md:inline-flex items-center bg-[var(--gold)] text-[var(--navy)] px-5 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[var(--gold-dark)] transition-colors">
            Espace partenaire →
          </Link>

          {/* Hamburger mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="md:hidden text-white p-1">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--navy-dark)] border-t border-[var(--gold-border)] px-5 py-4 animate-fade-in">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`block py-3 text-[14px] border-b border-[rgba(255,255,255,0.06)] last:border-0 transition-colors ${pathname === l.href ? 'text-[var(--gold)]' : 'text-[rgba(255,255,255,0.65)] hover:text-[var(--gold)]'}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}
            className="block mt-4 bg-[var(--gold)] text-[var(--navy)] px-5 py-3 rounded-[6px] text-[13px] font-medium text-center">
            Espace partenaire →
          </Link>
        </div>
      )}
    </header>
  );
}