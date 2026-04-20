import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center"><p className="text-[14px] text-[#6B6A67]">Chargement…</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}