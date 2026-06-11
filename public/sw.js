const CACHE_NAME = "moundiguide-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/logo.webp",
  "/manifest.json",
  "/players-default.webp",
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

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Skip non-http requests entirely
  if (!event.request.url.startsWith("http")) return;

  if (event.request.method !== "GET") return;

  // Skip videos, APIs, external resources
  if (
    event.request.url.includes(".mp4") ||
    event.request.url.includes(".webm") ||
    event.request.url.includes("api-sports") ||
    event.request.url.includes("rapidapi") ||
    event.request.url.includes("openweathermap") ||
    event.request.url.includes("flagcdn") ||
    event.request.url.includes("chrome-extension")
  ) return;

  // Network-first for HTML pages (always get fresh content)
  if (event.request.mode === "navigate" ||
      event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for assets (JS, CSS, images)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "MoundiGuide 🏆", {
      body: data.body || "Notification MoundiGuide",
      icon: "/logo.webp",
      badge: "/logo.webp",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || "/"));
});
