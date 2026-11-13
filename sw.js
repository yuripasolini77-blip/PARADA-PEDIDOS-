// Parada Pedidos: deixa o sistema instalável como aplicativo.
// Sempre busca a versão mais nova na internet; sem internet, abre a última versão guardada.
const CACHE = 'parada-pedidos-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  e.respondWith((async () => {
    try {
      const resp = await fetch(req);
      if (resp && resp.ok && !resp.redirected) {
        const c = await caches.open(CACHE);
        await c.put('./', resp.clone());
      }
      return resp;
    } catch (err) {
      const c = await caches.open(CACHE);
      return (await c.match('./')) || Response.error();
    }
  })());
});
