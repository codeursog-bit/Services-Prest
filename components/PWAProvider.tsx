'use client';

import { useEffect, useState, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Screen = 'hidden' | 'modal' | 'ios-modal' | 'success';

// "Plus tard" → le modal revient après 3 jours
// "Installer" accepté → disparu à vie (msp-pwa-installed)
function isDismissedRecently(): boolean {
  const ts = localStorage.getItem('msp-install-dismissed');
  if (!ts) return false;
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - parseInt(ts, 10) < THREE_DAYS_MS;
}

export default function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [screen, setScreen]                 = useState<Screen>('hidden');
  const [installing, setInstalling]         = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    // ── Enregistrer le Service Worker ──────────────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          reg.addEventListener('updatefound', () => {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', () => {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('Mise à jour disponible. Rafraîchir ?')) {
                  nw.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          });
          setInterval(() => reg.update(), 30 * 60 * 1000);
        })
        .catch(err => console.error('[SW]', err));

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // Déjà installée en mode standalone → on ne montre rien
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('msp-pwa-installed')) return;

    // ── Android / Chrome : capturer l'événement install ────────────────────
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!shownRef.current && !isDismissedRecently()) {
        shownRef.current = true;
        setTimeout(() => setScreen('modal'), 2500);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    // ── iOS Safari ──────────────────────────────────────────────────────────
    const isIOS    = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari && !shownRef.current && !isDismissedRecently()) {
      shownRef.current = true;
      setTimeout(() => setScreen('ios-modal'), 2500);
    }

    window.addEventListener('appinstalled', () => {
      setScreen('success');
      localStorage.setItem('msp-pwa-installed', '1');
      setTimeout(() => setScreen('hidden'), 3500);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ── Install Android ────────────────────────────────────────────────────────
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    if (outcome === 'accepted') {
      setScreen('success');
      localStorage.setItem('msp-pwa-installed', '1');
      setTimeout(() => setScreen('hidden'), 3500);
    } else {
      setScreen('hidden');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setScreen('hidden');
    localStorage.setItem('msp-install-dismissed', Date.now().toString());
  };

  if (screen === 'hidden') return null;

  return (
    <>
      {/* Overlay foncé */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
        onClick={screen !== 'success' ? handleDismiss : undefined}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL ANDROID / CHROME / DESKTOP
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === 'modal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px]">
          <div
            className="bg-[#FFFFFF] rounded-[16px] w-full max-w-[380px] overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header violet MSP */}
            <div className="bg-[#3D3B8E] p-[28px] flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192x192.png"
                alt="MSP App"
                width="80"
                height="80"
                className="rounded-[18px] mb-[16px] shadow-lg"
              />
              <h2 className="text-[18px] font-medium text-[#FFFFFF] mb-[4px]">
                MSP App
              </h2>
              <p className="text-[13px] text-[#FFFFFF] opacity-75">
                Melanie Services &amp; Prest.
              </p>
            </div>

            {/* Corps */}
            <div className="p-[24px]">
              <h3 className="text-[16px] font-medium text-[#1A1A19] mb-[8px] text-center">
                Installer l&apos;application
              </h3>
              <p className="text-[13px] text-[#6B6A67] text-center leading-[1.7] mb-[20px]">
                Ajoutez MSP App sur votre écran d&apos;accueil pour un accès rapide, même sans connexion internet.
              </p>

              {/* Avantages */}
              <div className="flex flex-col gap-[10px] mb-[24px]">
                {[
                  { icon: '⚡', text: 'Accès instantané depuis votre écran d\'accueil' },
                  { icon: '📶', text: 'Fonctionne hors connexion (données en cache)' },
                  { icon: '🔔', text: 'Notifications en temps réel' },
                  { icon: '🖥️', text: 'Expérience plein écran sans barre de navigation' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-[10px]">
                    <span className="text-[16px] flex-shrink-0 mt-[1px]">{item.icon}</span>
                    <span className="text-[13px] text-[#1A1A19] leading-[1.5]">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Boutons */}
              <button
                onClick={handleInstall}
                disabled={installing}
                className="w-full bg-[#E8500A] text-[#FFFFFF] py-[13px] rounded-[8px] text-[14px] font-medium hover:bg-[#c44208] transition-colors disabled:opacity-60 mb-[10px]"
              >
                {installing ? 'Installation en cours…' : '📲 Installer l\'application'}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full border border-[#E8E7E4] text-[#6B6A67] py-[11px] rounded-[8px] text-[13px] hover:bg-[#F7F7F6] transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL IOS SAFARI
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === 'ios-modal' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-[16px]"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div
            className="bg-[#FFFFFF] rounded-[16px] w-full max-w-[420px] overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#3D3B8E] p-[20px] flex items-center gap-[14px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/apple-touch-icon.png"
                alt="MSP"
                width="52"
                height="52"
                className="rounded-[12px] flex-shrink-0"
              />
              <div>
                <p className="text-[15px] font-medium text-[#FFFFFF]">Installer MSP App</p>
                <p className="text-[12px] text-[#FFFFFF] opacity-70">sur votre iPhone ou iPad</p>
              </div>
              <button onClick={handleDismiss} className="ml-auto text-[#FFFFFF] opacity-60 hover:opacity-100 p-[4px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Corps */}
            <div className="p-[20px]">
              <p className="text-[13px] text-[#6B6A67] mb-[16px] leading-[1.6]">
                Ajoutez cette application à votre écran d&apos;accueil en 3 étapes simples :
              </p>

              {/* Étapes */}
              <div className="flex flex-col gap-[12px] mb-[20px]">
                {/* Étape 1 */}
                <div className="flex items-center gap-[12px] p-[12px] bg-[#F7F7F6] rounded-[10px]">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#3D3B8E] flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-medium text-[#FFFFFF]">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1A1A19]">Appuyez sur le bouton <strong>Partager</strong></p>
                    <p className="text-[11px] text-[#6B6A67] mt-[2px]">La flèche vers le haut en bas de Safari</p>
                  </div>
                  <div className="w-[32px] h-[32px] bg-[#E8EEF5] rounded-[6px] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D3B8E" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="flex items-center gap-[12px] p-[12px] bg-[#F7F7F6] rounded-[10px]">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#3D3B8E] flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-medium text-[#FFFFFF]">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1A1A19]">Appuyez sur <strong>&quot;Sur l&apos;écran d&apos;accueil&quot;</strong></p>
                    <p className="text-[11px] text-[#6B6A67] mt-[2px]">Faites défiler le menu vers le bas</p>
                  </div>
                  <div className="w-[32px] h-[32px] bg-[#E8EEF5] rounded-[6px] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D3B8E" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="flex items-center gap-[12px] p-[12px] bg-[#F7F7F6] rounded-[10px]">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#E8500A] flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-medium text-[#FFFFFF]">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#1A1A19]">Appuyez sur <strong>&quot;Ajouter&quot;</strong></p>
                    <p className="text-[11px] text-[#6B6A67] mt-[2px]">L&apos;icône MSP apparaîtra sur votre écran</p>
                  </div>
                  <div className="w-[32px] h-[32px] bg-[#fdf0eb] rounded-[6px] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8500A" strokeWidth="1.8" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>

              <button onClick={handleDismiss}
                className="w-full border border-[#E8E7E4] text-[#6B6A67] py-[11px] rounded-[8px] text-[13px] hover:bg-[#F7F7F6] transition-colors">
                Compris, peut-être plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ÉCRAN SUCCÈS
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-[#FFFFFF] rounded-[16px] w-full max-w-[320px] p-[32px] text-center shadow-xl">
            <div className="w-[64px] h-[64px] rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-[16px]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-[17px] font-medium text-[#1A1A19] mb-[8px]">Application installée !</h3>
            <p className="text-[13px] text-[#6B6A67] leading-[1.6]">
              MSP App est maintenant disponible sur votre écran d&apos;accueil.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
