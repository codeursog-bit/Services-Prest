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
    { id: 'RC', name: 'Registre de commerce', count: 1, icon: <path d="M4 22V4a2 2 0 012-2h12a2 2 0 012 2v18M10 22V12h4v10M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M8 18h.01M16 18h.01"/> },
    { id: 'FISC', name: 'Attestations fiscales', count: 2, icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 12 18 16 12"/></> },
    { id: 'QHSE', name: 'Certifications QHSE', count: 4, icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
    { id: 'PLAN', name: 'Plans de charge', count: 0, icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></> },
    { id: 'ASSUR', name: 'Assurances', count: 3, icon: <><path d="M22 12A10 10 0 0012 2v10z"/><path d="M12 12A10 10 0 002 12h20z"/><path d="M12 12v8a2 2 0 004 0"/></> },
    { id: 'CONT', name: 'Contrats cadres', count: 5, icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></> },
    { id: 'RAPP', name: "Rapports d'activité", count: 12, icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
    { id: 'AUTR', name: 'Autres documents', count: 8, icon: <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/> }
  ];

  const documents = [
    { id: 1, name: 'Attestation_Fiscale_2026.pdf', category: 'Attestations fiscales', type: 'PDF', size: '1.2 Mo', date: '10 Jan 2026', validity: '31 Déc 2026', status: 'valid' },
    { id: 2, name: 'Assurance_RC_Pro.pdf', category: 'Assurances', type: 'PDF', size: '2.4 Mo', date: '05 Jan 2026', validity: '15 Fév 2026', status: 'warning' },
    { id: 3, name: 'Certification_ISO9001.pdf', category: 'Certifications QHSE', type: 'PDF', size: '3.1 Mo', date: '12 Déc 2024', validity: '12 Déc 2025', status: 'expired' },
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
    // Server action trigger mock
    setSharingDoc(null);
  };

  return (
    <DashboardLayout userInitials="ML" pageTitle="Documents de l'entreprise">
      
      {/* INTRO */}
      <p className="text-[13px] text-[#6B6A67] mb-[24px]">
        Espace centralisé pour les documents officiels de Melanie Services&Prest.<br/>
        Ces documents peuvent être partagés avec vos partenaires depuis leurs espaces respectifs.
      </p>

      {/* CATÉGORIES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[32px]">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            className={`flex flex-col items-start p-[20px] rounded-[10px] border transition-colors text-left ${
              activeCategory === cat.name 
                ? 'bg-[#1A3A5C] border-[#1A3A5C]' 
                : 'bg-[#FFFFFF] border-[#E8E7E4] hover:border-[#1A3A5C]'
            }`}
          >
            <svg className="mb-[12px]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeCategory === cat.name ? '#FFFFFF' : '#1A3A5C'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {cat.icon}
            </svg>
            <span className={`text-[13px] font-medium ${activeCategory === cat.name ? 'text-[#FFFFFF]' : '#1A1A19'}`}>
              {cat.name}
            </span>
            <span className={`text-[12px] mt-[4px] ${activeCategory === cat.name ? 'text-[#FFFFFF] opacity-70' : 'text-[#6B6A67]'}`}>
              {cat.count} document{cat.count !== 1 ? 's' : ''}
            </span>
          </button>
        ))}
      </div>

      {/* ZONE UPLOAD */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px] mb-[24px]">
        <div className="flex flex-col md:flex-row gap-[24px] items-start md:items-center">
          <div className="w-full md:w-[300px]">
            <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">Catégorie du document *</label>
            <select 
              value={uploadCategory} 
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
            className={`flex-1 w-full border-2 border-dashed rounded-[10px] p-[24px] text-center transition-colors ${
              isDragging ? 'border-[#1A3A5C] bg-[rgba(26,58,92,0.03)]' : 'border-[#E8E7E4] bg-[#F7F7F6]'
            }`}
          >
            <p className="text-[13px] text-[#6B6A67]">
              Déposez vos fichiers ici ou <button onClick={() => fileInputRef.current?.click()} className="text-[#1A3A5C] font-medium hover:underline">parcourez</button>
            </p>
            <p className="text-[12px] text-[#6B6A67] mt-[4px]">PDF, Word, Excel — max 50 Mo</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
          </div>
        </div>
      </div>

      {/* LISTE DOCUMENTS */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F6] border-b border-[#E8E7E4]">
              <tr>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Fichier</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Catégorie</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Validité</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67]">Partagé le</th>
                <th className="py-[12px] px-[20px] text-[12px] font-medium text-[#6B6A67] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.filter(d => !activeCategory || d.category === activeCategory).map(doc => (
                <tr key={doc.id} className="border-b border-[#E8E7E4] hover:bg-[#F7F7F6]">
                  <td className="py-[14px] px-[20px] flex items-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A3A5C" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/>
                    </svg>
                    <span className="text-[13px] text-[#1A1A19] font-medium ml-[8px] truncate max-w-[200px]">{doc.name}</span>
                  </td>
                  <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{doc.category}</td>
                  <td className="py-[14px] px-[20px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[12px] text-[#1A1A19]">{doc.validity}</span>
                      {doc.status === 'expired' && <span className="border border-[#9B2335] text-[#9B2335] bg-[#FCEBEB] text-[12px] px-[6px] py-[2px] rounded-[4px]">Expiré</span>}
                      {doc.status === 'warning' && <span className="border border-[#8B4513] text-[#8B4513] bg-[#FEF3E2] text-[12px] px-[6px] py-[2px] rounded-[4px]">&lt; 30j</span>}
                    </div>
                  </td>
                  <td className="py-[14px] px-[20px] text-[12px] text-[#6B6A67]">{doc.date}</td>
                  <td className="py-[14px] px-[20px] text-right">
                    <button 
                      onClick={() => setSharingDoc(doc.id)}
                      className="border border-[#E8E7E4] bg-[#FFFFFF] py-[6px] px-[12px] rounded-[6px] text-[12px] text-[#1A1A19] hover:border-[#1A3A5C] transition-colors"
                    >
                      Partager avec un partenaire
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE PARTAGE */}
      {sharingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A19] bg-opacity-20 backdrop-blur-none">
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] w-full max-w-[480px] p-[28px] shadow-sm">
            <h2 className="text-[18px] font-medium text-[#1A1A19] mb-[16px]">Partager le document</h2>
            <p className="text-[13px] text-[#6B6A67] mb-[24px]">Sélectionnez les partenaires avec lesquels vous souhaitez partager ce document.</p>
            
            <form onSubmit={handleShare}>
              <div className="flex flex-col gap-[12px] max-h-[200px] overflow-y-auto mb-[24px] border border-[#E8E7E4] p-[12px] rounded-[6px]">
                {partners.map(p => (
                  <label key={p.id} className="flex items-center gap-[12px] cursor-pointer">
                    <input type="checkbox" className="w-[16px] h-[16px] accent-[#1A3A5C]" />
                    <span className="text-[13px] text-[#1A1A19]">{p.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-[12px]">
                <button type="button" onClick={() => setSharingDoc(null)} className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6]">Annuler</button>
                <button type="submit" className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a]">Partager</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}