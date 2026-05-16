'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils';

export default function LockPage() {
  const router            = useRouter();
  const { data: session } = useSession();
  const [pin, setPin]     = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (val && !/^[0-9]$/.test(val)) return;
    const next = [...pin];
    next[idx]  = val;
    setPin(next);
    setError(false);
    if (val && idx < 3) inputs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) submitPin(next.join(''));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const submitPin = async (code: string) => {
    setLoading(true);
    try {
      const res  = await fetch('/api/settings/verify-pin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pin: code, email: session?.user?.email }),
      });
      const data = await res.json();
      const valid = data?.valid === true || data?.data?.valid === true;

      if (valid) {
        document.cookie = `lastActivity=${Date.now()}; path=/`;
        router.push('/dashboard');
      } else {
        setError(true);
        setPin(['', '', '', '']);
        setLoading(false);
        inputs.current[0]?.focus();
      }
    } catch {
      setError(true);
      setPin(['', '', '', '']);
      setLoading(false);
      inputs.current[0]?.focus();
    }
  };

  const initials = session?.user?.name ? getInitials(session.user.name) : '?';

  return (
    <div className="min-h-screen bg-[var(--bg-card)] flex flex-col items-center justify-center p-[24px]">
      <div className="absolute top-[24px] left-1/2 -translate-x-1/2">
        <span className="text-[14px] font-medium text-[var(--text-primary)]">Melanie Services&amp;Prest.</span>
      </div>
      <div className="w-full max-w-[360px] flex flex-col items-center">
        <div className="w-[56px] h-[56px] rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[18px] font-medium text-[var(--bg-card)] mb-[16px]">
          {initials}
        </div>
        <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-[4px]">
          {session?.user?.name || 'Session verrouillée'}
        </h2>
        <p className="text-[13px] text-[var(--text-secondary)] text-center mb-[36px]">
          Entrez votre code PIN pour reprendre votre session.
        </p>
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
                  ? 'border-[var(--msp-red)] bg-[var(--msp-red-light)] text-[var(--msp-red)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:border-[var(--accent-primary)]'
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="text-[13px] text-[var(--msp-red)] mb-[16px]">Code PIN incorrect. Réessayez.</p>
        )}
        {loading && (
          <p className="text-[13px] text-[var(--text-secondary)] mb-[16px]">Vérification…</p>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-[8px]"
        >
          Se déconnecter complètement
        </button>
      </div>
    </div>
  );
}
