'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { formatDate } from '@/lib/utils';

interface Doc {
  id:        string;
  name:      string;
  fileType:  string;
  size:      string;
  url:       string;
  createdAt: string;
  views:     { viewedAt: string }[];
}

export default function DocumentsTab({ partnerId }: { partnerId: string }) {
  const [docs, setDocs]           = useState<Doc[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    fetch(`/api/documents?partnerId=${partnerId}`)
      .then(r => r.json())
      .then(d => { setDocs(d.documents || []); setLoading(false); });
  };

  useEffect(() => { reload(); }, [partnerId]);

  const processUpload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) { setError('Fichier trop volumineux (max 50 Mo).'); return; }
    setError(''); setUploading(true); setProgress(20);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('partnerId', partnerId);

    setProgress(60);
    const res  = await fetch('/api/documents', { method: 'POST', body: fd });
    const data = await res.json();
    setProgress(100);

    if (!data.success) setError(data.error || 'Erreur upload.');
    else reload();

    setTimeout(() => { setUploading(false); setProgress(0); }, 600);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) await processUpload(e.dataTransfer.files[0]);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    startTransition(async () => {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      setDocs(prev => prev.filter(d => d.id !== id));
    });
  };

  const getFileColor = (fileType: string) => {
    if (fileType.includes('pdf'))   return '#1A3A5C';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '#2D6A4F';
    if (fileType.includes('word'))  return '#8B4513';
    return '#6B6A67';
  };

  const getFileLabel = (fileType: string) => {
    if (fileType.includes('pdf'))   return 'PDF';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Excel';
    if (fileType.includes('word'))  return 'Word';
    if (fileType.includes('image')) return 'Image';
    return 'Fichier';
  };

  return (
    <div>
      {/* BARRE ACTION */}
      <div className="flex justify-between items-center mb-[16px]">
        <span className="text-[13px] text-[var(--text-secondary)]">{docs.length} document{docs.length > 1 ? 's' : ''} partagé{docs.length > 1 ? 's' : ''}</span>
        <button onClick={() => fileInputRef.current?.click()}
          className="bg-[var(--accent-primary)] text-[#FFFFFF] py-[8px] px-[16px] rounded-[8px] text-[13px] font-medium hover:bg-[var(--msp-blue-mid)] transition-colors">
          Partager un document
        </button>
        <input type="file" ref={fileInputRef} className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={e => { if (e.target.files?.[0]) processUpload(e.target.files[0]); }} />
      </div>

      {error && <div className="mb-[16px] bg-[var(--msp-red-light)] border border-[var(--msp-red)] rounded-[8px] p-[10px_14px] text-[13px] text-[var(--msp-red)]">{error}</div>}

      {/* ZONE DRAG & DROP */}
      <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={`border-2 border-dashed rounded-[10px] p-[36px] text-center transition-colors mb-[24px] ${
          isDragging ? 'border-[var(--accent-primary)] bg-[rgba(26,58,92,0.03)]' : 'border-[var(--border)] bg-[var(--bg-card)]'
        }`}>
        <svg className="mx-auto mb-[10px]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
        </svg>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Déposez vos fichiers ici ou{' '}
          <button onClick={() => fileInputRef.current?.click()} className="text-[var(--accent-primary)] font-medium hover:underline">parcourez</button>
        </p>
        <p className="text-[12px] text-[var(--text-secondary)] mt-[4px]">PDF, Word, Excel, images — max 50 Mo</p>
        {uploading && (
          <div className="mt-[14px] max-w-[260px] mx-auto">
            <div className="w-full h-[3px] bg-[#E8E7E4] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent-primary)] transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-[4px]">Upload en cours… {progress}%</p>
          </div>
        )}
      </div>

      {/* LISTE */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-[32px] text-center text-[13px] text-[var(--text-secondary)]">Chargement…</div>
        ) : docs.length === 0 ? (
          <div className="p-[32px] text-center text-[13px] text-[var(--text-secondary)]">Aucun document partagé avec ce partenaire.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
              <tr>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Fichier</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Type</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Taille</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Partagé le</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)]">Consulté</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => {
                const lastView = doc.views?.[0];
                return (
                  <tr key={doc.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                    <td className="py-[13px] px-[20px]">
                      <div className="flex items-center gap-[8px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getFileColor(doc.fileType)} strokeWidth="1.5" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="text-[13px] font-medium text-[var(--text-primary)] truncate max-w-[180px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-[13px] px-[20px]">
                      <span className="inline-block border border-[var(--border)] text-[var(--text-secondary)] py-[2px] px-[8px] rounded-[6px] text-[11px]">
                        {getFileLabel(doc.fileType)}
                      </span>
                    </td>
                    <td className="py-[13px] px-[20px] text-[12px] text-[var(--text-secondary)]">{doc.size}</td>
                    <td className="py-[13px] px-[20px] text-[12px] text-[var(--text-secondary)]">{formatDate(doc.createdAt)}</td>
                    <td className="py-[13px] px-[20px]">
                      {lastView ? (
                        <div className="flex items-center gap-[5px]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--msp-green)" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <span className="text-[12px] text-[var(--msp-green)]">{formatDate(lastView.viewedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[var(--text-secondary)]">Non consulté</span>
                      )}
                    </td>
                    <td className="py-[13px] px-[20px] text-right">
                      <div className="flex gap-[12px] justify-end">
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-[12px] text-[var(--accent-primary)] hover:underline">Voir</a>
                        <button onClick={() => handleDelete(doc.id, doc.name)} disabled={isPending}
                          className="text-[12px] text-[var(--msp-red)] hover:underline disabled:opacity-50">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
