// sw.js
// Version: v64 - Fault Tolerant Offline
const CACHE_NAME = 'follow-me-v64-robust';

// 1. CRITICAL: These MUST exist for the app to run.
// If any of these are missing, the offline mode will fail.
const CRITICAL_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './settings.js',
    './sensors.js',
    './gestures.js',
    './comments.js',
    './manifest.json'
];

// 2. OPTIONAL: Images & External Links.
// We will TRY to cache these. If they fail (404 missing, network error), 
// we simply skip them so the app still installs successfully.
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
