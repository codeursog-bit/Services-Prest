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
    if (result.success && result.email) setSuccessEmail(result.email);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="w-full max-w-[440px] rounded-[10px] p-6 sm:p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

        {successEmail ? (
          <div className="text-center flex flex-col items-center">
            <svg className="mb-5" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <h1 className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>Email envoyé</h1>
            <p className="text-[14px] leading-[1.7] mt-2.5 mb-8" style={{ color: 'var(--text-muted)' }}>
              Un lien de réinitialisation a été envoyé à {successEmail}. Vérifiez aussi vos spams.
            </p>
            <Link href="/login"
              className="w-full py-3 rounded-[6px] text-[14px] font-medium text-center transition-colors inline-block"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="inline-block text-[12px] mb-10 transition-colors" style={{ color: 'var(--text-muted)' }}>
              ← Retour à la connexion
            </Link>

            <svg className="mb-5" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--navy-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>

            <h1 className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>Réinitialiser votre mot de passe</h1>
            <p className="text-[14px] leading-[1.7] mt-2.5 mb-8" style={{ color: 'var(--text-muted)' }}>
              Entrez votre adresse email. Vous recevrez un lien sécurisé pour créer un nouveau mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Adresse email</label>
                <input id="email" type="email" name="email" required className="dash-input" />
              </div>
              <button type="submit" disabled={isPending}
                className="w-full py-3 rounded-[6px] text-[14px] font-medium transition-colors disabled:opacity-70 disabled:cursor-wait"
                style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
                {isPending ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}