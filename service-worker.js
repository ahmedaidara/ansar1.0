const CACHE_NAME = 'ansar-almouyassar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.css',
  '/main.js',
  '/chatbotResponses.js',
  '/assets/images/logo-144x144.png',
  '/assets/images/logo-192x192.png',
  '/assets/images/logo-192x192-maskable.png',
  '/assets/images/logo-512x512.png',
  '/assets/images/logo-512x512-maskable.png',
  '/assets/images/chatbot-bg.jpg',
  '/assets/videos/intro.mp4',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'ANSAR ALMOUYASSAR';
  const options = {
    body: data.body,
    icon: '/assets/images/logo-192x192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
