'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, daysUntil } from '@/lib/utils';

interface Doc {
  id:           string;
  name:         string;
  fileType:     string;
  size:         string;
  url:          string;
  category:     string | null;
  validityDate: string | null;
  createdAt:    string;
}

interface Partner { id: string; orgName: string; }

const CATEGORIES = [
  { id: 'RC',   label: 'Registre de commerce',  icon: '🏢' },
  { id: 'FISC', label: 'Attestations fiscales',  icon: '📋' },
  { id: 'QHSE', label: 'Certifications QHSE',    icon: '🛡️' },
  { id: 'PLAN', label: 'Plans de charge',         icon: '📅' },
  { id: 'ASSUR',label: 'Assurances',              icon: '🔐' },
  { id: 'CONT', label: 'Contrats cadres',         icon: '✍️' },
  { id: 'RAPP', label: "Rapports d'activité",     icon: '📊' },
  { id: 'AUTR', label: 'Autres documents',        icon: '📁' },
];

const CAT_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

export default function CompanyDocumentsPage() {
  const [docs, setDocs]                   = useState<Doc[]>([]);
  const [partners, setPartners]           = useState<Partner[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDragging, setIsDragging]       = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [progress, setProgress]           = useState(0);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadValidity, setUploadValidity] = useState('');
  const [error, setError]                 = useState('');
  const [shareDocId, setShareDocId]       = useState<string | null>(null);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [isPending, startTransition]      = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/documents?company=true').then(r => r.json()),
      fetch('/api/partners').then(r => r.json()),
    ]).then(([docsData, partnersData]) => {
      setDocs(docsData.documents || []);
      setPartners(partnersData.partners || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const reload = () => {
    fetch('/api/documents?company=true').then(r => r.json())
      .then(d => setDocs(d.documents || []));
  };

  const processUpload = async (file: File) => {
    if (!uploadCategory) { setError('Sélectionnez une catégorie avant d\'uploader.'); return; }
    if (file.size > 50 * 1024 * 1024) { setError('Fichier trop volumineux (max 50 Mo).'); return; }
    setError(''); setUploading(true); setProgress(20);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', uploadCategory);
    if (uploadValidity) fd.append('validityDate', uploadValidity);

    setProgress(60);
    const res  = await fetch('/api/documents', { method: 'POST', body: fd });
    const data = await res.json();
    setProgress(100);

    if (!data.success) setError(data.error || 'Erreur upload.');
    else { reload(); setUploadValidity(''); }

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

  const handleShare = async () => {
    if (!shareDocId || !selectedPartners.length) return;
    startTransition(async () => {
      const res  = await fetch('/api/documents/share', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ documentId: shareDocId, partnerIds: selectedPartners }),
      });
      const data = await res.json();
      if (data.success) { setShareDocId(null); setSelectedPartners([]); }
      else setError(data.error || 'Erreur partage.');
    });
  };

  const filteredDocs = activeCategory ? docs.filter(d => d.category === activeCategory) : docs;

  // Compter docs par catégorie
  const countByCategory = (catId: string) => docs.filter(d => d.category === catId).length;

  // Docs expirés ou proches de l'expiration
  const expiringDocs = docs.filter(d => {
    if (!d.validityDate) return false;
    const days = daysUntil(d.validityDate);
    return days !== null && days <= 30;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf'))   return '#1A3A5C';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '#2D6A4F';
    if (fileType.includes('word'))  return '#8B4513';
    if (fileType.includes('image')) return '#9B2335';
    return '#6B6A67';
  };

  return (
    <DashboardLayout pageTitle="Documents de l'entreprise">

      {/* ALERTES EXPIRATION */}
      {expiringDocs.length > 0 && (
        <div className="bg-[#FEF3E2] border border-[#8B4513] rounded-[8px] p-[14px] mb-[24px]">
          <div className="flex items-center gap-[8px] mb-[8px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-[13px] font-medium text-[#8B4513]">
              {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expir{expiringDocs.length > 1 ? 'ent' : 'e'} bientôt
            </span>
          </div>
          <div className="flex flex-col gap-[4px]">
            {expiringDocs.map(d => {
              const days = daysUntil(d.validityDate);
              return (
                <div key={d.id} className="flex justify-between text-[12px] text-[#8B4513]">
                  <span>{d.name}</span>
                  <span className="font-medium">
                    {days !== null && days <= 0 ? 'Expiré' : `Dans ${days} jour${days! > 1 ? 's' : ''}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[20px]">

        {/* COLONNE GAUCHE — Catégories */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
            <div className="p-[14px_16px] border-b border-[#E8E7E4]">
              <span className="text-[13px] font-medium text-[#1A1A19]">Catégories</span>
            </div>
            <div className="py-[8px]">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full flex items-center justify-between px-[16px] py-[8px] text-[13px] transition-colors ${
                  !activeCategory ? 'bg-[#F7F7F6] text-[#1A1A19] font-medium' : 'text-[#6B6A67] hover:bg-[#F7F7F6]'
                }`}
              >
                <span>Tous les documents</span>
                <span className="text-[11px] text-[#6B6A67]">{docs.length}</span>
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-[16px] py-[8px] text-[13px] transition-colors ${
                    activeCategory === cat.id ? 'bg-[#F7F7F6] text-[#1A1A19] font-medium' : 'text-[#6B6A67] hover:bg-[#F7F7F6]'
                  }`}
                >
                  <span className="flex items-center gap-[8px]">
                    <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="text-[11px] text-[#6B6A67]">{countByCategory(cat.id)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section upload */}
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px] mt-[12px]">
            <p className="text-[13px] font-medium text-[#1A1A19] mb-[12px]">Ajouter un document</p>
            <div className="mb-[10px]">
              <label className="block text-[11px] font-medium text-[#1A1A19] mb-[4px]">Catégorie *</label>
              <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
                className="w-full p-[8px_10px] border border-[#E8E7E4] rounded-[6px] text-[12px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]">
                <option value="">Sélectionner…</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="mb-[10px]">
              <label className="block text-[11px] font-medium text-[#1A1A19] mb-[4px]">Date d&apos;expiration</label>
              <input type="date" value={uploadValidity} onChange={e => setUploadValidity(e.target.value)}
                className="w-full p-[8px_10px] border border-[#E8E7E4] rounded-[6px] text-[12px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={!uploadCategory}
              className="w-full bg-[#1A3A5C] text-[#FFFFFF] py-[8px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Choisir un fichier
            </button>
            <input type="file" ref={fileInputRef} className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={e => { if (e.target.files?.[0]) processUpload(e.target.files[0]); }} />
          </div>
        </div>

        {/* COLONNE DROITE — Documents */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[10px_14px] text-[13px] text-[#9B2335]">{error}</div>
          )}

          {/* Zone drag & drop */}
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[10px] p-[32px] text-center transition-colors mb-[20px] ${
              isDragging ? 'border-[#1A3A5C] bg-[rgba(26,58,92,0.03)]' : 'border-[#E8E7E4] bg-[#FFFFFF]'
            }`}
          >
            <svg className="mx-auto mb-[10px]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.2" strokeLinecap="round">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
            <p className="text-[13px] text-[#6B6A67]">Déposez un fichier ici <span className="text-[#6B6A67]">(catégorie et expiration à gauche)</span></p>
            <p className="text-[11px] text-[#6B6A67] mt-[4px]">PDF, Word, Excel, images — max 50 Mo</p>
            {uploading && (
              <div className="mt-[14px] max-w-[260px] mx-auto">
                <div className="w-full h-[3px] bg-[#E8E7E4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A3A5C] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-[11px] text-[#6B6A67] mt-[4px]">Upload en cours… {progress}%</p>
              </div>
            )}
          </div>

          {/* Liste des documents */}
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
            {loading ? (
              <div className="p-[40px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-[40px] text-center text-[13px] text-[#6B6A67]">
                Aucun document{activeCategory ? ` dans "${CAT_LABELS[activeCategory]}"` : ''}.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
                  <tr>
                    <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Fichier</th>
                    <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Catégorie</th>
                    <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Taille</th>
                    <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67]">Expiration</th>
                    <th className="py-[12px] px-[16px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => {
                    const days      = daysUntil(doc.validityDate);
                    const isExpired = days !== null && days <= 0;
                    const isWarning = days !== null && days > 0 && days <= 30;
                    return (
                      <tr key={doc.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                        <td className="py-[12px] px-[16px]">
                          <div className="flex items-center gap-[8px]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getFileIcon(doc.fileType)} strokeWidth="1.5" strokeLinecap="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <span className="text-[13px] text-[#1A1A19] font-medium truncate max-w-[180px]">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-[12px] px-[16px]">
                          <span className="inline-block border border-[#E8E7E4] text-[#6B6A67] py-[2px] px-[8px] rounded-[4px] text-[11px]">
                            {CAT_LABELS[doc.category || ''] || doc.category || '—'}
                          </span>
                        </td>
                        <td className="py-[12px] px-[16px] text-[12px] text-[#6B6A67]">{doc.size}</td>
                        <td className="py-[12px] px-[16px]">
                          {doc.validityDate ? (
                            <span className={`text-[12px] font-medium ${isExpired ? 'text-[#9B2335]' : isWarning ? 'text-[#8B4513]' : 'text-[#6B6A67]'}`}>
                              {isExpired ? '⚠ Expiré' : isWarning ? `⚠ ${days}j` : formatDate(doc.validityDate)}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#6B6A67]">—</span>
                          )}
                        </td>
                        <td className="py-[12px] px-[16px] text-right">
                          <div className="flex gap-[12px] justify-end">
                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#1A3A5C] hover:underline">Voir</a>
                            <button onClick={() => { setShareDocId(doc.id); setSelectedPartners([]); }}
                              className="text-[12px] text-[#6B6A67] hover:text-[#1A1A19] hover:underline">Partager</button>
                            <button onClick={() => handleDelete(doc.id, doc.name)} disabled={isPending}
                              className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50">Supprimer</button>
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
      </div>

      {/* MODAL PARTAGE */}
      {shareDocId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-[24px]">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E8E7E4] w-full max-w-[440px] p-[28px]">
            <h3 className="text-[15px] font-medium text-[#1A1A19] mb-[6px]">Partager avec un partenaire</h3>
            <p className="text-[12px] text-[#6B6A67] mb-[20px]">Sélectionnez les partenaires qui recevront ce document.</p>
            <div className="flex flex-col gap-[8px] max-h-[240px] overflow-y-auto mb-[20px]">
              {partners.length === 0 ? (
                <p className="text-[13px] text-[#6B6A67]">Aucun partenaire disponible.</p>
              ) : partners.map(p => (
                <label key={p.id} className="flex items-center gap-[10px] cursor-pointer p-[8px] rounded-[6px] hover:bg-[#F7F7F6]">
                  <input type="checkbox" className="w-[15px] h-[15px] accent-[#1A3A5C]"
                    checked={selectedPartners.includes(p.id)}
                    onChange={e => setSelectedPartners(prev =>
                      e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                    )} />
                  <span className="text-[13px] text-[#1A1A19]">{p.orgName}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-[10px] justify-end">
              <button onClick={() => setShareDocId(null)}
                className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[14px] rounded-[6px] text-[13px] hover:bg-[#F7F7F6]">
                Annuler
              </button>
              <button onClick={handleShare} disabled={!selectedPartners.length || isPending}
                className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-50">
                {isPending ? 'Partage…' : `Partager (${selectedPartners.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
