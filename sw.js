// --- CACHE VERSION ---
// Change this every time you update any file!
const CACHE_NAME = 'follow-me-v18'; 
// --- ---------------- ---

const FILES_TO_CACHE = [
    './', // This caches the root, which is usually index.html
    './index.html',
    './styles.css',
    './app.js',
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

    // Strategy: Cache First, then Network
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
                        
                        // Don't cache Firebase's real-time data requests
                        if (event.request.url.includes('firestore.googleapis.com')) {
                            return networkResponse;
                        }

                        // 2a. Got a good response, let's cache it for next time
                        if (networkResponse && networkResponse.status === 200) {
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
                    });
            })
    );
});
