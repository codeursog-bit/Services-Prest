'use client';

import { useRef, useState, useTransition } from 'react';

export default function ContratClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('');
    // Placeholder — connecter à la server action uploadContractVersion()
    setMsg('Upload à connecter à la server action uploadContractVersion()');
  };

  return (
    <div className="rounded-[8px] p-4 flex flex-wrap items-center gap-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors disabled:opacity-60"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
        {isPending ? 'Upload…' : 'Ajouter une nouvelle version'}
      </button>
      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>PDF uniquement</span>
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
      {msg && <span className="text-[12px]" style={{ color: 'var(--orange)' }}>{msg}</span>}
    </div>
  );
}