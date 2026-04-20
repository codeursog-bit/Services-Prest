'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-[24px]">

      {/* Logo */}
      <div className="mb-[32px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MSP Logo" width="80" height="80" className="mx-auto" />
      </div>

      {/* Icône offline */}
      <div className="w-[64px] h-[64px] rounded-full bg-[#FEF3E2] flex items-center justify-center mb-[24px]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0122.56 9"/>
          <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 016.95 0"/>
          <circle cx="12" cy="20" r="1" fill="#8B4513"/>
        </svg>
      </div>

      <h2 className="text-[20px] font-medium text-[#1A1A19] mb-[8px] text-center">
        Vous êtes hors ligne
      </h2>
      <p className="text-[14px] text-[#6B6A67] text-center leading-[1.7] max-w-[320px] mb-[32px]">
        Vérifiez votre connexion internet. Les pages déjà consultées restent disponibles.
      </p>

      {/* Pages disponibles hors ligne */}
      <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[10px] p-[20px] w-full max-w-[360px] mb-[24px]">
        <p className="text-[12px] font-medium text-[#1A1A19] mb-[12px]">Pages disponibles hors ligne :</p>
        <div className="flex flex-col gap-[8px]">
          {[
            { href: '/dashboard',           label: 'Tableau de bord' },
            { href: '/dashboard/partners',  label: 'Partenaires' },
            { href: '/dashboard/marche',    label: 'Suivi marchés' },
            { href: '/dashboard/messages',  label: 'Messages' },
            { href: '/dashboard/documents', label: 'Documents' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-[8px] text-[13px] text-[#1A3A5C] hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="bg-[#3D3B8E] text-[#FFFFFF] py-[10px] px-[24px] rounded-[6px] text-[13px] font-medium hover:bg-[#2e2c72] transition-colors"
      >
        Réessayer
      </button>

      <p className="text-[11px] text-[#6B6A67] mt-[24px]">
        Melanie Services&amp;Prest. · MSP App
      </p>
    </div>
  );
}