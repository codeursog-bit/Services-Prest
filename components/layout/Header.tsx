'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/about', label: 'À propos' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F2744] border-b border-[rgba(200,169,110,0.15)]">
      <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex flex-col">
          <span className="text-[14px] font-medium text-white leading-tight">
            Melanie Services&Prest.
          </span>
          <span className="text-[10px] text-[#C8A96E] font-normal tracking-[0.04em]">
            Votre partenaire idéal !
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] transition-colors ${
                pathname === link.href
                  ? 'text-[#C8A96E]'
                  : 'text-[rgba(255,255,255,0.6)] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="bg-[#C8A96E] text-[#0F2744] px-5 py-[8px] rounded-[6px] text-[13px] font-medium hover:bg-[#B8995E] transition-colors"
          >
            Espace partenaire →
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
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

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a1e35] border-t border-[rgba(200,169,110,0.15)] px-6 py-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-[14px] text-[rgba(255,255,255,0.7)] border-b border-[rgba(255,255,255,0.06)] last:border-b-0 hover:text-[#C8A96E] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block mt-4 bg-[#C8A96E] text-[#0F2744] px-5 py-3 rounded-[6px] text-[13px] font-medium text-center"
          >
            Espace partenaire →
          </Link>
        </div>
      )}
    </header>
  );
}