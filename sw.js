/** Hexawater static-site offline support. Bump VERSION when files change. */
const VERSION = 'hexawater-v1.1.0-music';
const CORE = ['./', './index.html', './styles.css', './script.js', './config.js',
  './assets/favicon.svg', './assets/brand-seal.svg', './assets/hero-crystal.svg',
  './assets/closing-pattern.svg', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('hexawater-') && key !== VERSION).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Let the browser handle audio byte ranges natively. CacheStorage cannot
  // store 206 Partial Content, and quiet visitors should never prefetch audio.
  if (request.destination === 'audio' || new URL(request.url).pathname.endsWith('/assets/rebel-heart.mp3')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const clone = response.clone(); caches.open(VERSION).then(cache => cache.put('./index.html', clone)); }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const clone = response.clone(); caches.open(VERSION).then(cache => cache.put(request, clone)); }
    return response;
  })));
});
