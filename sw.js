// sw.js
// Version: v63 - Mobile Offline Optimized
const CACHE_NAME = 'follow-me-v63-mobile-offline';

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
    // External dependencies (Tailwind, Fonts, Firebase)
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

// Activate: Clean up old caches (v61, v62, etc.)
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

// Fetch: Hybrid Strategy (Cache First for speed, Network fallback for new stuff)
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // 1. If it's in the cache, return it immediately (Offline support)
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. If not, fetch it from the internet
            return fetch(event.request)
                .then(networkResponse => {
                    // Check if the response is valid
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                        return networkResponse;
                    }

                    // 3. IMPORTANT: Clone and Cache it for next time
                    // This grabs any extra files (like Font woff2 files) automatically
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(() => {
                    // Offline fallback (optional)
                    console.log('[SW] Offline and item not in cache:', event.request.url);
                });
        })
    );
});
