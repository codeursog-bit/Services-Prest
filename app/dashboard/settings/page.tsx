'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

  const handlePinChange = (index: number, value: string, isConfirm: boolean) => {
    if (value && !/^[0-9]+$/.test(value)) return;
    if (isConfirm) {
      const n = [...confirmPin]; n[index] = value; setConfirmPin(n);
    } else {
      const n = [...pin]; n[index] = value; setPin(n);
    }
  };

  return (
    <DashboardLayout userInitials="ML" pageTitle="Paramètres">
      <div className="max-w-[800px] mx-auto">

        {/* SECTION 1 — Profil */}
        <section className="rounded-[10px] p-7 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Profil administrateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nom complet</label>
              <input type="text" defaultValue="Marie L." className="dash-input" />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input type="email" defaultValue="admin@melanieservices.com" className="dash-input" />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Téléphone</label>
              <input type="tel" defaultValue="+241 01 23 45 67" className="dash-input" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
              style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
              Enregistrer les modifications
            </button>
          </div>
        </section>

        {/* SECTION 2 — Sécurité */}
        <section className="rounded-[10px] p-7 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Sécurité et accès</h2>

          {/* Mot de passe */}
          <div className="mb-6">
            <h3 className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <input type="password" placeholder="Mot de passe actuel" className="dash-input" />
              <input type="password" placeholder="Nouveau mot de passe" className="dash-input" />
              <input type="password" placeholder="Confirmer" className="dash-input" />
            </div>
            <div className="flex justify-end">
              <button className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Changer le mot de passe
              </button>
            </div>
          </div>

          {/* PIN */}
          <div className="pt-6 mb-6" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Code PIN de verrouillage</h3>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>Définir ou modifier votre code PIN de verrouillage session.</p>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div>
                <span className="block text-[12px] mb-2" style={{ color: 'var(--text-muted)' }}>Nouveau PIN</span>
                <div className="flex gap-2">
                  {pin.map((digit, i) => (
                    <input key={`pin-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handlePinChange(i, e.target.value, false)}
                      className="w-[52px] h-[52px] text-center text-[22px] font-medium rounded-[6px] outline-none transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[12px] mb-2" style={{ color: 'var(--text-muted)' }}>Confirmer le nouveau PIN</span>
                <div className="flex gap-2">
                  {confirmPin.map((digit, i) => (
                    <input key={`cpin-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handlePinChange(i, e.target.value, true)}
                      className="w-[52px] h-[52px] text-center text-[22px] font-medium rounded-[6px] outline-none transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Enregistrer le PIN
              </button>
            </div>
          </div>

          {/* Délai verrouillage */}
          <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <h3 className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Délai de verrouillage automatique</h3>
            <select className="dash-input w-full sm:w-[240px]">
              <option value="30s">30 secondes</option>
              <option value="1m">1 minute</option>
              <option value="2m">2 minutes</option>
              <option value="5m">5 minutes</option>
            </select>
          </div>
        </section>

        {/* SECTION 3 — Notifications */}
        <section className="rounded-[10px] p-7" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Préférences de notification</h2>
          <div className="flex flex-col gap-4 mb-6">
            {[
              { label: "Recevoir une notification à chaque upload de document", defaultChecked: true },
              { label: "Recevoir une notification à chaque connexion partenaire", defaultChecked: true },
              { label: "Résumé quotidien des activités par email", defaultChecked: false },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex-shrink-0">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="peer sr-only" />
                  <div className="w-9 h-5 rounded-full transition-colors duration-200 peer-checked:bg-[var(--navy)] bg-[var(--border)]" />
                  <div className="absolute left-[2px] top-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-4" />
                </div>
                <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="py-2 px-4 rounded-[6px] text-[13px] font-medium transition-colors"
              style={{ background: 'var(--navy)', color: '#FFFFFF' }}>
              Enregistrer
            </button>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}