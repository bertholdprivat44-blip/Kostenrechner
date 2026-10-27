const CACHE = "sparrechner-v81";
const ASSETS = [
  "./start.html",
  "./app.html",
  "./jspdf.umd.min.js",
  "./html2canvas.min.js",
  "./index.html",
  "./trading-journal.html",
  "./anleitung.html",
  "./steuer-cockpit.html",
  "./style.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Installieren: Dateien am Browser-Cache vorbei frisch laden (sonst landet evtl. eine alte Version im Speicher)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.all(ASSETS.map((u) =>
      fetch(u, { cache: "reload" }).then((r) => (r.ok ? cache.put(u, r) : null)).catch(() => null)
    )))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Abrufen: erst das Netz (neueste Version), nur ohne Internet der Zwischenspeicher
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    fetch(req.url, { cache: "no-cache" })
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req.url, copy)); }
        return res;
      })
      .catch(() => caches.match(req.url, { ignoreSearch: true }).then((c) => c || caches.match("./app.html")))
  );
});
