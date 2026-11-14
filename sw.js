// Parada Pedidos e Parada Recebimento: deixa o sistema instalável como aplicativo.
// Sempre busca a versão mais nova na internet; sem internet, abre a última versão guardada de cada página.
const CACHE = 'parada-pedidos-v3';
const chave = req => { const u = new URL(req.url); return u.origin + (u.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/'); };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  e.respondWith((async () => {
    try {
      const resp = await fetch(req);
      if (resp && resp.ok && !resp.redirected) {
        const c = await caches.open(CACHE);
        await c.put(chave(req), resp.clone());
      }
      return resp;
    } catch (err) {
      const c = await caches.open(CACHE);
      return (await c.match(chave(req))) || Response.error();
    }
  })());
});

// Tocar na notificação abre o aplicativo
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const abertos = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const c of abertos) { if ('focus' in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  })());
});
