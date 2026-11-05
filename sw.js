// Service worker · Central de Estudos (GCM Cubatão e PM-SP). Ao mudar qualquer arquivo, suba a versão do CACHE.
const CACHE = "central-concursos-v6a";
const FILES = [
  "./", "./index.html", "./styles.css", "./app.js",
  "./data.js", "./bank-1.js", "./bank-2.js", "./bank-3.js", "./extras.js",
  "./pmsp-data.js", "./pmsp-port.js", "./pmsp-mat.js", "./pmsp-info.js", "./pmsp-cg-hist.js", "./pmsp-cg-geo.js", "./pmsp-adm.js", "./pmsp-mat2.js", "./pmsp-info2.js", "./pmsp-atual.js", "./pmsp-redacao.js", "./concursos.js", "./push-config.js", "./push.js",
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

// ── Lembrete diário (Web Push) ───────────────────────────────────────────
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Central de Estudos", {
    body: d.body || "Bora estudar hoje?",
    icon: "icon-192.png", badge: "icon-192.png",
    tag: "lembrete-diario", renotify: true,
    data: { url: d.url || "./#home" }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || "./#home", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.startsWith(self.registration.scope) && "focus" in c) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
