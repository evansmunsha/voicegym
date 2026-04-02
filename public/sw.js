/* eslint-disable no-restricted-globals */
// Dev kill-switch service worker:
// If a stale PWA SW is controlling the app, it can cache/serve old RSC payloads and
// crash Next's router in development. Serving /sw.js allows the browser to update
// the existing registration, then this SW immediately unregisters itself and
// clears caches.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }

      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }

      try {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        await Promise.all(
          clients.map((client) => {
            try {
              return client.navigate(client.url);
            } catch {
              return Promise.resolve();
            }
          })
        );
      } catch {
        // ignore
      }
    })()
  );
});

self.addEventListener("fetch", () => {
  // Intentionally no-op.
});

