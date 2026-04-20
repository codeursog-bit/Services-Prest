'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate, formatDateShort, daysUntil, STEP_STATUS_LABELS, STATUS_COLORS, CONTENTIEUX_STATUS_LABELS } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step {
  id: string; title: string; description: string | null;
  startDate: string; endDate: string; status: string;
  order: number; incidents: string | null;
  alertStartSent: boolean; alertEndSent: boolean;
}
interface Note  { id: string; category: string; title: string | null; notes: string; date: string; participants: string | null; }
interface Cont  { id: string; subject: string; description: string | null; openDate: string; status: string; resolution: string | null; }
interface Market {
  id: string; name: string; description: string | null;
  status: string; executionRate: number;
  startDate: string | null; endDate: string | null;
  closingDate: string | null; nextReviewDate: string | null;
  partner: { id: string; orgName: string; type: string; token: string };
  steps: Step[]; notes: Note[]; contentieux: Cont[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  EN_COURS:    { label: 'En cours',    cls: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]' },
  SUSPENDU:    { label: 'Suspendu',    cls: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]' },
  CLOTURE:     { label: 'Clôturé',     cls: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]' },
  CONTENTIEUX: { label: 'Contentieux', cls: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]' },
};
const STEP_CFG: Record<string, { label: string; cls: string; bar: string }> = {
  A_VENIR:  { label: 'À venir',    cls: 'border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6]', bar: 'bg-[#E8E7E4]' },
  EN_COURS: { label: 'En cours',   cls: 'border-[#8B4513] text-[#8B4513] bg-[#FEF3E2]', bar: 'bg-[#8B4513]' },
  TERMINE:  { label: 'Terminé',    cls: 'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]', bar: 'bg-[#2D6A4F]' },
  RETARD:   { label: 'En retard',  cls: 'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]', bar: 'bg-[#9B2335]' },
  ANNULE:   { label: 'Annulé',     cls: 'border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6]', bar: 'bg-[#E8E7E4]' },
};
const CONT_CFG: Record<string, string> = {
  EN_COURS:  'border-[#9B2335] text-[#9B2335] bg-[#FCEBEB]',
  RESOLU:    'border-[#2D6A4F] text-[#2D6A4F] bg-[#EAF3DE]',
  ABANDONNE: 'border-[#E8E7E4] text-[#6B6A67] bg-[#F7F7F6]',
};
const TABS = ['Planning', 'Audits', 'Comptes-rendus', 'Contentieux', 'Autres'];
const ic = "w-full p-[9px_12px] border border-[#E8E7E4] rounded-[6px] text-[13px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] transition-colors";
const lc = "block text-[11px] font-medium text-[#1A1A19] mb-[4px]";

export default function MarcheDetailPage({ params }: { params: { id: string } }) {
  const [market, setMarket]     = useState<Market | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('Planning');
  const [isPending, startT]     = useTransition();
  const [feedback, setFeedback] = useState({ msg: '', ok: true });

  // Step form
  const [showStepForm, setShowStepForm]   = useState(false);
  const [editStep, setEditStep]           = useState<Step | null>(null);
  const [stepIncident, setStepIncident]   = useState<{ id: string; text: string } | null>(null);

  // Note form
  const [showNoteForm, setShowNoteForm]   = useState(false);

  // Contentieux form
  const [showContForm, setShowContForm]   = useState(false);

  const fb = (msg: string, ok = true) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback({ msg: '', ok: true }), 4000);
  };

  const reload = () => {
    fetch(`/api/marche/${params.id}`)
      .then(r => r.json())
      .then(d => { if (d.market) setMarket(d.market); });
  };

  useEffect(() => {
    fetch(`/api/marche/${params.id}`)
      .then(r => r.json())
      .then(d => { setMarket(d.market || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  // ── STEPS ──────────────────────────────────────────────────────────────────
  const handleStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd    = new FormData(e.currentTarget);
    const body  = {
      title:       fd.get('title')       as string,
      description: fd.get('description') as string,
      startDate:   fd.get('startDate')   as string,
      endDate:     fd.get('endDate')     as string,
      status:      fd.get('status')      as string,
    };

    startT(async () => {
      if (editStep) {
        const res  = await fetch(`/api/marche/${params.id}/steps/${editStep.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.success) { fb(data.error || 'Erreur.', false); return; }
        fb('Étape modifiée.'); setEditStep(null);
      } else {
        const res  = await fetch(`/api/marche/${params.id}/steps`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.success) { fb(data.error || 'Erreur.', false); return; }
        fb('Étape ajoutée.'); setShowStepForm(false);
      }
      reload();
    });
  };

  const handleStepStatus = (stepId: string, status: string) => {
    startT(async () => {
      await fetch(`/api/marche/${params.id}/steps/${stepId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      reload();
    });
  };

  const handleStepDelete = (stepId: string) => {
    if (!confirm('Supprimer cette étape ?')) return;
    startT(async () => {
      await fetch(`/api/marche/${params.id}/steps/${stepId}`, { method: 'DELETE' });
      fb('Étape supprimée.'); reload();
    });
  };

  const handleSaveIncident = () => {
    if (!stepIncident) return;
    startT(async () => {
      await fetch(`/api/marche/${params.id}/steps/${stepIncident.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidents: stepIncident.text }),
      });
      fb('Aléas enregistrés.'); setStepIncident(null); reload();
    });
  };

  // ── NOTES ─────────────────────────────────────────────────────────────────
  const handleNoteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const catMap: Record<string, string> = { 'Audits': 'AUDIT', 'Comptes-rendus': 'COMPTE_RENDU', 'Autres': 'AUTRE' };
    const body = {
      category:     catMap[tab] || 'AUTRE',
      title:        fd.get('title')        as string,
      notes:        fd.get('notes')        as string,
      date:         fd.get('date')         as string,
      participants: fd.get('participants') as string,
    };

    startT(async () => {
      const res  = await fetch(`/api/marche/${params.id}/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { fb(data.error || 'Erreur.', false); return; }
      fb('Note enregistrée.'); setShowNoteForm(false);
      (e.target as HTMLFormElement).reset(); reload();
    });
  };

  const handleNoteDelete = (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return;
    startT(async () => {
      await fetch(`/api/marche/${params.id}/notes/${noteId}`, { method: 'DELETE' });
      fb('Note supprimée.'); reload();
    });
  };

  // ── CONTENTIEUX ────────────────────────────────────────────────────────────
  const handleContSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const body = {
      subject:     fd.get('subject')     as string,
      description: fd.get('description') as string,
      openDate:    fd.get('openDate')    as string,
      status:      fd.get('status')      as string,
    };

    startT(async () => {
      const res  = await fetch(`/api/marche/${params.id}/contentieux`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { fb(data.error || 'Erreur.', false); return; }
      fb('Contentieux enregistré.'); setShowContForm(false);
      (e.target as HTMLFormElement).reset(); reload();
    });
  };

  const handleContStatus = (cId: string, status: string, resolution?: string) => {
    startT(async () => {
      await fetch(`/api/marche/${params.id}/contentieux/${cId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution: resolution || null }),
      });
      fb('Contentieux mis à jour.'); reload();
    });
  };

  const handleContDelete = (cId: string) => {
    if (!confirm('Supprimer ce contentieux ?')) return;
    startT(async () => {
      await fetch(`/api/marche/${params.id}/contentieux/${cId}`, { method: 'DELETE' });
      fb('Contentieux supprimé.'); reload();
    });
  };

  // ── Filtres notes ──────────────────────────────────────────────────────────
  const catMap: Record<string, string> = { 'Audits': 'AUDIT', 'Comptes-rendus': 'COMPTE_RENDU', 'Autres': 'AUTRE' };
  const filteredNotes = (market?.notes || []).filter(n => n.category === catMap[tab]);

  // ── Loading / 404 ──────────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout pageTitle="Chargement…">
      <div className="p-[48px] text-center text-[13px] text-[#6B6A67]">Chargement…</div>
    </DashboardLayout>
  );
  if (!market) return (
    <DashboardLayout pageTitle="Introuvable">
      <div className="p-[48px] text-center text-[13px] text-[#9B2335]">Marché introuvable.</div>
    </DashboardLayout>
  );

  const cfg = STATUS_CFG[market.status] || STATUS_CFG.EN_COURS;

  return (
    <DashboardLayout pageTitle={market.name}>

      {/* FEEDBACK */}
      {feedback.msg && (
        <div className={`mb-[16px] rounded-[6px] p-[10px_14px] text-[13px] border ${
          feedback.ok ? 'bg-[#EAF3DE] border-[#2D6A4F] text-[#2D6A4F]' : 'bg-[#FCEBEB] border-[#9B2335] text-[#9B2335]'
        }`}>{feedback.msg}</div>
      )}

      {/* HEADER */}
      <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[24px] mb-[20px]">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-[20px]">
          {/* GAUCHE */}
          <div>
            <div className="flex items-center gap-[10px] flex-wrap mb-[6px]">
              <h2 className="text-[18px] font-medium text-[#1A1A19]">{market.name}</h2>
              <span className={`inline-block border rounded-[4px] py-[2px] px-[8px] text-[12px] ${cfg.cls}`}>{cfg.label}</span>
            </div>
            <div className="flex items-center gap-[6px] text-[13px] text-[#6B6A67]">
              <span>Partenaire :</span>
              <Link href={`/dashboard/partners/${market.partner.id}`}
                className="text-[#1A3A5C] hover:underline font-medium">
                {market.partner.orgName}
              </Link>
            </div>
            {market.description && (
              <p className="text-[13px] text-[#6B6A67] mt-[6px] leading-[1.6]">{market.description}</p>
            )}
            <div className="flex flex-wrap gap-[16px] mt-[12px] text-[12px] text-[#6B6A67]">
              {market.startDate && <span>Début : <strong className="text-[#1A1A19]">{formatDateShort(market.startDate)}</strong></span>}
              {market.endDate   && <span>Fin prévisionnelle : <strong className="text-[#1A1A19]">{formatDateShort(market.endDate)}</strong></span>}
              {market.nextReviewDate && <span>Prochaine revue : <strong className="text-[#8B4513]">{formatDateShort(market.nextReviewDate)}</strong></span>}
            </div>
          </div>

          {/* DROITE — Taux + actions */}
          <div className="flex flex-col items-end gap-[12px]">
            <div className="text-right">
              <div className="text-[28px] font-medium text-[#1A3A5C]">{market.executionRate}%</div>
              <div className="text-[12px] text-[#6B6A67]">Taux d&apos;exécution</div>
              <div className="w-[120px] h-[6px] bg-[#E8E7E4] rounded-full overflow-hidden mt-[6px]">
                <div className="h-full bg-[#1A3A5C] transition-all" style={{ width: `${market.executionRate}%` }}></div>
              </div>
            </div>
            <div className="flex gap-[8px]">
              <Link href={`/dashboard/marche/${market.id}/edit`}
                className="border border-[#E8E7E4] bg-transparent text-[#1A1A19] py-[6px] px-[12px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6] transition-colors">
                Modifier
              </Link>
              <Link href="/dashboard/marche"
                className="border border-[#E8E7E4] bg-transparent text-[#1A1A19] py-[6px] px-[12px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6] transition-colors">
                ← Tous les marchés
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-0 border-b border-[#E8E7E4] mb-[24px] overflow-x-auto">
        {TABS.map(t => {
          const count = t === 'Contentieux' ? market.contentieux.length
            : t !== 'Planning' ? (market.notes || []).filter(n => n.category === catMap[t]).length
            : market.steps.length;
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`py-[10px] px-[16px] text-[13px] border-b-2 transition-colors whitespace-nowrap ${
                tab === t ? 'text-[#1A1A19] font-medium border-[#1A3A5C]' : 'text-[#6B6A67] border-transparent hover:text-[#1A1A19]'
              }`}>
              {t} {count > 0 && <span className="ml-[4px] text-[11px] text-[#6B6A67]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* ══════════ PLANNING ══════════ */}
      {tab === 'Planning' && (
        <div>
          <div className="flex justify-between items-center mb-[20px]">
            <p className="text-[13px] text-[#6B6A67]">
              Planning d&apos;exécution étape par étape — {market.steps.filter(s => s.status === 'TERMINE').length}/{market.steps.length} étapes terminées
            </p>
            <button onClick={() => { setShowStepForm(true); setEditStep(null); }}
              className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] transition-colors">
              + Ajouter une étape
            </button>
          </div>

          {/* FORMULAIRE ÉTAPE */}
          {(showStepForm || editStep) && (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px] mb-[20px]">
              <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[16px]">
                {editStep ? 'Modifier l\'étape' : 'Nouvelle étape'}
              </h3>
              <form onSubmit={handleStepSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[14px]">
                  <div className="md:col-span-2">
                    <label className={lc}>Titre de l&apos;étape *</label>
                    <input type="text" name="title" required defaultValue={editStep?.title || ''}
                      placeholder="Ex: Installation des équipements" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Date de début *</label>
                    <input type="date" name="startDate" required
                      defaultValue={editStep ? new Date(editStep.startDate).toISOString().split('T')[0] : ''}
                      className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Date de fin *</label>
                    <input type="date" name="endDate" required
                      defaultValue={editStep ? new Date(editStep.endDate).toISOString().split('T')[0] : ''}
                      className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Statut</label>
                    <select name="status" defaultValue={editStep?.status || 'A_VENIR'} className={ic}>
                      <option value="A_VENIR">À venir</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TERMINE">Terminé</option>
                      <option value="RETARD">En retard</option>
                      <option value="ANNULE">Annulé</option>
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Description (optionnel)</label>
                    <input type="text" name="description" defaultValue={editStep?.description || ''}
                      placeholder="Détails supplémentaires…" className={ic} />
                  </div>
                </div>
                <div className="flex gap-[10px] justify-end">
                  <button type="button"
                    onClick={() => { setShowStepForm(false); setEditStep(null); }}
                    className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#F7F7F6]">
                    Annuler
                  </button>
                  <button type="submit" disabled={isPending}
                    className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                    {isPending ? 'Enregistrement…' : editStep ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TIMELINE DES ÉTAPES */}
          {market.steps.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[40px] text-center text-[13px] text-[#6B6A67]">
              Aucune étape définie. Ajoutez les étapes du planning d&apos;exécution.
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {market.steps.map((step, idx) => {
                const cfg    = STEP_CFG[step.status] || STEP_CFG.A_VENIR;
                const isLate = step.status !== 'TERMINE' && step.status !== 'ANNULE' && new Date(step.endDate) < new Date();
                const days   = daysUntil(step.endDate);
                return (
                  <div key={step.id}
                    className={`bg-[#FFFFFF] border rounded-[10px] p-[16px_20px] ${
                      isLate ? 'border-[#9B2335]' : 'border-[#E8E7E4]'
                    }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-[10px]">
                      {/* LEFT */}
                      <div className="flex items-start gap-[12px] flex-1">
                        {/* Numéro */}
                        <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${
                          step.status === 'TERMINE' ? 'bg-[#EAF3DE] text-[#2D6A4F]'
                          : step.status === 'EN_COURS' ? 'bg-[#FEF3E2] text-[#8B4513]'
                          : 'bg-[#F7F7F6] text-[#6B6A67]'
                        }`}>{idx + 1}</div>

                        <div className="flex-1">
                          <div className="flex items-center gap-[8px] flex-wrap">
                            <span className="text-[13px] font-medium text-[#1A1A19]">{step.title}</span>
                            <span className={`inline-block border rounded-[4px] py-[1px] px-[6px] text-[11px] ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                            {isLate && (
                              <span className="inline-block border border-[#9B2335] text-[#9B2335] bg-[#FCEBEB] rounded-[4px] py-[1px] px-[6px] text-[11px]">
                                ⚠ En retard
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-[12px] text-[#6B6A67] mt-[3px]">{step.description}</p>
                          )}
                          <div className="flex flex-wrap gap-[12px] mt-[6px] text-[12px] text-[#6B6A67]">
                            <span>
                              📅 {formatDateShort(step.startDate)} → {formatDateShort(step.endDate)}
                            </span>
                            {days !== null && step.status !== 'TERMINE' && step.status !== 'ANNULE' && (
                              <span className={days < 0 ? 'text-[#9B2335]' : days <= 3 ? 'text-[#8B4513]' : 'text-[#6B6A67]'}>
                                {days < 0 ? `${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''} de retard`
                                  : days === 0 ? 'Échéance aujourd\'hui'
                                  : `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`}
                              </span>
                            )}
                          </div>

                          {/* Aléas/incidents */}
                          {step.incidents && (
                            <div className="mt-[8px] bg-[#FEF3E2] border border-[#8B4513] rounded-[6px] p-[8px_12px]">
                              <div className="flex items-center gap-[6px] mb-[2px]">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <span className="text-[11px] font-medium text-[#8B4513]">Aléas / Incidents</span>
                              </div>
                              <p className="text-[12px] text-[#8B4513]">{step.incidents}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT — Actions */}
                      <div className="flex flex-wrap gap-[6px] items-center flex-shrink-0">
                        {/* Changement de statut rapide */}
                        <select
                          value={step.status}
                          onChange={e => handleStepStatus(step.id, e.target.value)}
                          disabled={isPending}
                          className="p-[4px_8px] border border-[#E8E7E4] rounded-[4px] text-[11px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C] cursor-pointer disabled:opacity-50"
                        >
                          <option value="A_VENIR">À venir</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="TERMINE">Terminé</option>
                          <option value="RETARD">En retard</option>
                          <option value="ANNULE">Annulé</option>
                        </select>
                        <button onClick={() => setStepIncident({ id: step.id, text: step.incidents || '' })}
                          className="text-[11px] text-[#8B4513] border border-[#8B4513] bg-[#FEF3E2] py-[3px] px-[8px] rounded-[4px] hover:bg-[#fde8cc] transition-colors">
                          Aléas
                        </button>
                        <button onClick={() => { setEditStep(step); setShowStepForm(false); }}
                          className="text-[11px] text-[#6B6A67] hover:text-[#1A1A19] hover:underline">
                          Modifier
                        </button>
                        <button onClick={() => handleStepDelete(step.id)} disabled={isPending}
                          className="text-[11px] text-[#9B2335] hover:underline disabled:opacity-50">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODAL ALÉAS */}
          {stepIncident && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-[24px]">
              <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E8E7E4] w-full max-w-[480px] p-[24px]">
                <h3 className="text-[14px] font-medium text-[#1A1A19] mb-[12px]">Aléas, incidents ou changements</h3>
                <p className="text-[12px] text-[#6B6A67] mb-[14px]">Notez tout changement survenu sur cette étape.</p>
                <textarea
                  value={stepIncident.text}
                  onChange={e => setStepIncident({ ...stepIncident, text: e.target.value })}
                  rows={4}
                  placeholder="Ex: Retard fournisseur de 3 jours sur la livraison du matériel…"
                  className={`${ic} resize-y mb-[16px]`}
                />
                <div className="flex gap-[10px] justify-end">
                  <button onClick={() => setStepIncident(null)}
                    className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[14px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6]">
                    Annuler
                  </button>
                  <button onClick={handleSaveIncident} disabled={isPending}
                    className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                    {isPending ? 'Sauvegarde…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ AUDITS / CR / AUTRES ══════════ */}
      {(tab === 'Audits' || tab === 'Comptes-rendus' || tab === 'Autres') && (
        <div>
          <div className="flex justify-between items-center mb-[20px]">
            <p className="text-[13px] text-[#6B6A67]">
              {tab === 'Audits' ? 'Observations et rapports d\'audit'
                : tab === 'Comptes-rendus' ? 'Comptes-rendus de réunion'
                : 'Documents et notes divers'}
            </p>
            <button onClick={() => setShowNoteForm(!showNoteForm)}
              className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] transition-colors">
              {showNoteForm ? 'Annuler' : '+ Ajouter'}
            </button>
          </div>

          {/* FORMULAIRE NOTE */}
          {showNoteForm && (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px] mb-[20px]">
              <form onSubmit={handleNoteSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[14px]">
                  {tab === 'Comptes-rendus' && (
                    <>
                      <div>
                        <label className={lc}>Date de réunion</label>
                        <input type="date" name="date" className={ic} />
                      </div>
                      <div>
                        <label className={lc}>Participants</label>
                        <input type="text" name="participants" placeholder="Jean D., Marie L.…" className={ic} />
                      </div>
                    </>
                  )}
                  <div className={tab === 'Comptes-rendus' ? 'md:col-span-2' : ''}>
                    <label className={lc}>Titre (optionnel)</label>
                    <input type="text" name="title" placeholder="Ex: Audit trimestriel Q1 2026…" className={ic} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Notes / Observations *</label>
                    <textarea name="notes" rows={4} required className={`${ic} resize-y`}
                      placeholder={tab === 'Audits' ? 'Observations, réserves, recommandations…'
                        : tab === 'Comptes-rendus' ? 'Ordre du jour, décisions prises, actions à mener…'
                        : 'Notes diverses…'}
                    ></textarea>
                  </div>
                </div>
                <div className="flex gap-[10px] justify-end">
                  <button type="button" onClick={() => setShowNoteForm(false)}
                    className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[14px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6]">
                    Annuler
                  </button>
                  <button type="submit" disabled={isPending}
                    className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] disabled:opacity-60">
                    {isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTE NOTES */}
          {filteredNotes.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[40px] text-center text-[13px] text-[#6B6A67]">
              Aucune entrée pour {tab.toLowerCase()}.
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {filteredNotes.map(note => (
                <div key={note.id} className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[16px_20px]">
                  <div className="flex justify-between items-start gap-[12px]">
                    <div className="flex-1">
                      {note.title && <h4 className="text-[13px] font-medium text-[#1A1A19] mb-[4px]">{note.title}</h4>}
                      <div className="flex flex-wrap gap-[12px] text-[12px] text-[#6B6A67] mb-[8px]">
                        <span>{formatDate(note.date)}</span>
                        {note.participants && <span>Participants : {note.participants}</span>}
                      </div>
                      <p className="text-[13px] text-[#1A1A19] leading-[1.6] whitespace-pre-wrap">{note.notes}</p>
                    </div>
                    <button onClick={() => handleNoteDelete(note.id)} disabled={isPending}
                      className="text-[12px] text-[#9B2335] hover:underline flex-shrink-0 disabled:opacity-50">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ CONTENTIEUX ══════════ */}
      {tab === 'Contentieux' && (
        <div>
          <div className="flex justify-between items-center mb-[20px]">
            <p className="text-[13px] text-[#6B6A67]">Registre des litiges et contentieux liés à ce marché</p>
            <button onClick={() => setShowContForm(!showContForm)}
              className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#142d4a] transition-colors">
              {showContForm ? 'Annuler' : '+ Enregistrer un contentieux'}
            </button>
          </div>

          {/* FORMULAIRE CONTENTIEUX */}
          {showContForm && (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[20px] mb-[20px]">
              <form onSubmit={handleContSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] mb-[14px]">
                  <div className="md:col-span-2">
                    <label className={lc}>Objet du contentieux *</label>
                    <input type="text" name="subject" required placeholder="Ex: Retard de livraison non justifié" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Date d&apos;ouverture *</label>
                    <input type="date" name="openDate" required className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Statut initial</label>
                    <select name="status" defaultValue="EN_COURS" className={ic}>
                      <option value="EN_COURS">En cours</option>
                      <option value="RESOLU">Résolu</option>
                      <option value="ABANDONNE">Abandonné</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Description</label>
                    <textarea name="description" rows={3} className={`${ic} resize-y`}
                      placeholder="Faits, montants en jeu, parties impliquées…"></textarea>
                  </div>
                </div>
                <div className="flex gap-[10px] justify-end">
                  <button type="button" onClick={() => setShowContForm(false)}
                    className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[14px] rounded-[6px] text-[12px] hover:bg-[#F7F7F6]">
                    Annuler
                  </button>
                  <button type="submit" disabled={isPending}
                    className="bg-[#9B2335] text-[#FFFFFF] py-[8px] px-[14px] rounded-[6px] text-[12px] font-medium hover:bg-[#7d1a29] disabled:opacity-60">
                    {isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTE CONTENTIEUX */}
          {market.contentieux.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[40px] text-center text-[13px] text-[#6B6A67]">
              Aucun contentieux enregistré pour ce marché.
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {market.contentieux.map(c => (
                <div key={c.id} className={`bg-[#FFFFFF] border rounded-[10px] p-[16px_20px] ${c.status === 'EN_COURS' ? 'border-[#9B2335]' : 'border-[#E8E7E4]'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-[12px]">
                    <div className="flex-1">
                      <div className="flex items-center gap-[8px] flex-wrap mb-[4px]">
                        <h4 className="text-[13px] font-medium text-[#1A1A19]">{c.subject}</h4>
                        <span className={`inline-block border rounded-[4px] py-[1px] px-[6px] text-[11px] ${CONT_CFG[c.status] || CONT_CFG.EN_COURS}`}>
                          {c.status === 'EN_COURS' ? 'En cours' : c.status === 'RESOLU' ? 'Résolu' : 'Abandonné'}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6B6A67] mb-[6px]">Ouvert le {formatDate(c.openDate)}</div>
                      {c.description && <p className="text-[13px] text-[#6B6A67] leading-[1.5]">{c.description}</p>}
                      {c.resolution && (
                        <div className="mt-[8px] bg-[#EAF3DE] border border-[#2D6A4F] rounded-[6px] p-[8px_12px]">
                          <span className="text-[11px] font-medium text-[#2D6A4F]">Résolution : </span>
                          <span className="text-[12px] text-[#2D6A4F]">{c.resolution}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-[8px] items-center flex-shrink-0">
                      {c.status === 'EN_COURS' && (
                        <>
                          <button
                            onClick={() => {
                              const res = prompt('Description de la résolution (optionnel) :');
                              handleContStatus(c.id, 'RESOLU', res || undefined);
                            }}
                            disabled={isPending}
                            className="text-[11px] text-[#2D6A4F] border border-[#2D6A4F] bg-[#EAF3DE] py-[3px] px-[8px] rounded-[4px] hover:bg-[#d5ead6] disabled:opacity-50">
                            Résoudre
                          </button>
                          <button onClick={() => handleContStatus(c.id, 'ABANDONNE')} disabled={isPending}
                            className="text-[11px] text-[#6B6A67] border border-[#E8E7E4] py-[3px] px-[8px] rounded-[4px] hover:bg-[#F7F7F6] disabled:opacity-50">
                            Abandonner
                          </button>
                        </>
                      )}
                      <button onClick={() => handleContDelete(c.id)} disabled={isPending}
                        className="text-[11px] text-[#9B2335] hover:underline disabled:opacity-50">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
