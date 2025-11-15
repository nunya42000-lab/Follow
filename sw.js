const CACHE_NAME = 'follow-me-v1';
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'style.css',
    'manifest.json',
    'config.js',
    'state.js',
    'ui.js',
    'demo.js',
    'core.js',
    'main.js',
    'httpsat://cdn.tailwindcss.com',
    'httpsat://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
];

// Install event: cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: serve from cache first
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache - fetch from network
                return fetch(event.request);
            }
        )
    );
});
;
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// --- Fetch Event ---
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (!networkResponse || !networkResponse.ok) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed, and not in cache:', error);
                    });
            })
    );
});fetch(event.request)
                    .then((networkResponse) => {
                        
                        // Check if we received a valid response
                        if (!networkResponse || !networkResponse.ok) {
                            return networkResponse;
                        }

                        // 3. If Network fetch succeeds, cache the response and return it
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed, and not in cache:', error);
                        // Let the request fail
                    });
            })
    );
});
                      
