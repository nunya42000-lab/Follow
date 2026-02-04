// sw.js
// Version: v64 - Fault Tolerant Offline
const CACHE_NAME = 'follow-me-v64-robust';
const CACHE_NAME = 'follow-me-v100-dev';

const CRITICAL_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './sensors.js',
    './gestures.js',
    './vision.js',
    './manifest.json',
    // Moved to Critical to ensure app always looks correct offline
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
];

const OPTIONAL_ASSETS = [
    './icon-192.png',
    './icon-512.png',
    './wasm/vision_bundle.js',
    './wasm/vision_wasm_internal.wasm',
    './wasm/gesture_recognizer.task'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW] Installing...');
            
            // A. Cache Critical Files (Fail if missing)
            try {
                await cache.addAll(CRITICAL_ASSETS);
                console.log('[SW] Critical assets cached');
            } catch (err) {
                console.error('[SW] Critical install failed. Check file paths:', err);
            }

            // B. Cache Optional Files (Ignore errors)
            await Promise.all(OPTIONAL_ASSETS.map(async url => {
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        await cache.put(url, res);
                    } else {
                        console.warn(`[SW] Could not cache optional: ${url} (${res.status})`);
                    }
                } catch (e) {
                    console.warn(`[SW] Network error for optional: ${url}`);
                }
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
            // Return cached content if available
            if (cached) return cached;

            // Otherwise fetch from network and cache it for next time
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                return networkResponse;
            }).catch(() => {
                console.log('[SW] Offline & not found:', event.request.url);
            });
        })
    );
});
