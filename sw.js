// sw.js
// Version: v80 - Modular & Clean
const CACHE_NAME = 'follow-me-v80-modular';

const CRITICAL_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './voice.js',      // NEW
    './ar_core.js',    // NEW
    './gestures.js',
    './comments.js',
    './manifest.json',
    './vision.js',
    './wasm/vision_bundle.js',
    './wasm/vision_wasm_internal.js',
    './wasm/vision_wasm_internal.wasm',
    './wasm/gesture_recognizer.task'
];

const OPTIONAL_ASSETS = [
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
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW] Installing Modular Version...');
            try {
                await cache.addAll(CRITICAL_ASSETS);
            } catch (err) {
                console.error('[SW] Critical install failed:', err);
            }
            // Cache optional files loosely
            await Promise.all(OPTIONAL_ASSETS.map(async url => {
                try {
                    const res = await fetch(url);
                    if (res.ok) await cache.put(url, res);
                } catch (e) {}
            }));
        })
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
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200) return networkResponse;
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                return networkResponse;
            }).catch(() => null);
        })
    );
});
