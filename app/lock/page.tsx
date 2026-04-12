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
    if (value && !/^[0-9]+$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    if (newPin.every(d => d !== '')) {
      setIsPending(true);
      const result = await verifyPin(newPin.join(''));
      if (result.success) {
        document.cookie = 'lastActivity=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
    if (e.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-card)' }}>
      {/* COLONNE GAUCHE branding desktop */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 h-screen sticky top-0 px-8 text-center"
        style={{ background: 'var(--navy)' }}>
        <span className="text-[22px] font-medium text-white">Melanie Services&amp;Prest.</span>
        <span className="text-[13px] mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Votre partenaire idéal !</span>
        <div className="h-px w-10 my-7" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <p className="text-[13px] leading-[1.8] max-w-[240px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Accès sécurisé à votre espace de gestion des partenaires et du suivi de marchés.
        </p>
      </div>

      {/* COLONNE DROITE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:px-[10%] h-screen overflow-y-auto">
        <div className="w-full max-w-[320px] flex flex-col items-center text-center">
          <svg className="mb-5" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--navy-mid)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 018 0v4"/>
            <circle cx="12" cy="16" r="1" fill="var(--navy-mid)"/>
          </svg>

          <h1 className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>Session verrouillée</h1>
          <p className="text-[14px] mt-2 leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
            Votre session a été verrouillée après 1 minute d&apos;inactivité.
            Entrez votre code PIN pour reprendre.
          </p>

          {error && (
            <div className="mt-5 w-full rounded-[6px] p-3 text-left" style={{ background: 'var(--red-bg)', border: '1px solid var(--red)' }}>
              <span className="text-[13px]" style={{ color: 'var(--red)' }}>Code incorrect. Réessayez.</span>
            </div>
          )}

          <div className="flex gap-2.5 mt-8 mb-7">
            {pin.map((digit, index) => (
              <input key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isPending}
                className="w-[52px] h-[52px] text-center text-[22px] font-medium rounded-[6px] outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            ))}
          </div>

          <button
            disabled={isPending || pin.some(d => d === '')}
            className="w-full py-3 rounded-[6px] text-[14px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
            {isPending ? 'Déverrouillage...' : 'Déverrouiller'}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[12px] mt-5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            Ce n&apos;est pas vous ? Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}