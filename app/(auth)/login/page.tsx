'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email:    email.trim(),
      password,
    });

    if (res?.error) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">

      {/* GAUCHE — Branding desktop */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[#1A3A5C] h-screen sticky top-0 px-[48px] text-center">
        <h1 className="text-[22px] font-medium text-[#FFFFFF]">Melanie Services&amp;Prest.</h1>
        <span className="text-[13px] text-[#FFFFFF] opacity-60 mt-[6px]">Votre partenaire idéal !</span>
        <div className="h-[1px] bg-[#FFFFFF] opacity-15 w-[40px] my-[28px]"></div>
        <p className="text-[13px] text-[#FFFFFF] opacity-50 leading-[1.8] max-w-[240px]">
          Accès sécurisé à votre espace de gestion des partenaires et du suivi de marchés.
        </p>
      </div>

      {/* DROITE — Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[24px] lg:px-[10%] h-screen overflow-y-auto">
        <div className="w-full max-w-[380px]">

          {/* Mobile branding */}
          <div className="lg:hidden mb-[32px] text-center">
            <h1 className="text-[18px] font-medium text-[#1A1A19]">Melanie Services&amp;Prest.</h1>
            <span className="text-[12px] text-[#6B6A67]">Votre partenaire idéal !</span>
          </div>

          <h2 className="text-[20px] font-medium text-[#1A1A19] mb-[8px]">Connexion</h2>
          <p className="text-[13px] text-[#6B6A67] mb-[28px]">Accédez à votre espace de gestion.</p>

          {error && (
            <div className="mb-[20px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            <div>
              <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Adresse email</label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@melanieservices.com"
                className={ic}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-[6px]">
                <label className="text-[12px] font-medium text-[#1A1A19]">Mot de passe</label>
                <Link href="/forgot-password" className="text-[12px] text-[#1A3A5C] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${ic} pr-[40px]`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#6B6A67] hover:text-[#1A1A19] transition-colors">
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[11px] rounded-[6px] text-[14px] font-medium transition-colors mt-[4px] ${
                loading ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'
              }`}>
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
