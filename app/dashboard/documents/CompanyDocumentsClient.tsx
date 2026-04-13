'use client';

import { useState, useRef, useTransition } from 'react';
import { uploadCompanyDocument, deleteDocument } from '@/lib/actions/documents';

interface Doc {
  id: string; name: string; fileType: string; size: string; url: string;
  category?: string | null; validityDate?: string | null; createdAt: string;
}
interface Partner { id: string; orgName: string; }
interface Props {
  initialDocs: Doc[];
  partners: Partner[];
  countByCategory: Record<string, number>;
}

const CATEGORIES = [
  { id: 'RC',    name: 'Registre de commerce' },
  { id: 'FISC',  name: 'Attestations fiscales' },
  { id: 'QHSE',  name: 'Certifications QHSE' },
  { id: 'PLAN',  name: 'Plans de charge' },
  { id: 'ASSUR', name: 'Assurances' },
  { id: 'CONT',  name: 'Contrats cadres' },
  { id: 'RAPP',  name: "Rapports d'activité" },
  { id: 'AUTR',  name: 'Autres documents' },
];

export default function CompanyDocumentsClient({ initialDocs, partners, countByCategory }: Props) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const counts = docs.reduce((acc: Record<string, number>, d) => {
    const cat = d.category ?? 'AUTR';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, { ...countByCategory });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const isExpired = (d: Doc) => !!d.validityDate && new Date(d.validityDate) < new Date();
  const isWarning = (d: Doc) => {
    if (!d.validityDate) return false;
    const diff = new Date(d.validityDate).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 3600000;
  };

  const handleUpload = async (file: File) => {
    if (!uploadCategory) { setError("Sélectionnez une catégorie d'abord."); return; }
    setUploading(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', uploadCategory);
    startTransition(async () => {
      const res = await uploadCompanyDocument(fd);
      if (!res?.success) setError(res?.error ?? 'Erreur upload');
      else {
        const r = await fetch('/api/documents');
        const data = await r.json();
        if (data.documents) setDocs(data.documents);
      }
      setUploading(false);
    });
  };

  const handleDelete = (docId: string) => {
    startTransition(async () => {
      await deleteDocument(docId, '');
      setDocs(prev => prev.filter(d => d.id !== docId));
    });
  };

  const filteredDocs = activeCategory
    ? docs.filter(d => (d.category ?? 'AUTR') === activeCategory)
    : docs;

  return (
    <>
      <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>
        Documents officiels de Melanie Services&Prest. — partagez-les avec vos partenaires depuis leurs fiches.
      </p>

      {error && (
        <div className="mb-4 rounded-[6px] p-3 text-[13px]"
          style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {/* CATÉGORIES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {CATEGORIES.map(cat => {
          const count = counts[cat.id] ?? 0;
          const active = activeCategory === cat.id;
          return (
            <button key={cat.id}
              onClick={() => setActiveCategory(active ? null : cat.id)}
              className="flex flex-col items-start p-5 rounded-[10px] border transition-colors text-left"
              style={{
                background: active ? 'var(--navy)' : 'var(--bg-card)',
                border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
              }}>
              <span className="text-[13px] font-medium mb-1"
                style={{ color: active ? '#FFFFFF' : 'var(--text-primary)' }}>
                {cat.name}
              </span>
              <span className="text-[12px]"
                style={{ color: active ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                {count} document{count !== 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* UPLOAD */}
      <div className="rounded-[10px] p-5 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
          <div className="w-full md:w-[280px]">
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Catégorie *
            </label>
            <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} className="dash-input">
              <option value="">Sélectionnez une catégorie</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div
            onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
            className="flex-1 w-full border-2 border-dashed rounded-[10px] p-5 text-center transition-colors"
            style={{
              borderColor: isDragging ? 'var(--navy)' : 'var(--border)',
              background: isDragging ? 'rgba(15,39,68,0.04)' : 'var(--bg-dash)',
            }}>
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-[13px]" style={{ color: 'var(--navy)' }}>
                <div className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }}/>
                Upload en cours…
              </div>
            ) : (
              <>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  Déposez ici ou{' '}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="font-medium hover:underline" style={{ color: 'var(--navy)' }}>
                    parcourez
                  </button>
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>PDF, Word, Excel — max 50 Mo</p>
              </>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </div>
        </div>
      </div>

      {/* LISTE */}
      {filteredDocs.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {activeCategory ? 'Aucun document dans cette catégorie.' : 'Aucun document uploadé.'}
        </p>
      ) : (
        <div className="rounded-[10px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['Fichier', 'Catégorie', 'Validité', 'Ajouté le', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 px-5">
                      <span className="text-[13px] font-medium truncate block max-w-[220px]"
                        style={{ color: 'var(--text-primary)' }}>
                        {doc.name}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {CATEGORIES.find(c => c.id === doc.category)?.name ?? '—'}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
                          {doc.validityDate ? fmtDate(doc.validityDate) : '—'}
                        </span>
                        {isExpired(doc) && <span className="badge badge-red">Expiré</span>}
                        {!isExpired(doc) && isWarning(doc) && <span className="badge badge-orange">&lt; 30j</span>}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {fmtDate(doc.createdAt)}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => setSharingDoc(doc.id)}
                          className="text-[12px] hover:underline" style={{ color: 'var(--navy)' }}>
                          Partager
                        </button>
                        <a href={doc.url} target="_blank" rel="noreferrer"
                          className="text-[12px] hover:underline" style={{ color: 'var(--text-muted)' }}>
                          Ouvrir
                        </a>
                        <button onClick={() => handleDelete(doc.id)}
                          className="text-[12px] hover:underline" style={{ color: 'var(--red)' }}>
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARTAGE */}
      {sharingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="rounded-[10px] w-full max-w-[440px] p-7"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-[16px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Partager avec un partenaire
            </h2>
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto mb-5 rounded-[6px] p-3"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-dash)' }}>
              {partners.map(p => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[var(--navy)]" />
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{p.orgName}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSharingDoc(null)}
                className="py-2 px-4 rounded-[6px] text-[13px] font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--bg-surface)' }}>
                Annuler
              </button>
              <button onClick={() => setSharingDoc(null)}
                className="py-2 px-4 rounded-[6px] text-[13px] font-medium"
                style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
                Partager
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}