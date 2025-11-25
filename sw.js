// --- CACHE VERSION ---
const CACHE_NAME = 'follow-me-v37-complete'; 
// --- ---------------- ---

const FILES_TO_CACHE = [
    './', 
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './sensors.js',
    './comments.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './qr.jpg',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js', 
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js' 
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching full set v37...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(err => console.warn('Service Worker: Cache error', err))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request).then(networkResponse => {
                // Don't cache Firestore API calls
                if (event.request.url.includes('firestore.googleapis.com')) return networkResponse;
                
                // Cache other successful GET requests dynamically
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                }
                return networkResponse;
            }).catch(() => console.log("Offline."));
        })
    );
});
