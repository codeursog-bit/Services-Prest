'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

// Props du composant
interface DashboardLayoutProps {
  children: React.ReactNode;
  userInitials: string;
  pageTitle: string;
}

export default function DashboardLayout({ children, userInitials, pageTitle }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Timer d'inactivité
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const resetTimer = useCallback(() => {
    setTimeLeft(60);
    // Optionnel : mettre à jour le cookie "lastActivity" ici si besoin
  }, []);

  useEffect(() => {
    // Événements pour reset le timer
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetTimer));

    // Décrémentation du timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          router.push('/lock');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [resetTimer, router]);

  // Fonction pour vérifier si un lien est actif
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // Classes communes pour les liens de navigation
  const getNavClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-[8px] p-[7px_10px] rounded-[6px] m-[1px_6px] text-[13px] transition-colors duration-150 ${
      active 
        ? 'bg-[#FFFFFF] text-[#1A1A19] font-medium border-l-[2px] border-[#1A3A5C] pl-[8px]' 
        : 'text-[#6B6A67] hover:bg-[#FFFFFF] hover:text-[#1A1A19]'
    }`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F6]">
      
      {/* SIDEBAR (Fixe, 220px) */}
      <aside className="w-[220px] flex-shrink-0 bg-[#F7F7F6] border-r border-[#E8E7E4] flex flex-col overflow-y-auto">
        
        {/* LOGO */}
        <div className="p-[20px_16px] border-b border-[#E8E7E4]">
          <span className="block text-[13px] font-medium text-[#1A1A19]">Melanie Services&Prest.</span>
          <span className="block text-[10px] text-[#6B6A67] mt-[2px]">Votre partenaire idéal !</span>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto py-[12px]">
          
          {/* Section Partenaires */}
          <div className="px-[16px] pt-[14px] pb-[4px]">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6A67]">Partenaires</span>
          </div>
          <Link href="/dashboard/partners" className={getNavClass('/dashboard/partners')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="3"/>
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
              <path d="M21 21v-2a4 4 0 00-3-3.85"/>
            </svg>
            Mes partenaires
          </Link>
          <Link href="/dashboard/messages" className={getNavClass('/dashboard/messages')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Infos à transmettre
          </Link>

          {/* Section Documents */}
          <div className="px-[16px] pt-[20px] pb-[4px]">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6A67]">Documents</span>
          </div>
          <Link href="/dashboard/documents" className={getNavClass('/dashboard/documents')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
            Documents entreprise
          </Link>
          <Link href="/dashboard/marche" className={getNavClass('/dashboard/marche')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Suivi marché
          </Link>
          <Link href="/dashboard/contrat" className={getNavClass('/dashboard/contrat')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M9 18l2-2 2 2 4-4"/>
            </svg>
            Notre contrat
          </Link>

          {/* Section Finances */}
          <div className="px-[16px] pt-[20px] pb-[4px]">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6A67]">Finances</span>
          </div>
          <Link href="/dashboard/banques" className={getNavClass('/dashboard/banques')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="9" width="18" height="12" rx="1"/>
              <path d="M3 9l9-6 9 6"/>
              <line x1="7" y1="9" x2="7" y2="21"/>
              <line x1="12" y1="9" x2="12" y2="21"/>
              <line x1="17" y1="9" x2="17" y2="21"/>
            </svg>
            Banques & Créances
          </Link>
        </div>

        {/* BOTTOM SIDEBAR */}
        <div className="p-[12px_8px] border-t border-[#E8E7E4] mt-auto">
          <Link href="/dashboard/settings" className={getNavClass('/dashboard/settings')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            Paramètres
          </Link>
          <button 
            onClick={() => router.push('/lock')}
            className="w-full flex items-center gap-[8px] p-[7px_10px] rounded-[6px] m-[1px_6px] text-[13px] text-[#6B6A67] hover:bg-[#FFFFFF] hover:text-[#1A1A19] transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 018 0v4"/>
            </svg>
            Verrouiller
          </button>
        </div>

      </aside>

      {/* ZONE PRINCIPALE (TopBar + Contenu) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-[52px] flex-shrink-0 bg-[#FFFFFF] border-b border-[#E8E7E4] px-[24px] flex items-center justify-between">
          <h1 className="text-[15px] font-medium text-[#1A1A19]">{pageTitle}</h1>

          <div className="flex items-center gap-[16px]">
            {/* Timer Inactivité */}
            <div className={`flex items-center gap-[6px] bg-[#F7F7F6] border border-[#E8E7E4] rounded-[6px] p-[4px_10px] text-[12px] transition-colors duration-300 ${timeLeft < 10 ? 'text-[#9B2335] animate-pulse border-[#9B2335]' : 'text-[#6B6A67]'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 018 0v4"/>
              </svg>
              Session · {timeLeft}s
            </div>

            {/* Bouton Action Rapide */}
            <Link 
              href="/dashboard/partners/new"
              className="hidden sm:block border border-[#1A3A5C] text-[#1A3A5C] bg-transparent py-[6px] px-[14px] rounded-[6px] text-[12px] hover:bg-[#1A3A5C] hover:text-[#FFFFFF] transition-colors duration-150"
            >
              Nouveau partenaire +
            </Link>

            {/* Avatar & Menu Déroulant */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-[28px] h-[28px] rounded-full bg-[#E8E7E4] flex items-center justify-center text-[12px] font-medium text-[#1A1A19] focus:outline-none focus:ring-[2px] focus:ring-[#1A3A5C] focus:ring-offset-2"
              >
                {userInitials}
              </button>
              
              {isDropdownOpen && (
                <>
                  {/* Invisible overlay to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-[8px] w-[160px] bg-[#FFFFFF] border border-[#E8E7E4] rounded-[6px] shadow-sm z-50 py-[4px]">
                    <Link href="/dashboard/settings" className="block px-[12px] py-[8px] text-[13px] text-[#1A1A19] hover:bg-[#F7F7F6]" onClick={() => setIsDropdownOpen(false)}>
                      Mon profil
                    </Link>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-[12px] py-[8px] text-[13px] text-[#9B2335] hover:bg-[#F7F7F6]"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <div className="flex-1 overflow-y-auto bg-[#F7F7F6] p-[28px]">
          {children}
        </div>
        
      </main>
    </div>
  );
}