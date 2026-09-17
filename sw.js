const CACHE_NAME = "roompe-v3"; // Version update
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

// 1. Install & Force Active (Turant naya update lagao)
self.addEventListener("install", event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Delete Old Caches (Purani files ko kachre me dalo)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. NETWORK FIRST STRATEGY (Hamesha naya code pehle laao)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Agar internet hai aur code mil gaya, toh naya code dikhao
        return response;
      })
      .catch(() => {
        // Agar internet nahi hai, tabhi phone ki memory se purana dikhao
        return caches.match(event.request);
      })
  );
});
