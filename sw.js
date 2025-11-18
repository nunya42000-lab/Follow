// sw.js

// --- CACHE VERSION ---
// Bump this to force an update on client devices
const CACHE_NAME = 'follow-me-v23'; 
// --- ---------------- ---

const FILES_TO_CACHE = [
    './', 
    './index.html',
    './styles.css',       // Restored
    './manifest.json',    // Restored
    // Core Logic
    './app.js',
    './config.js',
    './state.js',
    './dom.js',
    './utils.js',
    './ui.js',
    './camera.js',
    './game.js',
    // External Dependencies (CDNs)
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js', 
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js' 
];

// 1. Install Event: Cache all core files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching all app files...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(err => {
                console.warn('Service Worker: Failed to cache some static files.', err);
            })
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Fetch Event: Intercept network requests
self.addEventListener('fetch', event => {
    // We only want to cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // 1. Found in cache: Return it
                    return response;
                }

                // 2. Not in cache: Go to network
                return fetch(event.request)
                    .then(networkResponse => {
                        
                        // Don't cache Firebase's real-time data requests (Firestore)
                        // We let the Firestore SDK handle its own internal caching
                        if (event.request.url.includes('firestore.googleapis.com')) {
                            return networkResponse;
                        }

                        // 2a. Cache the new resource
                        // Fix: Allow caching of 'opaque' responses (status 0) from CDNs (like gstatic/fonts)
                        // Opaque responses are common with 'no-cors' requests for scripts/styles
                        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(err => {
                        // 3. Network failed (user is offline)
                        console.warn('Service Worker: Fetch failed, user is likely offline.', err);
                        // Optional: You could return a custom offline.html here if navigation fails
                    });
            })
    );
});

// 4. Message Event: Force Update
// This allows the main app to trigger "skipWaiting" via the update toast
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Skipping waiting to activate new version...');
        self.skipWaiting();
    }
});
