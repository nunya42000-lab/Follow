// sw.js
const CACHE_NAME = 'follow-me-v61-offline';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './sensors.js',
    './gestures.js',  // <--- ADDED THIS CRITICAL FILE
    './comments.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './qr.jpg',
    './redeem.jpg',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
            })
        ))
    ).then(() => self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
  
