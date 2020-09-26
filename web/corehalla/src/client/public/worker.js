const cacheName = 'corehalla';
const dynamicCacheName = 'corehalla-dynamic';
const staticAssets = ['/'];

self.addEventListener('install', async (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(staticAssets);
        }),
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => true)
                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    }),
            );
        }),
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        }),
    );
});
