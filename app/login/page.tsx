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

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(true);
      setIsPending(false);
    } else {
      router.push('/dashboard');
      router.refresh();
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

      {/* COLONNE DROITE (Formulaire) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[24px] lg:px-[10%] h-screen overflow-y-auto">
        <div className="w-full max-w-[400px]">
          
          <Link href="/" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors duration-150">
            ← Retour au site
          </Link>

          {/* H1 ajusté à 22px pour respecter les règles typographiques (24px interdit) */}
          <h1 className="text-[22px] font-medium text-[#1A1A19] mt-[40px]">
            Connexion à votre espace
          </h1>
          <p className="text-[14px] text-[#6B6A67] mt-[8px] mb-[36px]">
            Entrez vos identifiants pour accéder à votre espace sécurisé.
          </p>

          {error && (
            <div className="mb-[24px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px_14px] flex items-start gap-[10px]">
              <div className="mt-[2px] flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span className="text-[13px] text-[#9B2335]">
                Identifiants incorrects. Veuillez réessayer.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">
                Adresse email
              </label>
              <input 
                id="email" 
                type="email" 
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors duration-150"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="mt-[20px]">
              <label htmlFor="password" className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">
                Mot de passe
              </label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-[10px_14px] pr-[40px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#6B6A67]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Link href="/forgot-password" className="block text-right text-[12px] text-[#1A3A5C] mt-[8px] hover:underline">
              Mot de passe oublié ?
            </Link>

            <button 
              type="submit" 
              disabled={isPending}
              className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[12px] rounded-[6px] text-[14px] font-medium mt-[28px] transition-colors duration-200 
                ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}
            >
              {isPending ? 'Connexion...' : 'Se connecter'}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}