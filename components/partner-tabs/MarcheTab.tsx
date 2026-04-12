'use client';

import { useState, useTransition } from 'react';
import {
  upsertMarcheNote,
  updateExecutionLevel,
  createContentieux,
  updateContentieux,
  deleteContentieux,
} from '@/lib/actions/marche';

interface Market { id: string; name: string; phase: string; nextStep?: string | null; executionRate: number; nextReviewDate?: string | null; closingDate?: string | null; updatedAt: string; }
interface MarketNote { id: string; category: string; notes: string; participants?: string | null; date: string; }
interface Contentieux { id: string; subject: string; description?: string | null; openDate: string; status: string; }

interface Props {
  partnerId: string;
  initialMarkets?: Market[];
  initialNotes?: MarketNote[];
  initialContentieux?: Contentieux[];
}

export default function MarcheTab({ partnerId, initialMarkets = [], initialNotes = [], initialContentieux = [] }: Props) {
  const [subTab, setSubTab] = useState("Niveau d'exécution");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const market = initialMarkets[0] ?? null;
  const [marketNotes, setMarketNotes] = useState<MarketNote[]>(initialNotes);
  const [contentieuxList, setContentieuxList] = useState<Contentieux[]>(initialContentieux);

  const [execRate, setExecRate] = useState(market?.executionRate ?? 0);
  const [phase, setPhase] = useState(market?.phase ?? '');
  const [nextStep, setNextStep] = useState(market?.nextStep ?? '');
  const [closingDate, setClosingDate] = useState(market?.closingDate ? new Date(market.closingDate).toISOString().split('T')[0] : '');

  const tabs = ["Audit", "Comptes rendus", "Contentieux", "Niveau d'exécution", "Autres"];
  const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]";
  const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

  const showFeedback = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); }
  };

  const refreshNotes = async () => {
    const res = await fetch(`/api/marche?partnerId=${partnerId}`);
    const data = await res.json();
    if (data.notes) setMarketNotes(data.notes);
    if (data.contentieux) setContentieuxList(data.contentieux);
  };

  const handleUpdateExecution = () => {
    startTransition(async () => {
      const res = await updateExecutionLevel(partnerId, execRate, phase, nextStep, closingDate);
      if (res.success) showFeedback("Niveau d'exécution mis à jour.");
      else showFeedback(res.error || 'Erreur.', true);
    });
  };

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>, category: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await upsertMarcheNote(partnerId, category, fd.get('notes') as string, {
        date: fd.get('date') as string,
        participants: fd.get('participants') as string,
      });
      if (res.success) { showFeedback('Note enregistrée.'); form.reset(); await refreshNotes(); }
      else showFeedback(res.error || 'Erreur.', true);
    });
  };

  const handleCreateContentieux = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await createContentieux(partnerId, {
        subject: fd.get('subject') as string,
        description: fd.get('description') as string,
        openDate: fd.get('openDate') as string,
        status: fd.get('status') as string,
      });
      if (res.success) { showFeedback('Contentieux enregistré.'); form.reset(); await refreshNotes(); }
      else showFeedback(res.error || 'Erreur.', true);
    });
  };

  const handleUpdateContentieux = (id: string, status: string) => {
    startTransition(async () => {
      await updateContentieux(id, status);
      setContentieuxList(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    });
  };

  const handleDeleteContentieux = (id: string) => {
    if (!confirm('Supprimer ce contentieux ?')) return;
    startTransition(async () => {
      await deleteContentieux(id, partnerId);
      setContentieuxList(prev => prev.filter(c => c.id !== id));
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const filteredNotes = (cat: string) => marketNotes.filter(n => n.category === cat);

  const statusColors: Record<string, string> = {
    EN_COURS: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]',
    RESOLU: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]',
    ABANDONNE: 'border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6]',
  };
  const statusLabel: Record<string, string> = { EN_COURS: 'En cours', RESOLU: 'Résolu', ABANDONNE: 'Abandonné' };

  return (
    <div>
      {success && <div className="mb-[16px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[10px_14px] text-[13px] text-[#2D6A4F]">{success}</div>}
      {error && <div className="mb-[16px] bg-[#FCEBEB] border border-[#9B2335] rounded-[6px] p-[10px_14px] text-[13px] text-[#9B2335]">{error}</div>}

      {/* SOUS-ONGLETS */}
      <div className="flex gap-0 border-b border-[#E8E7E4] mb-[24px] overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`py-[8px] px-[16px] text-[12px] transition-colors border-b-2 whitespace-nowrap ${subTab === t ? 'text-[#1A1A19] font-medium border-[#1A3A5C]' : 'text-[#6B6A67] border-transparent hover:text-[#1A1A19]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* NIVEAU D'EXÉCUTION */}
      {subTab === "Niveau d'exécution" && (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
          <div className="mb-[32px]">
            <div className="flex justify-between items-end mb-[8px]">
              <span className="text-[14px] font-medium text-[#1A1A19]">Taux d&apos;exécution global</span>
              <span className="text-[18px] font-medium text-[#1A3A5C]">{execRate}%</span>
            </div>
            <input type="range" min="0" max="100" value={execRate} onChange={e => setExecRate(parseInt(e.target.value))} className="w-full accent-[#1A3A5C]" />
            <div className="h-[8px] bg-[#E8E7E4] rounded-full overflow-hidden mt-[8px]">
              <div className="h-full bg-[#1A3A5C] transition-all" style={{ width: `${execRate}%` }}></div>
            </div>
            {market?.updatedAt && <div className="text-[12px] text-[#6B6A67] mt-[8px]">Dernière mise à jour : {formatDate(market.updatedAt)}</div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[24px]">
            <div>
              <label className={labelClass}>Phase actuelle</label>
              <input type="text" value={phase} onChange={e => setPhase(e.target.value)} className={inputClass} placeholder="Ex: Phase 2 - Gros œuvre" />
            </div>
            <div>
              <label className={labelClass}>Prochaine étape</label>
              <input type="text" value={nextStep} onChange={e => setNextStep(e.target.value)} className={inputClass} placeholder="Ex: Validation électrique" />
            </div>
            <div>
              <label className={labelClass}>Date prévisionnelle de clôture</label>
              <input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <button onClick={handleUpdateExecution} disabled={isPending}
            className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
            {isPending ? 'Mise à jour…' : 'Mettre à jour'}
          </button>
        </div>
      )}

      {/* CONTENTIEUX */}
      {subTab === 'Contentieux' && (
        <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
          <h3 className="text-[15px] font-medium text-[#1A1A19] mb-[20px]">Enregistrer un contentieux</h3>
          <form onSubmit={handleCreateContentieux} className="flex flex-col gap-[16px] mb-[32px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
              <div><label className={labelClass}>Objet *</label><input type="text" name="subject" required className={inputClass} /></div>
              <div><label className={labelClass}>Date d&apos;ouverture *</label><input type="date" name="openDate" required className={inputClass} /></div>
              <div>
                <label className={labelClass}>Statut</label>
                <select name="status" className={inputClass}>
                  <option value="EN_COURS">En cours</option>
                  <option value="RESOLU">Résolu</option>
                  <option value="ABANDONNE">Abandonné</option>
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Description</label><textarea name="description" rows={3} className={`${inputClass} resize-y`}></textarea></div>
            <button type="submit" disabled={isPending} className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] disabled:opacity-60 w-fit">
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
          <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[12px]">Contentieux enregistrés ({contentieuxList.length})</h3>
          {contentieuxList.length === 0 ? (
            <p className="text-[13px] text-[#6B6A67]">Aucun contentieux enregistré.</p>
          ) : (
            <table className="w-full text-left border-t border-[#E8E7E4]">
              <tbody>
                {contentieuxList.map(c => (
                  <tr key={c.id} className="border-b border-[#E8E7E4]">
                    <td className="py-[12px] text-[13px] text-[#1A1A19] pr-[12px]">{c.subject}</td>
                    <td className="py-[12px] text-[12px] text-[#6B6A67] pr-[12px]">{formatDate(c.openDate)}</td>
                    <td className="py-[12px] pr-[12px]"><span className={`inline-block border rounded-[4px] p-[2px_8px] text-[12px] ${statusColors[c.status]}`}>{statusLabel[c.status]}</span></td>
                    <td className="py-[12px] text-right">
                      <div className="flex gap-[8px] justify-end">
                        {c.status === 'EN_COURS' && <button onClick={() => handleUpdateContentieux(c.id, 'RESOLU')} className="text-[12px] text-[#2D6A4F] hover:underline">Résoudre</button>}
                        <button onClick={() => handleDeleteContentieux(c.id)} className="text-[12px] text-[#9B2335] hover:underline">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* AUDIT / CR / AUTRES */}
      {(subTab === 'Audit' || subTab === 'Comptes rendus' || subTab === 'Autres') && (() => {
        const cat = subTab === 'Audit' ? 'AUDIT' : subTab === 'Comptes rendus' ? 'COMPTE_RENDU' : 'AUTRE';
        const notes = filteredNotes(cat);
        return (
          <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px]">
            <h3 className="text-[15px] font-medium text-[#1A1A19] mb-[20px]">
              {subTab === 'Audit' ? "Observations d'audit" : subTab === 'Comptes rendus' ? 'Comptes rendus de réunion' : 'Documents et notes divers'}
            </h3>
            <form onSubmit={e => handleSaveNote(e, cat)} className="flex flex-col gap-[14px] mb-[28px]">
              {subTab === 'Comptes rendus' && (
                <div className="grid grid-cols-2 gap-[16px]">
                  <div><label className={labelClass}>Date de réunion</label><input type="date" name="date" className={inputClass} /></div>
                  <div><label className={labelClass}>Participants</label><input type="text" name="participants" className={inputClass} placeholder="Jean D., Marie L.…" /></div>
                </div>
              )}
              <div><label className={labelClass}>Notes / Observations *</label><textarea name="notes" rows={3} required className={`${inputClass} resize-y`}></textarea></div>
              <div className="flex justify-end">
                <button type="submit" disabled={isPending} className="bg-[#1A3A5C] text-[#FFFFFF] py-[6px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                  {isPending ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
              </div>
            </form>
            {notes.length > 0 && (
              <div>
                <h4 className="text-[13px] font-medium text-[#1A1A19] mb-[12px]">Historique ({notes.length})</h4>
                <div className="flex flex-col gap-[10px]">
                  {notes.map(note => (
                    <div key={note.id} className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[8px] p-[14px]">
                      <div className="flex justify-between mb-[6px]">
                        <span className="text-[12px] text-[#6B6A67]">{formatDate(note.date)}</span>
                        {note.participants && <span className="text-[12px] text-[#6B6A67]">Participants : {note.participants}</span>}
                      </div>
                      <p className="text-[13px] text-[#1A1A19] leading-[1.6]">{note.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
