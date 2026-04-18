const CACHE_NAME = 'dict-cache-v1';
const DICT_URLS = [
  './dict/base.dat.gz',
  './dict/check.dat.gz',
  // ... 他の辞書ファイル
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(DICT_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});