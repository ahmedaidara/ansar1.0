self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ansar-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/main.css',
        '/main.js',
        '/assets/images/logo-192.png',
        '/assets/images/logo-512.png',
        '/assets/images/chatbot-bg.jpg',
        '/offline.html'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== 'ansar-v1')
                 .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  // Si la requête est une navigation (document HTML) et ce n’est pas index.html
  if (event.request.mode === 'navigate' && requestURL.pathname !== '/index.html') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        return response || fetch('/index.html');
      })
    );
  } else {
    // Sinon comportement normal (cache ou réseau avec fallback offline)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/offline.html'));
      })
    );
  }
});

