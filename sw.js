// Service worker · Central de Estudos (GCM Cubatão e PM-SP). Ao mudar qualquer arquivo, suba a versão do CACHE.
const CACHE = "central-concursos-v4b";
const FILES = [
  "./", "./index.html", "./styles.css", "./app.js",
  "./data.js", "./bank-1.js", "./bank-2.js", "./bank-3.js", "./extras.js",
  "./pmsp-data.js", "./pmsp-port.js", "./pmsp-mat.js", "./pmsp-info.js", "./pmsp-cg-hist.js", "./pmsp-cg-geo.js", "./pmsp-adm.js", "./concursos.js",
  "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png",
  "./fonts/barlow-400.woff2", "./fonts/barlow-500.woff2", "./fonts/barlow-600.woff2", "./fonts/barlow-700.woff2",
  "./fonts/barlowcondensed-600.woff2", "./fonts/barlowcondensed-700.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => cached || fetch(req).then(resp => {
      if (resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return resp;
    }).catch(() => {
      // Sem rede: só devolve o app para navegação, nunca HTML no lugar de imagem ou script.
      if (req.mode === "navigate") return caches.match("./index.html");
      return new Response("", { status: 503, statusText: "Offline" });
    }))
  );
});
