const CACHE_NAME = "numerology-kz-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Простая стратегия: сначала пробуем сеть, если нет связи — отдаём то, что уже закешировано.
// Перехватываем только файлы самого сайта. Запросы к базе (Supabase) и к CDN идут напрямую:
// Safari на iPhone/iPad иногда обрывает такие запросы через Service Worker с ошибкой «Load failed».
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
