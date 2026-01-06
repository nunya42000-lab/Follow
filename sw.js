// sw.js
const CACHE_NAME = 'follow-me-v62-offline-ultimate';

// 1. App Shell: Files we MUST have immediately
const FILES_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './sensors.js',
    './gestures.js', 
    './comments.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './qr.jpg',
    './redeem.jpg',
    // External "Entry Point" files (We cache these specifically to be safe)
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js'
];

// Install: Cache the "App Shell" immediately
self.addEventListener('install', event => {
    // Force this SW to become the active one immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching App Shell');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    console.log('[SW] Clearing Old Cache:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        ))
    ).then(() => self.clients.claim());
});

// Fetch: The "Hybrid" Strategy for 100% Offline
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // STRATEGY 1: Cache First (for local files & App Shell)
    // This makes the app instant.
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // STRATEGY 2: Network + Dynamic Cache (for everything else)
            // If it's not in the cache (like a specific font file or Firebase chunk),
            // fetch it from the internet, SAVE IT to the cache, then return it.
            return fetch(event.request)
                .then(networkResponse => {
                    // Check if we received a valid response
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                        return networkResponse;
                    }

                    // Clone the response (streams can only be consumed once)
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(err => {
                    // If both Cache and Network fail (Offline & Not Cached), show nothing or fallback
                    console.log('[SW] Fetch failed (Offline):', event.request.url);
                });
        })
    );
});
