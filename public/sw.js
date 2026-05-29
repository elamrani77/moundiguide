const CACHE_NAME = "moundiguide-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/logo.png",
  "/manifest.json",
  "/players-default.png",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const url = e.request.url;

  // Skip caching for videos, API calls, and external resources
  if (
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes("api-sports") ||
    url.includes("rapidapi") ||
    url.includes("openweathermap") ||
    url.includes("flagcdn") ||
    url.startsWith("chrome-extension")
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match("/"));
    })
  );
});
