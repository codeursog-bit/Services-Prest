'use client';

import { useState, useEffect, useTransition } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ic = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#3D3B8E] transition-colors";
const lc = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";

export default function SettingsPage() {
  const [user, setUser]           = useState<any>(null);
  const [isPending, startT]       = useTransition();
  const [pin, setPin]             = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [feedback, setFeedback]   = useState({ msg: '', ok: true, section: '' });

  const fb = (msg: string, section: string, ok = true) => {
    setFeedback({ msg, ok, section });
    setTimeout(() => setFeedback({ msg: '', ok: true, section: '' }), 4000);
  };

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setUser(d.user || null));
  }, []);

  // Modifier le profil
  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startT(async () => {
      const res  = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), phone: fd.get('phone') }),
      });
      const data = await res.json();
      if (data.success) { setUser(data.user); fb('Profil mis à jour.', 'profile'); }
      else fb(data.error || 'Erreur.', 'profile', false);
    });
  };

  // Changer mot de passe
  const handlePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPwd    = fd.get('newPassword') as string;
    const confirmPwd = fd.get('confirmPassword') as string;

    if (newPwd !== confirmPwd) { fb('Les mots de passe ne correspondent pas.', 'password', false); return; }
    if (newPwd.length < 8)    { fb('Mot de passe trop court (min 8 caractères).', 'password', false); return; }

    startT(async () => {
      const res  = await fetch('/api/settings/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: fd.get('currentPassword'), newPassword: newPwd }),
      });
      const data = await res.json();
      if (data.success) { fb('Mot de passe modifié avec succès.', 'password'); (e.target as HTMLFormElement).reset(); }
      else fb(data.error || 'Erreur.', 'password', false);
    });
  };

  // Enregistrer PIN
  const handlePin = () => {
    const code    = pin.join('');
    const confirm = confirmPin.join('');
    if (code.length !== 4)     { fb('Code PIN incomplet (4 chiffres).', 'pin', false); return; }
    if (code !== confirm)      { fb('Les codes PIN ne correspondent pas.', 'pin', false); return; }

    startT(async () => {
      // Stocker en cookie httpOnly via API
      const res  = await fetch('/api/settings/set-pin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      });
      const data = await res.json();
      if (data.success) {
        fb('Code PIN enregistré.', 'pin');
        setPin(['', '', '', '']);
        setConfirmPin(['', '', '', '']);
      } else fb(data.error || 'Erreur.', 'pin', false);
    });
  };

  const handlePinInput = (idx: number, val: string, isConfirm: boolean) => {
    if (val && !/^[0-9]$/.test(val)) return;
    if (isConfirm) {
      const n = [...confirmPin]; n[idx] = val; setConfirmPin(n);
    } else {
      const n = [...pin]; n[idx] = val; setPin(n);
    }
  };

  const FeedbackBar = ({ section }: { section: string }) =>
    feedback.section === section && feedback.msg ? (
      <div className={`mb-[16px] rounded-[6px] p-[10px_14px] text-[13px] border ${
        feedback.ok
          ? 'bg-[#EAF3DE] border-[#2D6A4F] text-[#2D6A4F]'
          : 'bg-[#FCEBEB] border-[#9B2335] text-[#9B2335]'
      }`}>{feedback.msg}</div>
    ) : null;

  return (
    <DashboardLayout pageTitle="Paramètres">
      <div className="max-w-[720px] mx-auto flex flex-col gap-[16px]">

        {/* ── SECTION PROFIL ── */}
        <section className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px]">
          <h2 className="text-[15px] font-medium text-[#1A1A19] mb-[20px]">Profil administrateur</h2>
          <FeedbackBar section="profile" />
          <form onSubmit={handleProfile} className="flex flex-col gap-[16px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div>
                <label className={lc}>Nom complet *</label>
                <input type="text" name="name" required defaultValue={user?.name || ''} className={ic} />
              </div>
              <div>
                <label className={lc}>Téléphone</label>
                <input type="tel" name="phone" defaultValue={user?.phone || ''} className={ic} placeholder="+242 06 XXX XX XX" />
              </div>
              <div>
                <label className={lc}>Adresse email</label>
                <div className="bg-[#F7F7F6] border border-[#E8E7E4] rounded-[6px] p-[10px_14px] text-[13px] text-[#6B6A67]">
                  {user?.email || '—'} <span className="text-[11px]">(non modifiable)</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isPending}
                className="bg-[#3D3B8E] text-[#FFFFFF] py-[9px] px-[18px] rounded-[6px] text-[13px] font-medium hover:bg-[#2e2c72] transition-colors disabled:opacity-60">
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </section>

        {/* ── SECTION MOT DE PASSE ── */}
        <section className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px]">
          <h2 className="text-[15px] font-medium text-[#1A1A19] mb-[6px]">Sécurité</h2>
          <p className="text-[12px] text-[#6B6A67] mb-[20px]">Changez votre mot de passe de connexion.</p>
          <FeedbackBar section="password" />
          <form onSubmit={handlePassword} className="flex flex-col gap-[14px]">
            <div>
              <label className={lc}>Mot de passe actuel *</label>
              <input type="password" name="currentPassword" required className={ic} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              <div>
                <label className={lc}>Nouveau mot de passe *</label>
                <input type="password" name="newPassword" required minLength={8} className={ic} placeholder="Min 8 caractères" />
              </div>
              <div>
                <label className={lc}>Confirmer *</label>
                <input type="password" name="confirmPassword" required className={ic} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isPending}
                className="border border-[#E8E7E4] text-[#1A1A19] py-[9px] px-[18px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors disabled:opacity-60">
                {isPending ? 'Modification…' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </section>

        {/* ── SECTION PIN ── */}
        <section className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px]">
          <h2 className="text-[15px] font-medium text-[#1A1A19] mb-[6px]">Code PIN de verrouillage</h2>
          <p className="text-[12px] text-[#6B6A67] mb-[20px]">
            Après 5 minutes d&apos;inactivité, votre session sera verrouillée. Le PIN permet de la reprendre sans se reconnecter.
          </p>
          <FeedbackBar section="pin" />

          <div className="flex flex-col sm:flex-row gap-[24px] items-start mb-[20px]">
            <div>
              <span className="block text-[12px] font-medium text-[#1A1A19] mb-[10px]">Nouveau PIN</span>
              <div className="flex gap-[10px]">
                {pin.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handlePinInput(i, e.target.value, false)}
                    className="w-[52px] h-[52px] text-center text-[22px] font-medium text-[#1A1A19] bg-[#FFFFFF] border border-[#E8E7E4] rounded-[6px] focus:outline-none focus:border-[#3D3B8E] transition-colors" />
                ))}
              </div>
            </div>
            <div>
              <span className="block text-[12px] font-medium text-[#1A1A19] mb-[10px]">Confirmer le PIN</span>
              <div className="flex gap-[10px]">
                {confirmPin.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handlePinInput(i, e.target.value, true)}
                    className="w-[52px] h-[52px] text-center text-[22px] font-medium text-[#1A1A19] bg-[#FFFFFF] border border-[#E8E7E4] rounded-[6px] focus:outline-none focus:border-[#3D3B8E] transition-colors" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handlePin} disabled={isPending || pin.some(d => !d) || confirmPin.some(d => !d)}
              className="border border-[#E8E7E4] text-[#1A1A19] py-[9px] px-[18px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors disabled:opacity-40">
              {isPending ? 'Enregistrement…' : 'Enregistrer le PIN'}
            </button>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
