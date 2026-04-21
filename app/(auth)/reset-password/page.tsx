import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-card)] flex items-center justify-center"><p className="text-[14px] text-[var(--text-secondary)]">Chargement…</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}