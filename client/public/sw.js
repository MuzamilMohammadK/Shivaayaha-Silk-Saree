// Shivaayaha Silk Sarees — Service Worker
// Automatically unregisters itself in development (localhost) mode

const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// In development mode: immediately unregister this SW so Vite can work properly
if (IS_DEV) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    // Unregister self in dev to stop intercepting Vite requests
    event.waitUntil(
      self.registration.unregister().then(() => {
        // Force all clients to reload without the SW
        return self.clients.matchAll({ type: 'window' });
      }).then((clients) => {
        clients.forEach((client) => {
          if (client.navigate) client.navigate(client.url);
        });
      })
    );
  });

  // Pass ALL fetch events through — never intercept in dev
  self.addEventListener('fetch', () => {
    return;
  });

} else {
  // ── PRODUCTION MODE ──────────────────────────────────────────────────────
  const CACHE_NAME = 'shivaayaha-ledger-v3';
  const BASE = '/Shivaayaha-Silk-Saree';
  const ASSETS_TO_CACHE = [
    BASE + '/',
    BASE + '/index.html',
    BASE + '/manifest.json',
    BASE + '/favicon.svg',
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS_TO_CACHE))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    // Let API calls pass through directly — never cache backend requests
    if (event.request.url.includes('/api/')) {
      return;
    }

    event.respondWith(
      caches.match(event.request).then(async (cached) => {
        if (cached) return cached;
        try {
          return await fetch(event.request);
        } catch {
          // Offline fallback: return the cached app shell for any navigation
          if (event.request.mode === 'navigate') {
            const shell = await caches.match(BASE + '/') ||
                          await caches.match(BASE + '/index.html');
            if (shell) return shell;
          }
          // Return a minimal offline response so the SW doesn't crash
          return new Response('Offline - please check your connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })
    );
  });
}
