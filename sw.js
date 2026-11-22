const VERSAO = 'contracena-v3';
const ARQUIVOS = ['./', 'index.html', 'app.css', 'app.js', 'cenas.js', 'gravuras.js', 'manifest.webmanifest',
  'fonts/AlfaSlabOne-400.woff2', 'fonts/Alegreya-400.woff2', 'fonts/Alegreya-400i.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
