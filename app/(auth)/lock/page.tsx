'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils';

export default function LockPage() {
  const router          = useRouter();
  const { data: session } = useSession();
  const [pin, setPin]   = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus automatique sur le 1er champ
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (val && !/^[0-9]$/.test(val)) return;
    const next = [...pin];
    next[idx]  = val;
    setPin(next);
    setError(false);

    // Focus suivant
    if (val && idx < 3) inputs.current[idx + 1]?.focus();

    // Auto-submit quand 4 chiffres
    if (next.every(d => d !== '')) {
      submitPin(next.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const submitPin = async (code: string) => {
    setLoading(true);
    const res  = await fetch('/api/settings/verify-pin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ pin: code }),
    });
    const data = await res.json();

    if (data.success) {
      // Rafraîchir le cookie d'activité
      document.cookie = `lastActivity=${Date.now()}; path=/`;
      router.push('/dashboard');
    } else {
      setError(true);
      setPin(['', '', '', '']);
      setLoading(false);
      inputs.current[0]?.focus();
    }
  };

  const initials = session?.user?.name ? getInitials(session.user.name) : '?';

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-[24px]">

      {/* Logo */}
      <div className="absolute top-[24px] left-1/2 -translate-x-1/2">
        <span className="text-[14px] font-medium text-[#1A1A19]">Melanie Services&amp;Prest.</span>
      </div>

      <div className="w-full max-w-[360px] flex flex-col items-center">

        {/* Avatar */}
        <div className="w-[56px] h-[56px] rounded-full bg-[#1A3A5C] flex items-center justify-center text-[18px] font-medium text-[#FFFFFF] mb-[16px]">
          {initials}
        </div>

        <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[4px]">
          {session?.user?.name || 'Session verrouillée'}
        </h2>
        <p className="text-[13px] text-[#6B6A67] text-center mb-[36px]">
          Entrez votre code PIN pour reprendre votre session.
        </p>

        {/* PIN INPUTS */}
        <div className="flex gap-[12px] mb-[20px]">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-[56px] h-[56px] text-center text-[24px] font-medium rounded-[8px] border transition-colors focus:outline-none disabled:opacity-50 ${
                error
                  ? 'border-[#9B2335] bg-[#FCEBEB] text-[#9B2335]'
                  : 'border-[#E8E7E4] bg-[#FFFFFF] text-[#1A1A19] focus:border-[#1A3A5C]'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[13px] text-[#9B2335] mb-[16px]">Code PIN incorrect. Réessayez.</p>
        )}
        {loading && (
          <p className="text-[13px] text-[#6B6A67] mb-[16px]">Vérification…</p>
        )}

        {/* Déconnexion */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors mt-[8px]"
        >
          Se déconnecter complètement
        </button>
      </div>
    </div>
  );
}
