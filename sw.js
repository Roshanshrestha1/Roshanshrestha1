// ============================================================
//  Service Worker · Roshan Shrestha Portfolio · v2
//  Strategy: network-first with cache fallback. Bumped cache name
//  forces migration away from the buggy v1 cache that kept serving
//  stale CSS after every deploy.
// ============================================================

const CACHE_NAME = 'portfolio-v2.0.0';
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Install: open cache and precache the entry points only.
// We tolerate individual failures so a 404 on a non-essential
// file (like the old /images/favicon.png) doesn't kill install.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      )
    )
  );
});

// Activate: delete every cache that isn't the current one,
// then take control of open pages so they upgrade immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch: try the network first, fall back to cache on failure.
// Cache successful same-origin GETs opportunistically.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(req, copy))
            .catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match('/index.html'))
      )
  );
});
