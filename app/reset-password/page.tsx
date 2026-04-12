// 'use client';

// import { useState, useMemo } from 'react';
// import Link from 'next/link';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { resetPasswordAction } from '@/lib/actions/auth-actions';

// export default function ResetPasswordPage() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');
//   const router = useRouter();

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isPending, setIsPending] = useState(false);

//   // Évaluation de la force (strictement selon vos règles)
//   const strength = useMemo(() => {
//     if (!password) return 0;
//     let score = 0;
//     if (password.length >= 8) score += 1;
//     if (/[A-Z]/.test(password)) score += 1;
//     if (/[0-9]/.test(password)) score += 1;
//     if (/[^A-Za-z0-9]/.test(password)) score += 1;
//     return score;
//   }, [password]);

//   const strengthColor = strength === 0 ? 'transparent' : strength < 2 ? '#9B2335' : strength === 2 ? '#8B4513' : '#2D6A4F';

//   if (!token) {
//     return (
//       <main className="min-h-screen bg-[#F7F7F6] flex items-center justify-center p-4">
//         <div className="w-full max-w-[440px] bg-[#FFFFFF] p-[80px_40px] border border-[#E8E7E4] rounded-[10px] text-center">
//           <h1 className="text-[22px] font-medium text-[#1A1A19]">Lien invalide</h1>
//           <p className="text-[14px] text-[#6B6A67] mt-[10px] mb-[32px]">Ce lien de réinitialisation est invalide ou expiré.</p>
//           <Link href="/forgot-password" className="text-[13px] text-[#1A3A5C] hover:underline">Demander un nouveau lien</Link>
//         </div>
//       </main>
//     );
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError(null);

//     if (password !== confirmPassword) {
//       setError("Les mots de passe ne correspondent pas.");
//       return;
//     }
//     if (password.length < 8) {
//       setError("Le mot de passe doit faire au moins 8 caractères.");
//       return;
//     }

//     setIsPending(true);
//     const formData = new FormData();
//     formData.append('password', password);

//     const result = await resetPasswordAction(token, formData);
    
//     if (result.success) {
//       router.push('/login?reset=success');
//     } else {
//       setError(result.error || "Une erreur est survenue.");
//       setIsPending(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#F7F7F6] flex items-center justify-center p-4">
//       <div className="w-full max-w-[440px] bg-[#FFFFFF] p-[40px_24px] md:p-[80px_40px] border border-[#E8E7E4] rounded-[10px]">
        
//         <Link href="/login" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors mb-[40px]">
//           ← Retour à la connexion
//         </Link>

//         <h1 className="text-[22px] font-medium text-[#1A1A19] mb-[32px]">Nouveau mot de passe</h1>

//         {error && (
//           <div className="mb-[24px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px]">
//             <span className="text-[13px] text-[#9B2335]">{error}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          
//           <div>
//             <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Nouveau mot de passe</label>
//             <div className="relative">
//               <input 
//                 type={showPassword ? "text" : "password"} 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required 
//                 className="w-full p-[10px_14px] pr-[40px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#6B6A67]"
//               >
//                 {showPassword ? (
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
//                 ) : (
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
//                 )}
//               </button>
//             </div>
//             {/* Barre de force */}
//             <div className="h-[2px] w-full bg-[#E8E7E4] mt-[6px] rounded-full overflow-hidden">
//               <div 
//                 className="h-full transition-all duration-300 ease-out" 
//                 style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strengthColor }}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Confirmer le mot de passe</label>
//             <input 
//               type={showPassword ? "text" : "password"} 
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required 
//               className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors"
//             />
//           </div>

//           <button 
//             type="submit" 
//             disabled={isPending}
//             className={`w-full bg-[#1A3A5C] text-[#FFFFFF] py-[12px] rounded-[6px] text-[14px] font-medium mt-[8px] transition-colors
//               ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-[#142d4a]'}`}
//           >
//             {isPending ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
//           </button>
          
//         </form>
//       </div>
//     </main>
//   );
// }



'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/lib/actions/auth-actions';

// On sépare le formulaire pour l'envelopper dans Suspense
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Évaluation de la force (strictement selon vos règles)
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthColor = strength === 0 ? 'transparent' : strength < 2 ? '#9B2335' : strength === 2 ? '#8B4513' : '#2D6A4F';

  if (!token) {
    return (
      <main className="min-h-screen bg-[#F7F7F6] flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-[#FFFFFF] p-[80px_40px] border border-[#E8E7E4] rounded-[10px] text-center">
          <h1 className="text-[22px] font-medium text-[#1A1A19]">Lien invalide</h1>
          <p className="text-[14px] text-[#6B6A67] mt-[10px] mb-[32px]">Ce lien de réinitialisation est invalide ou expiré.</p>
          <Link href="/forgot-password" className="text-[13px] text-[#1A3A5C] hover:underline">Demander un nouveau lien</Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append('password', password);

    const result = await resetPasswordAction(token, formData);
    
    if (result.success) {
      router.push('/login?reset=success');
    } else {
      setError(result.error || "Une erreur est survenue.");
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#FFFFFF] p-[40px_24px] md:p-[80px_40px] border border-[#E8E7E4] rounded-[10px]">
        
        <Link href="/login" className="inline-block text-[12px] text-[#6B6A67] hover:text-[#1A1A19] transition-colors mb-[40px]">
          ← Retour à la connexion
        </Link>

        <h1 className="text-[22px] font-medium text-[#1A1A19] mb-[32px]">Nouveau mot de passe</h1>

        {error && (
          <div className="mb-[24px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px]">
            <span className="text-[13px] text-[#9B2335]">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          
          <div>
            <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Nouveau mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full p-[10px_14px] pr-[40px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#6B6A67]"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {/* Barre de force */}
            <div className="h-[2px] w-full bg-[#E8E7E4] mt-[6px] rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-out" 
                style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strengthColor }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Confirmer le mot de passe</label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isPending ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
          </button>
          
        </form>
      </div>
    </main>
  );
}

// Composant principal exporté
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F7F7F6] flex items-center justify-center p-4">
        <div className="text-[14px] text-[#6B6A67]">Chargement...</div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}