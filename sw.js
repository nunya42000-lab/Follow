// --- CACHE VERSION ---
// Change this every time you update any file!
const CACHE_NAME = 'follow-me-v15'; 
// --- ---------------- ---

const FILES_TO_CACHE = [
    './', 
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './sensors.js',
    './comments.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js', 
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js' 
];

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

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request)
                    .then(networkResponse => {
                        if (event.request.url.includes('firestore.googleapis.com')) return networkResponse;
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                        }
                        return networkResponse;
                    })
                    .catch(err => console.warn('Offline/Network Error', err));
            })
    );
});
