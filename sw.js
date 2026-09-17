const CACHE_NAME = "roompe-v4";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

// App install hone par files cache me save karna
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fast loading ke liye cache se file uthana
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
