'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils';

interface Version {
  id:          string;
  versionName: string;
  fileUrl:     string;
  createdAt:   string;
  author:      { name: string };
}

export default function ContratPage() {
  const [versions, setVersions]   = useState<Version[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [versionName, setVersionName] = useState('');
  const [isPending, startT]       = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch('/api/contrat')
      .then(r => r.json())
      .then(d => { setVersions(d.versions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const fb = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); }
    else    { setError(msg);   setTimeout(() => setError(''), 5000); }
  };

  const handleUpload = async (file: File) => {
    if (!versionName.trim()) { fb('Saisissez un nom de version avant d\'uploader.', false); return; }
    if (!file.type.includes('pdf')) { fb('Seuls les fichiers PDF sont acceptés.', false); return; }
    if (file.size > 20 * 1024 * 1024) { fb('Fichier trop volumineux (max 20 Mo).', false); return; }

    setError(''); setUploading(true); setProgress(20);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('versionName', versionName.trim());

    setProgress(60);
    const res  = await fetch('/api/contrat', { method: 'POST', body: fd });
    const data = await res.json();
    setProgress(100);

    if (!data.success) fb(data.error || "Erreur lors de l'upload.", false);
    else {
      fb(`Version "${versionName.trim()}" ajoutée avec succès.`);
      setVersionName('');
      load();
    }

    setTimeout(() => { setUploading(false); setProgress(0); }, 600);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer la version "${name}" ? Le fichier PDF sera définitivement supprimé.`)) return;
    startT(async () => {
      const res  = await fetch(`/api/contrat/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fb('Version supprimée.');
        setVersions(prev => prev.filter(v => v.id !== id));
      } else {
        fb(data.error || 'Erreur.', false);
      }
    });
  };

  const latestVersion = versions[0];

  return (
    <DashboardLayout pageTitle="Contrat MSP">

      {/* FEEDBACK */}
      {success && (
        <div className="mb-[20px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[12px_16px] text-[13px] text-[#2D6A4F]">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-[20px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[12px_16px] text-[13px] text-[#9B2335]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">

        {/* COLONNE GAUCHE — Upload nouvelle version */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
            <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[6px]">Ajouter une version</h2>
            <p className="text-[12px] text-[#6B6A67] mb-[20px]">
              Uploadez la dernière version du contrat au format PDF. L&apos;historique des versions précédentes est conservé.
            </p>

            <div className="mb-[14px]">
              <label className="block text-[12px] font-medium text-[#1A1A19] mb-[6px]">
                Nom de la version *
              </label>
              <input
                type="text"
                value={versionName}
                onChange={e => setVersionName(e.target.value)}
                placeholder="Ex: V3.0 — Janvier 2026"
                className="w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[13px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors"
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!versionName.trim() || uploading}
              className="w-full bg-[#1A3A5C] text-[#FFFFFF] py-[10px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? 'Upload en cours…' : 'Choisir un fichier PDF'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }}
            />

            {uploading && (
              <div className="mt-[12px]">
                <div className="w-full h-[4px] bg-[#E8E7E4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A3A5C] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#6B6A67] mt-[4px]">Upload en cours… {progress}%</p>
              </div>
            )}
          </div>

          {/* Version courante */}
          {latestVersion && (
            <div className="bg-[#EAF3DE] border border-[#2D6A4F] rounded-[10px] p-[20px] mt-[12px]">
              <div className="flex items-center gap-[8px] mb-[10px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="text-[12px] font-medium text-[#2D6A4F]">Version actuelle</span>
              </div>
              <p className="text-[14px] font-medium text-[#1A1A19]">{latestVersion.versionName}</p>
              <p className="text-[12px] text-[#6B6A67] mt-[4px]">
                Ajoutée le {formatDate(latestVersion.createdAt)}<br />
                Par {latestVersion.author.name}
              </p>
              <a
                href={latestVersion.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-[6px] mt-[12px] text-[13px] font-medium text-[#2D6A4F] hover:underline"
              >
                Consulter le PDF
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* COLONNE DROITE — Historique versions */}
        <div className="lg:col-span-2">
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between p-[16px_20px] border-b border-[#E8E7E4]">
              <h2 className="text-[14px] font-medium text-[#1A1A19]">Historique des versions</h2>
              <span className="text-[12px] text-[#6B6A67]">{versions.length} version{versions.length > 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="p-[40px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
            ) : versions.length === 0 ? (
              <div className="p-[40px] text-center">
                <svg className="mx-auto mb-[12px]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8E7E4" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p className="text-[13px] text-[#6B6A67]">Aucune version uploadée.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E7E4]">
                {versions.map((v, idx) => (
                  <div key={v.id} className="flex items-center justify-between p-[16px_20px] hover:bg-[#F7F7F6] transition-colors">
                    <div className="flex items-center gap-[14px]">
                      {/* Indicateur version courante */}
                      <div className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${
                        idx === 0 ? 'bg-[#2D6A4F]' : 'bg-[#E8E7E4]'
                      }`} />
                      <div>
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[13px] font-medium text-[#1A1A19]">{v.versionName}</span>
                          {idx === 0 && (
                            <span className="inline-block border border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE] rounded-[4px] py-[1px] px-[6px] text-[10px]">
                              Actuelle
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[#6B6A67] mt-[2px]">
                          {formatDate(v.createdAt)} · Par {v.author.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-[14px]">
                      <a
                        href={v.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-[#1A3A5C] hover:underline flex items-center gap-[4px]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Consulter
                      </a>
                      <button
                        onClick={() => handleDelete(v.id, v.versionName)}
                        disabled={isPending}
                        className="text-[12px] text-[#9B2335] hover:underline disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note confidentialité */}
          <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[14px_16px] mt-[12px]">
            <div className="flex items-start gap-[8px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6A67" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0 mt-[1px]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p className="text-[12px] text-[#6B6A67] leading-[1.6]">
                Les versions du contrat sont accessibles uniquement aux administrateurs de MSP.
                Elles ne sont pas visibles dans les espaces partenaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
