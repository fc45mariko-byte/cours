// Service worker : l'application reste consultable hors ligne.
// - Page d'accueil : réseau d'abord (pour recevoir les mises à jour), cache en secours.
// - Fichiers construits (noms avec empreinte) et polices : cache d'abord, puis réseau.
// Les chapitres déjà ouverts ou enregistrés sont ainsi disponibles sans connexion.
const CACHE = 'lea-journal-v1';
const COQUILLE = ['./', './index.html', './manifest.webmanifest', './icone.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const memeOrigine = url.origin === self.location.origin;
  const police = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!memeOrigine && !police) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copie = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copie)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((trouve) => trouve || fetch(req).then((r) => {
    if (r.ok || r.type === 'opaque') { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(req, copie)); }
    return r;
  })));
});
