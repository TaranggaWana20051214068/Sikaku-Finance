/**
 * Sikaku Finance - Service Worker
 * Handles offline caching using Cache-First strategy for app shell,
 * and Network-First for dynamic content.
 */

const CACHE_NAME = 'sikaku-v1.0';
const CACHE_VERSION = 1;

// App Shell: all static assets to cache on install
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // External CDN assets (cached on first use via runtime caching)
];

// External resources to cache at runtime
const RUNTIME_CACHE_PATTERNS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
];

// ==================== INSTALL ====================
self.addEventListener('install', event => {
  console.log('[SW] Installing Sikaku Finance Service Worker v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL);
    }).then(() => {
      console.log('[SW] App Shell cached successfully');
      return self.skipWaiting(); // Activate new SW immediately
    }).catch(err => {
      console.warn('[SW] App Shell caching failed (some resources may be offline):', err);
      return self.skipWaiting();
    })
  );
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', event => {
  console.log('[SW] Activating Sikaku Finance Service Worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim(); // Take control of all open tabs immediately
    })
  );
});

// ==================== FETCH (Cache Strategy) ====================
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Check if this is a CDN/external resource
  const isExternalCDN = RUNTIME_CACHE_PATTERNS.some(pattern => url.hostname.includes(pattern));

  if (isExternalCDN) {
    // STALE-WHILE-REVALIDATE for CDN assets
    event.respondWith(staleWhileRevalidate(event.request));
  } else {
    // CACHE-FIRST for app shell (local files)
    event.respondWith(cacheFirst(event.request));
  }
});

// ==================== CACHE STRATEGIES ====================

/**
 * Cache First: Return cached version immediately, fallback to network.
 * Ideal for app shell files that don't change often.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Network failed for:', request.url);
    // Return offline fallback page if HTML request
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline - konten tidak tersedia', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/**
 * Stale While Revalidate: Return cache immediately, update cache in background.
 * Ideal for CDN assets (fonts, icons, libraries).
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  // Return cached version immediately if available, else wait for network
  return cached || fetchPromise;
}

// ==================== BACKGROUND SYNC (Optional future use) ====================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION, cacheName: CACHE_NAME });
  }
});
