'use client';

import { useState, useRef, useTransition } from 'react';
import { uploadDocument, deleteDocument } from '@/lib/actions/documents';

interface Doc {
  id: string; name: string; fileType: string; size: string; url: string;
  createdAt: string; views: { viewedAt: string }[];
}

interface Props { partnerId: string; initialDocs?: Doc[]; }

export default function DocumentsTab({ partnerId, initialDocs = [] }: Props) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocs = async () => {
    try {
      const res = await fetch(`/api/documents?partnerId=${partnerId}`);
      const data = await res.json();
      if (data.documents) setDocs(data.documents.map((d: any) => ({ ...d, createdAt: d.createdAt, views: d.views ?? [] })));
    } catch {}
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('partnerId', partnerId);
    startTransition(async () => {
      const result = await uploadDocument(fd);
      if (!result?.success) setError(result?.error ?? 'Erreur upload');
      else await refreshDocs();
      setUploading(false);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = (docId: string) => {
    startTransition(async () => {
      await deleteDocument(docId, partnerId);
      setDocs(prev => prev.filter(d => d.id !== docId));
    });
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      {/* ZONE UPLOAD */}
      <div
        onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-[10px] p-[32px] text-center mb-[24px] transition-colors ${isDragging ? 'border-[#1A3A5C] bg-[rgba(26,58,92,0.03)]' : 'border-[#E8E7E4] bg-[#F7F7F6]'}`}
      >
        <p className="text-[13px] text-[#6B6A67]">
          Déposez un fichier ici ou{' '}
          <button onClick={() => fileInputRef.current?.click()} className="text-[#1A3A5C] font-medium hover:underline">
            parcourez
          </button>
        </p>
        <p className="text-[12px] text-[#6B6A67] mt-[4px]">PDF, Word, Excel — max 50 Mo</p>
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      </div>

      {uploading && (
        <div className="flex items-center gap-[8px] mb-[16px] text-[13px] text-[#1A3A5C]">
          <div className="w-[16px] h-[16px] border-2 border-[#1A3A5C] border-t-transparent rounded-full animate-spin"/>
          Upload en cours...
        </div>
      )}
      {error && <p className="text-[13px] text-[#9B2335] mb-[16px]">{error}</p>}

      {/* LISTE */}
      {docs.length === 0 ? (
        <p className="text-[13px] text-[#6B6A67]">Aucun document partagé.</p>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
              <tr>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Fichier</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Taille</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Date</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Vues</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                  <td className="py-[14px] px-[20px] flex items-center gap-[10px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/>
                    </svg>
                    <span className="text-[13px] font-medium text-[#1A1A19] truncate max-w-[200px]">{doc.name}</span>
                  </td>
                  <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{doc.size}</td>
                  <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{fmtDate(doc.createdAt)}</td>
                  <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{doc.views.length}</td>
                  <td className="py-[14px] px-[20px] text-right flex gap-[12px] justify-end">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#1A3A5C] hover:underline">Ouvrir</a>
                    <button onClick={() => handleDelete(doc.id)} className="text-[12px] text-[#9B2335] hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
