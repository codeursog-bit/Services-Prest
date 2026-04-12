'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(false);
    const res = await signIn('credentials', { redirect: false, email, password });
    if (res?.error) {
      setError(true);
      setIsPending(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
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

      {/* COLONNE DROITE formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:px-[10%] h-screen overflow-y-auto">
        <div className="w-full max-w-[400px]">

          <Link href="/" className="inline-block text-[12px] transition-colors" style={{ color: 'var(--text-muted)' }}>
            ← Retour au site
          </Link>

          <h1 className="text-[22px] font-medium mt-10" style={{ color: 'var(--text-primary)' }}>
            Connexion à votre espace
          </h1>
          <p className="text-[14px] mt-2 mb-9" style={{ color: 'var(--text-muted)' }}>
            Entrez vos identifiants pour accéder à votre espace sécurisé.
          </p>

          {error && (
            <div className="mb-5 rounded-[6px] p-3 flex items-start gap-2.5" style={{ background: 'var(--red-bg)', border: '1px solid var(--red)' }}>
              <svg className="mt-0.5 flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-[13px]" style={{ color: 'var(--red)' }}>Identifiants incorrects. Veuillez réessayer.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Adresse email
              </label>
              <input
                id="email" type="email" name="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="dash-input" />
            </div>

            <div className="mt-5">
              <label htmlFor="password" className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  name="password" autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="dash-input pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Link href="/forgot-password" className="block text-right text-[12px] mt-2 hover:underline" style={{ color: 'var(--navy-mid)' }}>
              Mot de passe oublié ?
            </Link>

            <button type="submit" disabled={isPending}
              className="w-full py-3 rounded-[6px] text-[14px] font-medium mt-7 transition-colors disabled:opacity-70 disabled:cursor-wait"
              style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
              {isPending ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}