const CACHE_NAME = 'follow-me-v84';

self.addEventListener('fetch', (event) => {
  // 1. Catch the nuke request at the network level
  if (event.request.url.includes('nuke=true')) {
    event.respondWith(
      (async () => {
        // Wipe all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Unregister this Service Worker
        await self.registration.unregister();
        
        // Return a raw HTML response that forces the client to reload clean
        return new Response(
          '<html><body><h2>App Nuked.</h2><script>localStorage.clear(); sessionStorage.clear(); setTimeout(() => { window.location.href = "/"; }, 1000);</script></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
    );
    return; 
  }

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
    
    event.respondWith(
        caches.match(event.request).then(cached => {
            // Return cached content if available[span_3](start_span)[span_3](end_span)
            if (cached) return cached;

            // If it's a page navigation request, guarantee it opens instantly offline by falling back to index.html
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html').then(indexCached => indexCached || caches.match('./'));
            }

            // Otherwise fetch from network and cache it for next time[span_4](start_span)[span_4](end_span)
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
