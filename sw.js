const CACHE_NAME = 'roompe-cache-v2';
// Yahan sabse zaroori paths hain, sabme dot-slash hona chahiye
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Naye version ko turant active karne ke liye
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
