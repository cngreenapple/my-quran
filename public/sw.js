const APP_VERSION = '1.0.1';
const CACHE_VERSION = `v5-${APP_VERSION}`;
const STATIC_CACHE = `alquran-static-${CACHE_VERSION}`;
const API_CACHE = `alquran-api-${CACHE_VERSION}`;
const AUDIO_CACHE = `alquran-audio-${CACHE_VERSION}`;
const IMAGE_CACHE = `alquran-images-${CACHE_VERSION}`;

const VALID_CACHES = [STATIC_CACHE, API_CACHE, AUDIO_CACHE, IMAGE_CACHE];

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !VALID_CACHES.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (url.origin === 'https://equran.id') {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (url.origin === 'https://api.aladhan.com') {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (
    url.origin === 'https://download.quranicaudio.com' ||
    url.origin === 'https://server8.mp3quran.net' ||
    url.origin === 'https://everyayah.com' ||
    url.origin === 'https://cdn.islamic.network'
  ) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
    return;
  }

  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          caches.open(cacheName).then((cache) => cache.put(request, response));
        }
      })
      .catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('[SW] Fetch failed:', request.url);
    throw err;
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.source && event.data && event.data.type === 'PING') {
    event.source.postMessage({ type: 'PONG', version: CACHE_VERSION });
  }
});