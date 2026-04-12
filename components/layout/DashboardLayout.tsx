'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface Props {
  children: React.ReactNode;
  userInitials: string;
  pageTitle: string;
}

const navSections = [
  {
    label: 'Partenaires',
    items: [
      { href: '/dashboard/partners', label: 'Mes partenaires', icon: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></> },
      { href: '/dashboard/messages', label: 'Infos à transmettre', icon: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></> },
    ],
  },
  {
    label: 'Documents',
    items: [
      { href: '/dashboard/documents', label: 'Docs entreprise', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></> },
      { href: '/dashboard/marche', label: 'Suivi marché', icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
      { href: '/dashboard/contrat', label: 'Notre contrat', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 18l2-2 2 2 4-4"/></> },
    ],
  },
  {
    label: 'Finances',
    items: [
      { href: '/dashboard/banques', label: 'Banques & Créances', icon: <><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 9l9-6 9 6"/><line x1="7" y1="9" x2="7" y2="21"/><line x1="12" y1="9" x2="12" y2="21"/><line x1="17" y1="9" x2="17" y2="21"/></> },
    ],
  },
];

function NavIcon({ d }: { d: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      {d}
    </svg>
  );
}

export default function DashboardLayout({ children, userInitials, pageTitle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(60);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(true);

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

  const resetTimer = useCallback(() => setTimeLeft(60), []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { router.push('/lock'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [resetTimer, router]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Melanie Services&Prest.</div>
        <div className="text-[10px] mt-[2px]" style={{ color: 'var(--gold)' }}>Votre partenaire idéal !</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 hide-scrollbar">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
              {section.label}
            </div>
            {section.items.map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 mx-2 px-3 py-2 rounded-[6px] text-[13px] transition-colors"
                  style={{
                    background: active ? 'var(--sidebar-active)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--sidebar-text)',
                    fontWeight: active ? 500 : 400,
                    borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                  }}>
                  <NavIcon d={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <Link href="/dashboard/settings"
          className="flex items-center gap-2 mx-2 px-3 py-2 rounded-[6px] text-[13px] transition-colors"
          style={{ color: 'var(--sidebar-text)' }}>
          <NavIcon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>} />
          Paramètres
        </Link>
        <button onClick={() => router.push('/lock')}
          className="w-full flex items-center gap-2 mx-2 px-3 py-2 rounded-[6px] text-[13px] transition-colors"
          style={{ color: 'var(--sidebar-text)' }}>
          <NavIcon d={<><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>} />
          Verrouiller
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-dash)' }}>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col" style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {sidebarOpen && (
        <aside className="fixed top-0 left-0 bottom-0 z-50 w-[280px] flex flex-col shadow-2xl md:hidden animate-fade-in"
          style={{ background: 'var(--sidebar-bg)' }}>
          <div className="flex justify-end p-4">
            <button onClick={() => setSidebarOpen(false)} className="text-[var(--text-muted)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <SidebarContent />
        </aside>
      )}

      {/* Zone principale */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[52px] flex-shrink-0 flex items-center justify-between px-4 md:px-6"
          style={{ background: 'var(--topbar-bg)', borderBottom: '1px solid var(--topbar-border)' }}>

          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden" style={{ color: 'var(--text-secondary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] border transition-colors ${timeLeft < 10 ? 'animate-pulse' : ''}`}
              style={{
                background: timeLeft < 10 ? 'var(--red-bg)' : 'var(--bg-surface)',
                borderColor: timeLeft < 10 ? 'var(--red)' : 'var(--border)',
                color: timeLeft < 10 ? 'var(--red)' : 'var(--text-muted)',
              }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
              </svg>
              <span className="hidden sm:inline">{timeLeft}s</span>
            </div>

            {/* Dark mode toggle */}
            <button onClick={toggleDark}
              className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            {/* Nouveau partenaire */}
            <Link href="/dashboard/partners/new"
              className="hidden sm:inline-flex items-center gap-1 border px-3 py-1.5 rounded-[6px] text-[12px] transition-colors"
              style={{ borderColor: 'var(--gold-border)', color: 'var(--gold)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Partenaire
            </Link>

            {/* Avatar */}
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium text-white"
                style={{ background: 'var(--navy)' }}>
                {userInitials}
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[150px] rounded-[8px] border shadow-lg z-50 py-1 animate-fade-in"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[13px] transition-colors hover:bg-[var(--bg-surface)]"
                      style={{ color: 'var(--text-primary)' }}>
                      Mon profil
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-[13px] transition-colors hover:bg-[var(--bg-surface)]"
                      style={{ color: 'var(--red)' }}>
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: 'var(--bg-dash)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}