const CACHE_NAME = 'app-cache-v1';

// Master file list extracted from the application structure
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css', // Assuming a standard stylesheet exists
  '/app.js',
  '/state.js',
  '/renderer.js',
  '/settings.js',
  '/vision.js',
  '/sensors.js',
  '/voice-commander.js',
  '/comments.js',
  '/ui-core.js',
  '/game-logic.js',
  '/global-listeners.js',
  '/gesture-engine-setup.js',
  '/gesture-mappings.js',
  '/firebase-setup.js',
  '/ui-modals.js',
  '/ui-controller.js',
  '/ar_core.js',
  '/audio-haptics.js',
  '/gesture-groups.js'
];

// 1. Install Event - Caches the master file list
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline assets');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Cleans up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event - Unified Strategy
self.addEventListener('fetch', (event) => {
    // 1. Filter requests: Skip non-GET and Firebase/Firestore
    if (event.request.method !== 'GET' || 
        !event.request.url.startsWith(self.location.origin) || 
        event.request.url.includes('firestore')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached file if found
            if (cachedResponse) {
                return cachedResponse;
            }

            // Otherwise, fetch from the network
            return fetch(event.request).then((networkResponse) => {
                // Validate response before caching
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                console.log('[Service Worker] Fetch failed and asset not cached.');
            });
        })
    );
});
