'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils';

const INACTIVITY_TIMEOUT = 5 * 60; // 5 min en secondes

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Tableau de bord', href: '/dashboard', exact: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'partners', label: 'Partenaires', href: '/dashboard/partners',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></svg>,
  },
  {
    id: 'documents', label: 'Documents', href: '/dashboard/documents',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>,
  },
  {
    id: 'marche', label: 'Suivi marchés', href: '/dashboard/marche',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
  {
    id: 'messages', label: 'Messages', href: '/dashboard/messages', badge: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    id: 'banques', label: 'Banques & Créances', href: '/dashboard/banques',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  },
  {
    id: 'dettes', label: 'Dettes internes', href: '/dashboard/dettes',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    id: 'contrat', label: 'Contrat', href: '/dashboard/contrat',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  },
  {
    id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', badge: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  },
  {
    id: 'settings', label: 'Paramètres', href: '/dashboard/settings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  },
];

export default function DashboardLayout({
  children,
  pageTitle,
}: {
  children:  React.ReactNode;
  pageTitle: string;
}) {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [unreadMsgs, setUnreadMsgs]     = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dark, setDark]                 = useState(false);
  const [secondsLeft, setSecondsLeft]   = useState(INACTIVITY_TIMEOUT);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval>>();
  const timerRef    = useRef<ReturnType<typeof setInterval>>();
  const lastActivityRef = useRef(Date.now());

  // ── Dark mode init ──
  useEffect(() => {
    const saved = localStorage.getItem('dash-theme');
    const isDark = saved ? saved === 'dark' : false;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('dash-theme', next ? 'dark' : 'light');
  };

  // ── Inactivity timer ──
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsLeft(INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        window.location.href = '/lock';
      }
    }, 1000);

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  // ── Polling badges ──
  useEffect(() => {
    const poll = async () => {
      try {
        const [msgsRes, notifsRes] = await Promise.all([
          fetch('/api/messages?direction=PARTNER_TO_MSP&unread=true'),
          fetch('/api/notifications?limit=1'),
        ]);
        const [msgsData, notifsData] = await Promise.all([msgsRes.json(), notifsRes.json()]);
        if (msgsData.success)   setUnreadMsgs(msgsData.unreadCount || 0);
        if (notifsData.success) setUnreadNotifs(notifsData.unreadCount || 0);
      } catch { /* silencieux */ }
    };
    poll();
    pollRef.current = setInterval(poll, 10000);
    return () => clearInterval(pollRef.current);
  }, []);

  // ── Close menu on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const timerPct    = (secondsLeft / INACTIVITY_TIMEOUT) * 100;
  const timerWarn   = secondsLeft <= 60;
  const timerMinSec = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const userInitials = session?.user?.name ? getInitials(session.user.name) : '?';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-root)' }}>

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[230px] flex flex-col
        transition-transform duration-200
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>

        {/* Barre décorative top */}
        <div className="sidebar-top-bar" />

        {/* Logo */}
        <div className="p-[18px_16px] pt-[20px]" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] overflow-hidden flex-shrink-0 bg-[var(--msp-blue)] flex items-center justify-center">
              <Image src="/logo.png" alt="MSP" width={32} height={32} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <div>
              <span className="block text-[13px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                Melanie S&P
              </span>
              <span className="block text-[10px] mt-[3px]" style={{ color: 'var(--text-muted)' }}>
                Espace de gestion
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-[10px] overflow-y-auto px-[8px]">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const badge  = item.id === 'messages' ? unreadMsgs
              : item.id === 'notifications' ? unreadNotifs : 0;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-[10px] px-[10px] py-[8px] rounded-[8px] text-[12.5px] mb-[1px] transition-all ${
                  active ? 'font-medium' : ''
                }`}
                style={{
                  background:  active ? 'var(--sidebar-active-bg)' : 'transparent',
                  color:       active ? 'var(--sidebar-active-fg)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; } }}
              >
                <span style={{ color: active ? 'var(--sidebar-icon-active)' : 'currentColor', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {badge > 0 && (
                  <span className="text-[10px] px-[5px] py-[1px] rounded-full min-w-[18px] text-center font-medium text-white"
                    style={{ background: item.id === 'notifications' ? 'var(--msp-red)' : 'var(--msp-blue)' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Timer inactivité */}
        <div className="px-[12px] pb-[8px]">
          <div className="rounded-[8px] px-[10px] py-[8px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Session active</span>
              <span
                className={`text-[11px] font-mono font-medium ${timerWarn ? 'animate-timer-pulse' : ''}`}
                style={{ color: timerWarn ? 'var(--msp-red)' : 'var(--text-secondary)' }}
              >
                {timerMinSec}
              </span>
            </div>
            <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${timerPct}%`,
                  background: timerWarn
                    ? 'linear-gradient(90deg, var(--msp-red), #ff8888)'
                    : 'linear-gradient(90deg, var(--msp-orange), var(--msp-blue))',
                }}
              />
            </div>
          </div>
        </div>

        {/* User section */}
        <div className="px-[8px] pb-[12px]" style={{ borderTop: '1px solid var(--border)' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-[10px] rounded-[8px] p-[8px] mt-[8px] transition-all"
            style={{ background: showUserMenu ? 'var(--sidebar-hover-bg)' : 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover-bg)')}
            onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--msp-blue), var(--msp-orange))' }}>
              {userInitials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {session?.user?.name || 'Administrateur'}
              </div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {session?.user?.email || ''}
              </div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="rounded-[10px] mt-[4px] overflow-hidden animate-fade-in"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <Link href="/dashboard/settings"
                onClick={() => { setShowUserMenu(false); setSidebarOpen(false); }}
                className="flex items-center gap-[8px] px-[12px] py-[9px] text-[12px] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Paramètres
              </Link>
              {/* Dark toggle */}
              <button onClick={toggleDark}
                className="w-full flex items-center gap-[8px] px-[12px] py-[9px] text-[12px] transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {dark
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                }
                {dark ? 'Mode clair' : 'Mode sombre'}
              </button>
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-[8px] px-[12px] py-[9px] text-[12px] transition-colors"
                style={{ color: 'var(--msp-red)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--msp-red-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-[20px] py-[13px] flex-shrink-0"
          style={{ background: 'var(--bg-topbar)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          <div className="flex items-center gap-[12px]">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-[6px] rounded-[8px] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-[6px]">
            {/* Timer compact topbar (visible lg+) */}
            <div className="hidden lg:flex items-center gap-[6px] px-[10px] py-[5px] rounded-[8px]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-[5px] h-[5px] rounded-full animate-pulse-dot" style={{ background: timerWarn ? 'var(--msp-red)' : 'var(--msp-green)' }} />
              <span className={`text-[11px] font-mono ${timerWarn ? 'animate-timer-pulse' : ''}`}
                style={{ color: timerWarn ? 'var(--msp-red)' : 'var(--text-muted)' }}>
                {timerMinSec}
              </span>
            </div>

            {/* Dark mode toggle topbar */}
            <button onClick={toggleDark}
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center transition-all"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget.style.background = 'var(--bg-surface)'); (e.currentTarget.style.color = 'var(--accent-orange)'); }}
              onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = 'var(--text-secondary)'); }}
              title={dark ? 'Mode clair' : 'Mode sombre'}>
              {dark
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </button>

            {/* Notifications */}
            <Link href="/dashboard/notifications"
              className="relative w-[34px] h-[34px] rounded-[8px] flex items-center justify-center transition-all"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unreadNotifs > 0 && (
                <span className="absolute -top-[3px] -right-[3px] w-[15px] h-[15px] text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                  style={{ background: 'var(--msp-red)' }}>
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-[20px] lg:p-[24px]">
          {children}
        </main>
      </div>
    </div>
  );
}
