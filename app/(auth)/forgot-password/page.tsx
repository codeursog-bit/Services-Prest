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
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-[24px]">
      <div className="w-full max-w-[380px]">
        <Link href="/login" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] mb-[32px]">
          ← Retour à la connexion
        </Link>

        <h2 className="text-[20px] font-medium text-[#1A1A19] mb-[8px]">Mot de passe oublié</h2>
        <p className="text-[13px] text-[#6B6A67] mb-[28px]">
          Entrez votre adresse email. Si un compte existe, vous recevrez un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="bg-[#EAF3DE] border border-[#2D6A4F] rounded-[8px] p-[16px] text-[13px] text-[#2D6A4F]">
            ✓ Si un compte correspond à cet email, un lien de réinitialisation a été envoyé.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px] text-[13px] text-[#9B2335]">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              <div>
                <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Adresse email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@melanieservices.com"
                  className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]" />
              </div>
              <button type="submit" disabled={loading}
                className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[11px] rounded-[6px] text-[14px] font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'
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
