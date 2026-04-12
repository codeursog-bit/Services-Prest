'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { verifyPin } from '@/lib/actions/auth-actions';

export default function LockPage() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = async (index: number, value: string) => {
    // N'accepter que les chiffres
    if (value && !/^[0-9]+$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus suivant
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit si 4 chiffres
    if (newPin.every((digit) => digit !== '')) {
      setIsPending(true);
      const result = await verifyPin(newPin.join(''));
      if (result.success) {
        // Validation simulée, retrait du cookie d'inactivité
        document.cookie = "lastActivity=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/dashboard');
      } else {
        setError(true);
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
        setIsPending(false);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      {/* COLONNE GAUCHE (Branding — Desktop uniquement) */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[#1A3A5C] h-screen sticky top-0 px-8 text-center">
        <span className="text-[22px] font-medium text-[#FFFFFF]">Melanie Services&Prest.</span>
        <span className="text-[13px] text-[#FFFFFF] opacity-60 mt-[6px]">Votre partenaire idéal !</span>
        
        <div className="h-[1px] bg-[#FFFFFF] opacity-15 w-[40px] my-[28px]"></div>
        
        <p className="text-[13px] text-[#FFFFFF] opacity-50 leading-[1.8] max-w-[240px]">
          Accès sécurisé à votre espace de gestion des partenaires et du suivi de marchés.
        </p>
      </div>

      {/* COLONNE DROITE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[24px] lg:px-[10%] h-screen overflow-y-auto">
        <div className="w-full max-w-[320px] flex flex-col items-center text-center">
          
          <svg className="mb-[20px]" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 018 0v4"/>
            <circle cx="12" cy="16" r="1" fill="#1A3A5C"/>
          </svg>

          <h1 className="text-[22px] font-medium text-[#1A1A19]">Session verrouillée</h1>
          <p className="text-[14px] text-[#6B6A67] mt-[8px] leading-[1.6]">
            Votre session a été verrouillée après 1 minute d'inactivité. 
            Entrez votre code PIN pour reprendre.
          </p>

          {error && (
            <div className="mt-[20px] w-full bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-left">
              <span className="text-[13px] text-[#9B2335]">Code incorrect. Réessayez. (Essayez 1234)</span>
            </div>
          )}

          <div className="flex gap-[10px] mt-[32px] mb-[28px]">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isPending}
                className="w-[52px] h-[52px] text-center text-[22px] font-medium text-[#1A1A19] bg-[#FFFFFF] border border-[#E8E7E4] rounded-[6px] focus:outline-none focus:border-[#1A3A5C] focus:ring-[3px] focus:ring-[rgba(26,58,92,0.08)] transition-all"
              />
            ))}
          </div>

          <button 
            disabled={isPending || pin.some(d => d === '')}
            className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[12px] rounded-[6px] text-[14px] font-medium transition-colors duration-200 
              ${isPending || pin.some(d => d === '') ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#142d4a]'}`}
          >
            {isPending ? 'Déverrouillage...' : 'Déverrouiller'}
          </button>

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[12px] text-[#6B6A67] mt-[20px] hover:text-[#1A1A19] transition-colors"
          >
            Ce n'est pas vous ? Se déconnecter
          </button>

        </div>
      </div>
    </div>
  );
}