'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('site-theme');
    const isDark = saved ? saved === 'dark' : false;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('site-theme', next ? 'dark' : 'light');
  };

  const links = [
    { href: '/',        label: 'Accueil'   },
    { href: '/about',   label: 'À propos'  },
    { href: '/services',label: 'Services'  },
    { href: '/contact', label: 'Contact'   },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(15,39,68,0.97)' : '#0F2744',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.25)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid rgba(200,169,110,0.15)',
      }}>
      <div className="max-w-[1200px] mx-auto px-5 h-[66px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-[10px] group">
          <div className="w-9 h-9 rounded-[8px] overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center transition-all group-hover:bg-white/15">
            <Image
              src="/logo.png"
              alt="MSP"
              width={36}
              height={36}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="leading-none">
            <span className="block text-[13px] font-semibold text-white">Melanie Services&Prest.</span>
            <span className="block text-[10px] mt-[2px]" style={{ color: 'rgba(200,169,110,0.75)' }}>
              Votre partenaire idéal !
            </span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-[4px]">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}
                className={`px-[14px] py-[7px] rounded-[8px] text-[13px] transition-all ${
                  active
                    ? 'font-medium'
                    : 'hover:bg-white/8'
                }`}
                style={{ color: active ? '#C8A96E' : 'rgba(255,255,255,0.65)' }}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-[8px]">
          <button onClick={toggleDark}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] transition-all"
            style={{ border: '1px solid rgba(200,169,110,0.3)', color: 'rgba(200,169,110,0.8)' }}
            onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(200,169,110,0.12)'); (e.currentTarget.style.color = '#C8A96E'); }}
            onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = 'rgba(200,169,110,0.8)'); }}
            aria-label="Changer le thème">
            {dark
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            }
          </button>

          <Link href="/login"
            className="hidden md:inline-flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium transition-all"
            style={{ background: '#C8A96E', color: '#0F2744' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#b8995e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#C8A96E')}>
            Espace partenaire
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-[8px] transition-colors"
            style={{ color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Menu">
            {menuOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 animate-fade-in"
          style={{ background: '#0a1e35', borderTop: '1px solid rgba(200,169,110,0.12)' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="flex items-center py-[12px] text-[14px] transition-colors"
              style={{
                color: pathname === l.href ? '#C8A96E' : 'rgba(255,255,255,0.65)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
              {l.label}
              {pathname === l.href && (
                <span className="ml-auto w-[5px] h-[5px] rounded-full" style={{ background: '#C8A96E' }} />
              )}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center mt-[14px] py-[12px] rounded-[8px] text-[14px] font-medium"
            style={{ background: '#C8A96E', color: '#0F2744' }}>
            Espace partenaire →
          </Link>
        </div>
      )}
    </header>
  );
}
