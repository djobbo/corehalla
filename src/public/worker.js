var CACHE_NAME = 'pwa-task-manager';
var urlsToCache = ['/'];

// Install a service worker
self.addEventListener('install', event => {
	// Perform install steps
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			console.log('Opened cache');
			return cache.addAll(urlsToCache);
		})
	);
});

// Cache and return requests
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.open('corehalla-dynamic').then(cache => {
			return cache.match(event.request).then(
				response =>
					response ||
					fetch(event.request).then(response => {
						cache.put(event.request, response.clone());
						return response;
					})
			);
		})
	);
});

// Update a service worker
self.addEventListener('activate', event => {
	var cacheWhitelist = ['pwa-task-manager'];
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.reduce(
					(acc, cacheName) =>
						cacheWhitelist.indexOf(cacheName) === -1
							? [...acc, caches.delete(cacheName)]
							: acc,
					[]
				)
			);
		})
	);
});
