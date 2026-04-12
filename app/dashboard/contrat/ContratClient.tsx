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
    // Placeholder — nécessite une server action uploadContractVersion()
    // à créer avec S3 + prisma.contractVersion.create()
    setMsg('Upload à connecter à la server action uploadContractVersion()');
  };

  return (
    <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[16px] flex items-center gap-[12px]">
      <button onClick={() => fileInputRef.current?.click()} disabled={isPending}
        className="border border-[#E8E7E4] bg-[#FFFFFF] text-[#1A1A19] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] disabled:opacity-60">
        {isPending ? 'Upload…' : 'Ajouter une nouvelle version'}
      </button>
      <span className="text-[12px] text-[#6B6A67]">PDF uniquement</span>
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
      {msg && <span className="text-[12px] text-[#8B4513]">{msg}</span>}
    </div>
  );
}
