'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

  const handlePinChange = (index: number, value: string, isConfirm: boolean) => {
    if (value && !/^[0-9]+$/.test(value)) return;
    
    if (isConfirm) {
      const newPin = [...confirmPin];
      newPin[index] = value;
      setConfirmPin(newPin);
    } else {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
    }
  };

  const inputClass = "w-full p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]";
  const labelClass = "block text-[12px] font-medium text-[#1A1A19] mb-[6px]";
  const pinInputClass = "w-[52px] h-[52px] text-center text-[22px] font-medium text-[#1A1A19] bg-[#FFFFFF] border border-[#E8E7E4] rounded-[6px] focus:outline-none focus:border-[#1A3A5C] transition-colors";

  return (
    <DashboardLayout userInitials="ML" pageTitle="Paramètres">
      <div className="max-w-[800px] mx-auto">
        
        {/* SECTION 1 — Profil administrateur */}
        <section className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px] mb-[16px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[20px]">Profil administrateur</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[20px]">
            <div>
              <label className={labelClass}>Nom complet</label>
              <input type="text" defaultValue="Marie L." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" defaultValue="admin@melanieservices.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input type="tel" defaultValue="+241 01 23 45 67" className={inputClass} />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
              Enregistrer les modifications
            </button>
          </div>
        </section>

        {/* SECTION 2 — Sécurité */}
        <section className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px] mb-[16px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[20px]">Sécurité et accès</h2>
          
          {/* Sous-section : Mot de passe */}
          <div className="mb-[24px]">
            <h3 className="text-[13px] font-medium text-[#1A1A19] mb-[12px]">Mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[12px]">
              <input type="password" placeholder="Mot de passe actuel" className={inputClass} />
              <input type="password" placeholder="Nouveau mot de passe" className={inputClass} />
              <input type="password" placeholder="Confirmer" className={inputClass} />
            </div>
            <div className="flex justify-end">
              <button className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors">
                Changer le mot de passe
              </button>
            </div>
          </div>

          {/* Sous-section : Code PIN */}
          <div className="pt-[24px] border-t border-[#E8E7E4] mb-[24px]">
            <h3 className="text-[13px] font-medium text-[#1A1A19] mb-[4px]">Code PIN de verrouillage</h3>
            <p className="text-[12px] text-[#6B6A67] mb-[16px]">Définir ou modifier votre code PIN de verrouillage session.</p>
            
            <div className="flex flex-col sm:flex-row gap-[24px] items-start sm:items-center">
              <div>
                <span className="block text-[12px] text-[#6B6A67] mb-[8px]">Nouveau PIN</span>
                <div className="flex gap-[10px]">
                  {pin.map((digit, i) => (
                    <input key={`pin-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handlePinChange(i, e.target.value, false)} className={pinInputClass} />
                  ))}
                </div>
              </div>
              
              <div>
                <span className="block text-[12px] text-[#6B6A67] mb-[8px]">Confirmer le nouveau PIN</span>
                <div className="flex gap-[10px]">
                  {confirmPin.map((digit, i) => (
                    <input key={`cpin-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handlePinChange(i, e.target.value, true)} className={pinInputClass} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-[16px]">
              <button className="border border-[#E8E7E4] text-[#1A1A19] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#F7F7F6] transition-colors">
                Enregistrer le PIN
              </button>
            </div>
          </div>

          {/* Sous-section : Délai de verrouillage */}
          <div className="pt-[24px] border-t border-[#E8E7E4]">
            <h3 className="text-[13px] font-medium text-[#1A1A19] mb-[12px]">Délai de verrouillage automatique</h3>
            <select className="w-full sm:w-[240px] p-[10px_14px] border border-[#E8E7E4] rounded-[6px] text-[14px] bg-[#FFFFFF] text-[#1A1A19] focus:outline-none focus:border-[#1A3A5C]">
              <option value="30s">30 secondes</option>
              <option value="1m">1 minute</option>
              <option value="2m">2 minutes</option>
              <option value="5m">5 minutes</option>
            </select>
          </div>
        </section>

        {/* SECTION 3 — Notifications */}
        <section className="bg-[#FFFFFF] border border-[#E8E7E4] rounded-[10px] p-[28px]">
          <h2 className="text-[14px] font-medium text-[#1A1A19] mb-[20px]">Préférences de notification</h2>
          
          <div className="flex flex-col gap-[16px] mb-[24px]">
            <label className="flex items-center gap-[12px] cursor-pointer group">
              <div className="relative">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors duration-200"></div>
                <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-[#FFFFFF] rounded-full transition-transform duration-200 peer-checked:translate-x-[16px]"></div>
              </div>
              <span className="text-[13px] text-[#1A1A19]">Recevoir une notification à chaque upload de document</span>
            </label>

            <label className="flex items-center gap-[12px] cursor-pointer group">
              <div className="relative">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors duration-200"></div>
                <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-[#FFFFFF] rounded-full transition-transform duration-200 peer-checked:translate-x-[16px]"></div>
              </div>
              <span className="text-[13px] text-[#1A1A19]">Recevoir une notification à chaque connexion partenaire</span>
            </label>

            <label className="flex items-center gap-[12px] cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-[36px] h-[20px] bg-[#E8E7E4] rounded-full peer-checked:bg-[#1A3A5C] transition-colors duration-200"></div>
                <div className="absolute left-[2px] top-[2px] w-[16px] h-[16px] bg-[#FFFFFF] rounded-full transition-transform duration-200 peer-checked:translate-x-[16px]"></div>
              </div>
              <span className="text-[13px] text-[#1A1A19]">Résumé quotidien des activités par email</span>
            </label>
          </div>

          <div className="flex justify-end border-t border-[#E8E7E4] pt-[20px]">
            <button className="bg-[#1A3A5C] text-[#FFFFFF] py-[8px] px-[16px] rounded-[6px] text-[13px] font-medium hover:bg-[#142d4a] transition-colors">
              Enregistrer
            </button>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}