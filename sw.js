const CACHE_NAME = 'follow-me-v16-fusion';
const FILES = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './comments.js',
    './sensors.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js', 
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request).then(netRes => {
            if (netRes.ok && !e.request.url.includes('firestore')) {
                const clone = netRes.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
            return netRes;
        }))
    );
});