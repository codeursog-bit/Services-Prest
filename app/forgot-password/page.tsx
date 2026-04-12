'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/actions/auth-actions';

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);
    
    setIsPending(false);
    if (result.success && result.email) {
      setSuccessEmail(result.email);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#FFFFFF] p-[40px_24px] md:p-[80px_40px] border border-[#E8E7E4] rounded-[10px]">
        
        {successEmail ? (
          <div className="text-center flex flex-col items-center">
            <svg className="mb-[20px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <h1 className="text-[22px] font-medium text-[#1A1A19]">Email envoyé</h1>
            <p className="text-[14px] text-[#6B6A67] leading-[1.7] mt-[10px] mb-[32px]">
              Un lien de réinitialisation a été envoyé à {successEmail}. Vérifiez aussi vos spams.
            </p>
            <Link 
              href="/login" 
              className="w-full border border-[#E8E7E4] text-[#1A1A19] py-[12px] rounded-[6px] text-[14px] font-medium hover:border-[#1A3A5C] hover:text-[#1A3A5C] transition-colors inline-block"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors mb-[40px]">
              ← Retour à la connexion
            </Link>

            <svg className="mb-[20px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>

            <h1 className="text-[22px] font-medium text-[#1A1A19]">Réinitialiser votre mot de passe</h1>
            <p className="text-[14px] text-[#6B6A67] leading-[1.7] mt-[10px] mb-[32px]">
              Entrez votre adresse email. Vous recevrez un lien sécurisé pour créer un nouveau mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
              <div>
                <label htmlFor="email" className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Adresse email</label>
                <input 
                  id="email" 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[12px] rounded-[6px] text-[14px] font-medium mt-[8px] transition-colors
                  ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}
              >
                {isPending ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}