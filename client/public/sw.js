// Shivaayaha Silk Sarees — Service Worker
// • Dev (localhost): immediately unregisters itself so Vite HMR works
// • Production: caches app shell and passes API calls to the backend

const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

if (IS_DEV) {
  // ── DEV MODE: self-destruct so Vite is never intercepted ───────────────────
  self.addEventListener('install', () => self.skipWaiting());

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.registration.unregister().then(() =>
        self.clients.matchAll({ type: 'window' })
      ).then((clients) => {
        clients.forEach((c) => { if (c.navigate) c.navigate(c.url); });
      })
    );
  });

  // Never intercept any requests in dev
  self.addEventListener('fetch', () => { return; });

} else {
  // ── PRODUCTION MODE ────────────────────────────────────────────────────────
  const CACHE_NAME = 'shivaayaha-ledger-v4';
  const BASE = '/Shivaayaha-Silk-Saree';
  const APP_SHELL = [
    BASE + '/',
    BASE + '/index.html',
    BASE + '/manifest.json',
    BASE + '/favicon.svg',
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(APP_SHELL))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        ))
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Always let API calls (POST/PUT/DELETE) pass straight through — never cache them
    if (url.pathname.includes('/api/') || request.method !== 'GET') {
      return; // browser handles it natively
    }

    // 2. For navigation requests (page loads), serve index.html from cache
    //    This enables SPA routing (React Router) to work offline / on reload
    if (request.mode === 'navigate') {
      event.respondWith(
        caches.match(BASE + '/index.html')
          .then((cached) => cached || fetch(request))
          .catch(() => new Response('<h1>Offline</h1>', {
            headers: { 'Content-Type': 'text/html' }
          }))
      );
      return;
    }

    // 3. For all other GET assets: cache-first, then network
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses for future offline use
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => new Response('', { status: 503 }));
      })
    );
  });
}
