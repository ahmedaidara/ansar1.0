// Nom du cache pour la version de l'application
const CACHE_NAME = 'ansar-almouyassar-v1';

// Liste des fichiers à mettre en cache
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

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation du Service Worker (supprime les anciens caches)
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

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'ANSAR ALMOUYASSAR';
  const options = {
    body: data.body,
    icon: '/assets/images/logo-192x192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
