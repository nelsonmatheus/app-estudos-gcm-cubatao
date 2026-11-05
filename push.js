/* Central de Estudos · lembrete diário por notificação (Web Push).
   O app guarda só a inscrição do navegador e um resumo do estudo (concurso, sequência, último dia estudado,
   ponto fraco). O servidor (supabase/functions/push-send) dispara uma vez por dia no horário escolhido
   e não manda nada se a pessoa já estudou naquele dia. Nenhum dado pessoal (nome, e-mail) é coletado. */
"use strict";
window.Push = (() => {
  const KEY = "cc-push";               // { on, hour, sig (último resumo enviado) }
  const cfg = () => window.PUSH_CONFIG || {};
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo"; } catch (e) { return "America/Sao_Paulo"; } };
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  const configured = () => !!(cfg().endpoint && cfg().vapidPublicKey);
  const supported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  /** Situação para a tela de ajustes. */
  function status() {
    if (!configured()) return "off-config";
    if (isIOS() && !standalone()) return "ios-install";
    if (!supported()) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    return read().on ? "on" : "ready";
  }

  function b64ToBytes(b64) {
    const pad = "=".repeat((4 - b64.length % 4) % 4), s = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(s, c => c.charCodeAt(0));
  }
  async function registration() {
    const reg = await navigator.serviceWorker.ready;
    return reg;
  }
  async function call(method, body) {
    const r = await fetch(cfg().endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error("Servidor respondeu " + r.status);
    return r.json().catch(() => ({}));
  }

  /** Resumo do estudo enviado ao servidor para personalizar a frase. `ctx` vem do app.js. */
  function payload(sub, ctx, hour) {
    const j = sub.toJSON();
    return { endpoint: j.endpoint, keys: j.keys, hour, tz: tz(), ...ctx };
  }

  async function enable(hour, ctx) {
    if (!configured() || !supported()) throw new Error("Notificações indisponíveis neste aparelho");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(perm === "denied" ? "Permissão negada" : "Permissão não concedida");
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(cfg().vapidPublicKey) });
    await call("POST", payload(sub, ctx, hour));
    write({ on: true, hour, sig: JSON.stringify([ctx, hour]) });
  }

  async function disable() {
    const st = read(); write({ ...st, on: false });
    if (!supported()) return;
    try {
      const reg = await registration(), sub = await reg.pushManager.getSubscription();
      if (sub) { await call("DELETE", { endpoint: sub.endpoint }).catch(() => {}); await sub.unsubscribe(); }
    } catch (e) {}
  }

  async function setHour(hour, ctx) {
    const st = read(); write({ ...st, hour });
    if (st.on) await sync(ctx, true);
  }

  /** Atualiza o resumo no servidor, só quando ele mudou (ex.: estudou hoje, trocou de concurso ou de horário). */
  async function sync(ctx, force) {
    const st = read();
    if (!st.on || !configured() || !supported() || Notification.permission !== "granted") return;
    const sig = JSON.stringify([ctx, st.hour ?? 19]);
    if (!force && st.sig === sig) return;
    try {
      const reg = await registration(), sub = await reg.pushManager.getSubscription();
      if (!sub) { write({ ...st, on: false }); return; }
      await call("POST", payload(sub, ctx, st.hour ?? 19));
      write({ ...read(), sig });
    } catch (e) { /* sem rede: tenta de novo na próxima vez */ }
  }

  /** Notificação local, só para conferir que o aparelho mostra o aviso. */
  async function test(title, body) {
    const reg = await registration();
    await reg.showNotification(title, { body, icon: "icon-192.png", badge: "icon-192.png", tag: "teste", data: { url: "./#home" } });
  }

  return { status, enable, disable, setHour, sync, test, hour: () => read().hour ?? 19, isOn: () => !!read().on };
})();
