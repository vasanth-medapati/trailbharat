const CACHE_NAME = 'trailbharat-v2';

// Core files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// ================= INSTALL =================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ================= ACTIVATE =================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ================= FETCH =================
self.addEventListener('fetch', event => {
  const request = event.request;

  // 🔥 1. MAP TILE CACHING (MOST IMPORTANT)
  if (request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(response => {
          if (response) {
            return response; // return cached tile
          }

          return fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone()); // save tile
            return networkResponse;
          });
        })
      )
    );
    return;
  }

  // 🔥 2. NORMAL FILES (NETWORK FIRST)
  event.respondWith(
    fetch(request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(request).then(response => {
          return response || new Response('Offline - Content not available');
        });
      })
  );
});
