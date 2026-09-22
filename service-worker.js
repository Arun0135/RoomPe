const CACHE_NAME = 'roompe-cache-v1';
const FILES_TO_CACHE = [
  './index.html',
  './style.css',
  './script.js'
];

// App install hone par files save (cache) karna
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// App chalte waqt saved files dikhana taaki fast chale
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      return response || fetch(evt.request);
    })
  );
});
