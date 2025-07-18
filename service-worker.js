// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ansar-almouyassar-v2').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/main.css',
        '/main.js',
        '/assets/images/logo.png',
        '/assets/images/logo-512.png',
        '/assets/images/chatbot-bg.jpg',
        '/assets/videos/intro.mp4',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'https://cdn.jsdelivr.net/npm/chart.js'
      ]).catch((error) => {
        console.error('Erreur lors de la mise en cache:', error);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch((error) => {
        console.error('Erreur lors de la récupération:', error);
        return new Response('Ressource non disponible hors ligne');
      });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'ANSAR ALMOUYASSAR', body: 'Nouvelle notification' };
  const title = data.title || 'ANSAR ALMOUYASSAR';
  const options = {
    body: data.body || 'Vous avez reçu une nouvelle notification.',
    icon: '/assets/images/logo.png',
    badge: '/assets/images/logo.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Nettoyer les anciens caches lors de l'activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['ansar-almouyassar-v2'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
