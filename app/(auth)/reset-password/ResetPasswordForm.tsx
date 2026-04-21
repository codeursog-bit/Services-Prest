'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!token) setError('Lien invalide. Faites une nouvelle demande.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8)  { setError('Mot de passe trop court (min 8 caractères).'); return; }
    if (password !== confirm)  { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');

    const res  = await fetch('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, password }),
    });
    const data = await res.json();

    if (data.success) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } else {
      setError(data.error || 'Erreur.');
      setLoading(false);
    }
  };

  const ic = "w-full p-[10px_14px] border border-[var(--border)] rounded-[8px] text-[14px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]";

  return (
    <div className="min-h-screen bg-[var(--bg-card)] flex items-center justify-center p-[24px]">
      <div className="w-full max-w-[380px]">
        <Link href="/login" className="inline-block text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-[32px]">
          ← Retour à la connexion
        </Link>

        <h2 className="text-[20px] font-medium text-[var(--text-primary)] mb-[8px]">Nouveau mot de passe</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mb-[28px]">Choisissez un nouveau mot de passe sécurisé.</p>

        {success ? (
          <div className="bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[16px] text-[13px] text-[var(--msp-green)]">
            ✓ Mot de passe modifié avec succès. Redirection vers la connexion…
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-[16px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[12px] text-[13px] text-[var(--msp-red)]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]">Nouveau mot de passe</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className={`${ic} pr-[40px]`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-[4px]">
                  {password.length}/8 caractères minimum
                  {password.length >= 8 && <span className="text-[var(--msp-green)] ml-[6px]">✓</span>}
                </p>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]">Confirmer le mot de passe</label>
                <input type="password" required
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className={ic} />
                {confirm && password !== confirm && (
                  <p className="text-[11px] text-[var(--msp-red)] mt-[4px]">Les mots de passe ne correspondent pas.</p>
                )}
                {confirm && password === confirm && confirm.length >= 8 && (
                  <p className="text-[11px] text-[var(--msp-green)] mt-[4px]">✓ Les mots de passe correspondent.</p>
                )}
              </div>
              <button type="submit" disabled={loading || !token}
                className={`w-full bg-[var(--accent-primary)] text-[var(--bg-card)] py-[11px] rounded-[8px] text-[14px] font-medium transition-colors ${
                  loading || !token ? 'opacity-70 cursor-wait' : 'hover:bg-[var(--msp-blue-mid)]'
                }`}>
                {loading ? 'Enregistrement…' : 'Modifier le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}