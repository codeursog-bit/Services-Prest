'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res  = await fetch('/api/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (data.success) setSent(true);
    else setError(data.error || 'Erreur.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-card)] flex items-center justify-center p-[24px]">
      <div className="w-full max-w-[380px]">
        <Link href="/login" className="inline-block text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-[32px]">
          ← Retour à la connexion
        </Link>

        <h2 className="text-[20px] font-medium text-[var(--text-primary)] mb-[8px]">Mot de passe oublié</h2>
        <p className="text-[13px] text-[var(--text-secondary)] mb-[28px]">
          Entrez votre adresse email. Si un compte existe, vous recevrez un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="bg-[var(--msp-green-light)] border border-[var(--msp-green)] rounded-[8px] p-[16px] text-[13px] text-[var(--msp-green)]">
            ✓ Si un compte correspond à cet email, un lien de réinitialisation a été envoyé.
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
                <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-[6px]">Adresse email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@melanieservices.com"
                  className="w-full p-[10px_14px] border border-[var(--border)] rounded-[8px] text-[14px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
              </div>
              <button type="submit" disabled={loading}
                className={`w-full bg-[var(--accent-primary)] text-[var(--bg-card)] py-[11px] rounded-[8px] text-[14px] font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-wait' : 'hover:bg-[var(--msp-blue-mid)]'
                }`}>
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
