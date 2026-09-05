const CACHE_NAME = 'follow-me-v209';

const CRITICAL_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

const OPTIONAL_ASSETS = [
    './icon192.png',
    './icon512.png',
      './01.png',
  './02.png',
  './03.png',
  './04.png',
  './05.png',
  './06.png',
  './07.png',
  './08.png',
  './09.png',
  './10.png',
    './qr.jpg',
    './redeem.png',
    './wasm/vision_bundle.js',
    './wasm/vision_wasm_internal.js',
    './wasm/vision_wasm_internal.wasm',
    './wasm/gesture_recognizer.task',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW] Installing...');
            
            // A. Cache Critical Files (Fail if missing)[span_1](start_span)[span_1](end_span)
            try {
                await cache.addAll(CRITICAL_ASSETS);
                console.log('[SW] Critical assets cached');
            } catch (err) {
                console.error('[SW] Critical install failed. Check file paths:', err);
            }

            // B. Cache Optional Files (Ignore errors)[span_2](start_span)[span_2](end_span)
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

    if (event.request.mode === 'navigate') {
        const url = new URL(event.request.url);
        if (url.searchParams.has('forceRefresh')) {
            event.respondWith(
                (async () => {
                    try {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                        console.log('[SW] Force-refresh: all caches cleared');
                    } catch (e) {
                        console.warn('[SW] Force-refresh cache clear failed:', e);
                    }
                    try {
                        self.registration.update();
                    } catch (e) {}
                    try {
                        return await fetch(event.request, { cache: 'no-store' });
                    } catch (e) {
                        return fetch(event.request);
                    }
                })()
            );
            return;
        }
        // Landscape/Split Screen configure modal's live preview iframe (?vpPreview=1) must
        // always get the current, real files straight from the network - never a cached
        // (possibly stale/pre-update) copy. Serving a stale app.js/index.html here silently
        // breaks the preview (blank/black, since an older build may not know about vpPreview
        // mode at all) without ever touching the real cached app the person actually uses.
        if (url.searchParams.get('vpPreview') === '1') {
            event.respondWith(
                fetch(event.request, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
            );
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            // 1. Return cached content instantly if available
            if (cached) return cached;

            // 2. Fetch from network and lazily cache it for next time
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                return networkResponse;
            }).catch(() => {
                // 3. ONLY if the network fails (offline), fallback to the cached root
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html').then(indexCached => indexCached || caches.match('./'));
                }
                console.log('[SW] Offline & not found:', event.request.url);
            });
        })
    );
});
