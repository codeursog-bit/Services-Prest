// ============================================================================
// MSP App — Service Worker PWA Avancé
// Stratégie : Cache-First pour assets, Network-First pour API, Offline fallback
// ============================================================================

const SW_VERSION    = 'msp-v1.0.0';
const CACHE_STATIC  = `${SW_VERSION}-static`;
const CACHE_DYNAMIC = `${SW_VERSION}-dynamic`;
const CACHE_API     = `${SW_VERSION}-api`;

// Ressources à précacher au premier install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/partners',
  '/dashboard/marche',
  '/dashboard/messages',
  '/dashboard/documents',
  '/dashboard/banques',
  '/dashboard/dettes',
  '/dashboard/notifications',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
];

// URLs API à mettre en cache (Network-First avec fallback)
const API_CACHE_PATTERNS = [
  /\/api\/partners/,
  /\/api\/marche/,
  /\/api\/notifications/,
  /\/api\/dashboard/,
];

// ── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Install:', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        // Précacher les assets critiques (fail silencieux si offline)
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Précache échoué:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate:', SW_VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('msp-') && key !== CACHE_STATIC && key !== CACHE_DYNAMIC && key !== CACHE_API)
          .map(key => {
            console.log('[SW] Supprimer ancien cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les extensions Chrome
  if (request.method !== 'GET') return;
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  // ── 1. Ressources Next.js statiques (_next/static) — Cache-First ──
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // ── 2. Images et polices — Cache-First ──
  if (
    request.destination === 'image' ||
    request.destination === 'font'  ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|webp|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // ── 3. API Routes — Network-First avec cache ──
  if (url.pathname.startsWith('/api/')) {
    const shouldCache = API_CACHE_PATTERNS.some(p => p.test(url.pathname));
    if (shouldCache) {
      event.respondWith(networkFirst(request, CACHE_API, 4000));
    }
    // Les autres API (mutations POST/PUT/DELETE) : laisser passer normalement
    return;
  }

  // ── 4. Pages Next.js — Network-First avec fallback offline ──
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Mettre en cache les pages visitées
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_DYNAMIC).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback : chercher dans le cache ou page offline
          return caches.match(request)
            .then(cached => cached || caches.match('/offline'));
        })
    );
    return;
  }

  // ── 5. Tout le reste — Network avec fallback cache ──
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_DYNAMIC).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── BACKGROUND SYNC — Réessayer les actions échouées offline ─────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'msp-sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
  if (event.tag === 'msp-sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncPendingMessages() {
  try {
    // Récupérer les messages en attente depuis IndexedDB
    const pending = await getPendingActions('messages');
    for (const action of pending) {
      await fetch(action.url, action.options);
      await removePendingAction('messages', action.id);
    }
  } catch (err) {
    console.error('[SW] Sync messages échoué:', err);
  }
}

async function syncNotifications() {
  try {
    await fetch('/api/notifications?limit=1');
  } catch {}
}

// ── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'MSP App', body: event.data.text() }; }

  const options = {
    body:    data.body    || 'Nouvelle notification MSP',
    icon:    '/icon-192x192.png',
    badge:   '/icon-72x72.png',
    image:   data.image   || undefined,
    vibrate: [100, 50, 100],
    tag:     data.tag     || 'msp-notif',
    renotify: true,
    requireInteraction: false,
    data: {
      url:       data.url || '/dashboard/notifications',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open',    title: 'Voir',    icon: '/icon-72x72.png' },
      { action: 'dismiss', title: 'Ignorer'                           },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MSP App', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si l'app est déjà ouverte, focus + navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});

// ── HELPERS ─────────────────────────────────────────────────────────────────

// Cache-First : cherche dans le cache, sinon réseau + mise en cache
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] cacheFirst fetch échoué:', request.url);
    return new Response('Ressource indisponible', { status: 503 });
  }
}

// Network-First : réseau en priorité avec timeout, fallback cache
async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const networkPromise = fetch(request.clone());
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );

    const response = await Promise.race([networkPromise, timeoutPromise]);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ success: false, error: 'Hors ligne', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// IndexedDB helpers pour le Background Sync
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('msp-offline', 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function getPendingActions(type) {
  const db    = await openDB();
  const tx    = db.transaction('pending', 'readonly');
  const store = tx.objectStore('pending');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result || []).filter(a => a.type === type));
    req.onerror   = () => reject(req.error);
  });
}

async function removePendingAction(type, id) {
  const db    = await openDB();
  const tx    = db.transaction('pending', 'readwrite');
  const store = tx.objectStore('pending');
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

console.log('[SW] MSP Service Worker chargé —', SW_VERSION);
