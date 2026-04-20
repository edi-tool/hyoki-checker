// 旧 Service Worker の自己撤去専用。
// 過去バージョンが残したキャッシュと登録を全削除し、以降は SW を使わない。
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll();
    clients.forEach((c) => c.navigate(c.url));
  })());
});