'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    href: '/dashboard',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'partners',
    label: 'Partenaires',
    href: '/dashboard/partners',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="9" cy="7" r="3"/>
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
        <path d="M21 21v-2a4 4 0 00-3-3.85"/>
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'Documents',
    href: '/dashboard/documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    id: 'marche',
    label: 'Suivi marchés',
    href: '/dashboard/marche',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/dashboard/messages',
    badge: true, // affiche le badge si messages non lus
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
  {
    id: 'banques',
    label: 'Banques & Créances',
    href: '/dashboard/banques',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    id: 'dettes',
    label: 'Dettes internes',
    href: '/dashboard/dettes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    id: 'contrat',
    label: 'Contrat',
    href: '/dashboard/contrat',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Paramètres',
    href: '/dashboard/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
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
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [unreadMsgs, setUnreadMsgs]       = useState(0);
  const [unreadNotifs, setUnreadNotifs]   = useState(0);
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Initiales depuis la session
  const userInitials = session?.user?.name
    ? getInitials(session.user.name)
    : '?';

  // Polling badges sidebar
  useEffect(() => {
    const poll = async () => {
      try {
        const [msgsRes, notifsRes] = await Promise.all([
          fetch('/api/messages?direction=PARTNER_TO_MSP&unread=true'),
          fetch('/api/notifications?limit=1'),
        ]);
        const [msgsData, notifsData] = await Promise.all([msgsRes.json(), notifsRes.json()]);
        if (msgsData.success)    setUnreadMsgs(msgsData.unreadCount || 0);
        if (notifsData.success)  setUnreadNotifs(notifsData.unreadCount || 0);
      } catch { /* silencieux */ }
    };
    poll();
    pollRef.current = setInterval(poll, 10000); // toutes les 10s pour le layout
    return () => clearInterval(pollRef.current);
  }, []);

  // Fermer le menu user au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="flex h-screen bg-[#F7F7F6] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[220px] bg-[#FFFFFF] border-r border-[#E8E7E4]
        flex flex-col transition-transform duration-200
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-[20px_18px] border-b border-[#E8E7E4]">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <span className="block text-[14px] font-medium text-[#1A1A19]">Melanie Services&amp;Prest.</span>
            <span className="block text-[11px] text-[#6B6A67] mt-[1px]">Espace de gestion</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-[12px] overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const badge  = item.id === 'messages'
              ? unreadMsgs
              : item.id === 'notifications'
              ? unreadNotifs
              : 0;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-[10px] px-[14px] py-[9px] mx-[6px] rounded-[6px] text-[13px] transition-colors mb-[1px] ${
                  active
                    ? 'bg-[#F7F7F6] text-[#1A1A19] font-medium'
                    : 'text-[#6B6A67] hover:bg-[#F7F7F6] hover:text-[#1A1A19]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-[#1A3A5C]' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="bg-[#1A3A5C] text-[#FFFFFF] text-[10px] px-[6px] py-[1px] rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Notifications séparément */}
          <Link href="/dashboard/notifications" onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-[10px] px-[14px] py-[9px] mx-[6px] rounded-[6px] text-[13px] transition-colors mb-[1px] ${
              pathname === '/dashboard/notifications'
                ? 'bg-[#F7F7F6] text-[#1A1A19] font-medium'
                : 'text-[#6B6A67] hover:bg-[#F7F7F6] hover:text-[#1A1A19]'
            }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="flex-1">Notifications</span>
            {unreadNotifs > 0 && (
              <span className="bg-[#9B2335] text-[#FFFFFF] text-[10px] px-[6px] py-[1px] rounded-full min-w-[18px] text-center">
                {unreadNotifs}
              </span>
            )}
          </Link>
        </nav>

        {/* User info bas sidebar */}
        <div className="border-t border-[#E8E7E4] p-[12px_14px]" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-[10px] rounded-[6px] p-[6px_8px] hover:bg-[#F7F7F6] transition-colors"
          >
            <div className="w-[30px] h-[30px] rounded-full bg-[#1A3A5C] flex items-center justify-center text-[11px] font-medium text-[#FFFFFF] flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[12px] font-medium text-[#1A1A19] truncate">
                {session?.user?.name || 'Administrateur'}
              </div>
              <div className="text-[10px] text-[#6B6A67] truncate">
                {session?.user?.email || ''}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.5" strokeLinecap="round"
              className={`flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[8px] mt-[6px] overflow-hidden shadow-sm">
              <Link href="/dashboard/settings" onClick={() => { setShowUserMenu(false); setSidebarOpen(false); }}
                className="flex items-center gap-[8px] px-[12px] py-[8px] text-[12px] text-[#1A1A19] hover:bg-[#F7F7F6] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                Paramètres
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-[8px] px-[12px] py-[8px] text-[12px] text-[#9B2335] hover:bg-[#F7F7F6] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="bg-[#FFFFFF] border-b border-[#E8E7E4] px-[20px] py-[14px] flex items-center justify-between flex-shrink-0">
          {/* Burger mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-[6px] rounded-[6px] hover:bg-[#F7F7F6] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A19" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <h1 className="text-[16px] font-medium text-[#1A1A19]">{pageTitle}</h1>

          {/* Actions topbar */}
          <div className="flex items-center gap-[10px]">
            {/* Cloche notifications */}
            <Link href="/dashboard/notifications"
              className="relative p-[6px] rounded-[6px] hover:bg-[#F7F7F6] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unreadNotifs > 0 && (
                <span className="absolute -top-[2px] -right-[2px] w-[14px] h-[14px] bg-[#9B2335] text-[#FFFFFF] text-[9px] rounded-full flex items-center justify-center">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-[24px]">
          {children}
        </main>
      </div>
    </div>
  );
}
