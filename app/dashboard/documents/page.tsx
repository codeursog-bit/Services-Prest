'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CompanyDocumentsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'RC',   name: 'Registre de commerce',   count: 1,  icon: <path d="M4 22V4a2 2 0 012-2h12a2 2 0 012 2v18M10 22V12h4v10M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M8 18h.01M16 18h.01"/> },
    { id: 'FISC', name: 'Attestations fiscales',   count: 2,  icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 12 18 16 12"/></> },
    { id: 'QHSE', name: 'Certifications QHSE',     count: 4,  icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
    { id: 'PLAN', name: 'Plans de charge',          count: 0,  icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></> },
    { id: 'ASSUR',name: 'Assurances',               count: 3,  icon: <><path d="M22 12A10 10 0 0012 2v10z"/><path d="M12 12A10 10 0 002 12h20z"/><path d="M12 12v8a2 2 0 004 0"/></> },
    { id: 'CONT', name: 'Contrats cadres',           count: 5,  icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></> },
    { id: 'RAPP', name: "Rapports d'activité",      count: 12, icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
    { id: 'AUTR', name: 'Autres documents',          count: 8,  icon: <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/> },
  ];

  const documents = [
    { id: 1, name: 'Attestation_Fiscale_2026.pdf', category: 'Attestations fiscales', size: '1.2 Mo', date: '10 Jan 2026', validity: '31 Déc 2026', status: 'valid' },
    { id: 2, name: 'Assurance_RC_Pro.pdf',          category: 'Assurances',            size: '2.4 Mo', date: '05 Jan 2026', validity: '15 Fév 2026', status: 'warning' },
    { id: 3, name: 'Certification_ISO9001.pdf',     category: 'Certifications QHSE',   size: '3.1 Mo', date: '12 Déc 2024', validity: '12 Déc 2025', status: 'expired' },
  ];

  const partners = [
    { id: '1', name: 'Société Alpha SA' },
    { id: '2', name: 'Entreprise Beta' },
    { id: '3', name: 'Construction & Co' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    setSharingDoc(null);
  };

  const filteredDocs = activeCategory ? documents.filter(d => d.category === activeCategory) : documents;

  return (
    <DashboardLayout userInitials="ML" pageTitle="Documents de l'entreprise">

      <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>
        Espace centralisé pour les documents officiels de Melanie Services&amp;Prest.<br />
        Ces documents peuvent être partagés avec vos partenaires depuis leurs espaces respectifs.
      </p>

      {/* CATÉGORIES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {categories.map(cat => {
          const active = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(active ? null : cat.name)}
              className="flex flex-col items-start p-4 rounded-[10px] text-left transition-colors"
              style={{
                background: active ? 'var(--navy)' : 'var(--bg-card)',
                border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
              }}>
              <svg className="mb-3" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={active ? '#FFFFFF' : 'var(--navy-mid)'}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {cat.icon}
              </svg>
              <span className="text-[13px] font-medium" style={{ color: active ? '#FFFFFF' : 'var(--text-primary)' }}>
                {cat.name}
              </span>
              <span className="text-[12px] mt-1" style={{ color: active ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                {cat.count} document{cat.count !== 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* ZONE UPLOAD */}
      <div className="rounded-[10px] p-5 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
          <div className="w-full md:w-[280px]">
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Catégorie *</label>
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value)}
              className="dash-input">
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
            className="flex-1 w-full border-2 border-dashed rounded-[10px] p-5 text-center transition-colors"
            style={{
              borderColor: isDragging ? 'var(--navy-mid)' : 'var(--border)',
              background: isDragging ? 'var(--gold-light)' : 'var(--bg-surface)',
            }}>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Déposez vos fichiers ici ou{' '}
              <button onClick={() => fileInputRef.current?.click()} className="font-medium hover:underline" style={{ color: 'var(--navy-mid)' }}>
                parcourez
              </button>
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>PDF, Word, Excel — max 50 Mo</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
          </div>
        </div>
      </div>

      {/* LISTE DOCUMENTS */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: 520 }}>
            <thead style={{ background: 'var(--bg-dash)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Fichier', 'Catégorie', 'Validité', 'Partagé le', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-[11px] font-medium ${i === 4 ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 1 ? 'var(--bg-dash)' : 'var(--bg-card)' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--navy-mid)" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/>
                      </svg>
                      <span className="text-[13px] font-medium truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-secondary)' }}>{doc.category}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{doc.validity}</span>
                      {doc.status === 'expired' && <span className="status-solde">Expiré</span>}
                      {doc.status === 'warning' && <span className="status-cours">&lt; 30j</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>{doc.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSharingDoc(doc.id)}
                      className="py-1.5 px-3 rounded-[6px] text-[12px] transition-colors"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      Partager
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARTAGE */}
      {sharingDoc !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-[12px] w-full max-w-[440px] p-7 shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-[16px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Partager le document</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-muted)' }}>Sélectionnez les partenaires destinataires.</p>
            <form onSubmit={handleShare}>
              <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto mb-5 p-3 rounded-[6px]" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                {partners.map(p => (
                  <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" style={{ accentColor: 'var(--navy-mid)' }} />
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setSharingDoc(null)}
                  className="py-2 px-4 rounded-[6px] text-[13px] font-medium"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  Annuler
                </button>
                <button type="submit"
                  className="py-2 px-4 rounded-[6px] text-[13px] font-medium"
                  style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
                  Partager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}