const CACHE_NAME = 'palacio-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first for navigation, cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET and external API calls
    if (request.method !== 'GET') return;
    if (request.url.includes('googleapis.com') || request.url.includes('esm.sh') || request.url.includes('cdn.tailwindcss.com') || request.url.includes('fonts.googleapis.com')) return;

    // Navigation requests: network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Static assets: cache first, then network
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
