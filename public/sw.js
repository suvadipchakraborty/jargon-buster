/**
 * Jargon Buster — Service Worker
 * Cache-first for the static shell, always network for the live
 * /api/jargon endpoint (a cached buzzword would defeat the point).
 */

const CACHE_NAME = "jargon-buster-shell-v1";
const SHELL_FILES = [
  "/",
  "/css/styles.css",
  "/js/app.js",
  "/js/dictionary.js",
  "/manifest.webmanifest",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  // Never cache the live jargon API — always hit the network.
  if (url.pathname === "/api/jargon") {
    event.respondWith(fetch(event.request).catch(() => new Response(
      JSON.stringify({ error: "offline" }),
      { status: 503, headers: { "content-type": "application/json" } }
    )));
    return;
  }

  // Cache-first for same-origin shell assets.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request)
            .then((response) => {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
              return response;
            })
            .catch(() => cached)
        );
      })
    );
  }
});
