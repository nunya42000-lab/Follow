                const CACHE_NAME = 'omnigesture-v1.1.5'; // Increment this whenever you change code!
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    // Core Logic
    './app.js',
    './state.js',
    './constants.js',
    './settings.js',
    './game-logic.js',
    // UI & Rendering
    './renderer.js',
    './settings-ui.js',
    './ui-core.js',
    './global-listeners.js',
    // Subsystems
    './audio-haptics.js',
    './voice-commander.js',
    './vision.js',
    './ar_core.js',
    './sensors.js',
    './gesture-engine-setup.js',
    './gesture-mappings.js',
    './comments.js',
    './firebase-setup.js'
];

// 1. Install - Pre-cache all essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Pre-caching app shell');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Activate - Clean up old cache versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch - Stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like Firebase)
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });

                // Return the cached version if we have it, 
                // but still update the cache in the background
                return cachedResponse || fetchedResponse;
            });
        })
    );
});
