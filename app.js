/* GCM Cubatão · Central de Estudos (v3)
   Vanilla JS, sem dependências. Toda a interface é renderizada em #view. */
"use strict";

// ── Constantes da prova (fonte: apostila, seção "A prova em números") ─────
const EXAM_DATE = new Date(2026, 11, 20);
const SIM_SIZE = 15, SIM_MINUTES = 79, POINTS_PER_Q = 4, TARGET_OK = 12, SAFE_OK = 13;
const STORE = "gcm-cubatao-study-v2";
const RANKS = [[0,"Recruta"],[50,"Aluno"],[120,"Guarda nível I"],[220,"Guarda nível II"],[350,"Guarda nível III"],[500,"Guarda nível IV"],[700,"Guarda nível V"],[950,"Guarda nível VI"],[1300,"Subinspetor"],[1800,"Inspetor"]];

// ── Utilidades ────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const view = $("view");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad2 = n => String(n).padStart(2, "0");
const fmtTime = s => pad2(Math.floor(s / 60)) + ":" + pad2(s % 60);
const ico = (n, cls = "") => `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
const load = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hash = s => { let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return (h >>> 0).toString(36); };
const topicName = i => TOPICS[i]?.name || "Específicos";

// ── Estado ────────────────────────────────────────────────────────────────
const blank = () => ({ seen: [], known: [], review: [], h: {}, sims: [], answered: 0, correct: 0, days: {}, active: null, prefs: { theme: "auto", goal: 20 } });
function hydrate(raw) {
  const s = Object.assign(blank(), raw || {});
  s.prefs = Object.assign(blank().prefs, s.prefs || {});
  for (const k of ["seen", "known", "review", "sims"]) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.h || typeof s.h !== "object") s.h = {};
  if (!s.days || typeof s.days !== "object") s.days = {};
  return s;
}
const v1 = load("gcm-cubatao-study-v1") || {};
let state = hydrate(load(STORE) || { seen: v1.seen, known: v1.known, review: v1.review });
let saveWarned = false;
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); }
  catch (e) { if (!saveWarned) { saveWarned = true; toast("Não foi possível salvar neste navegador"); } }
  updateBadge();
}

// ── Banco de questões ─────────────────────────────────────────────────────
const ALL = [
  ...QUESTIONS.map(x => ({ t: x.topic, art: "Geral", q: x.q, o: x.opts, w: x.why, a: x.a })),
  ...BANK.map(x => ({ ...x, a: x.a ?? 0 }))
].map(x => ({ ...x, id: hash(x.q) }));
const BY_ID = new Map(ALL.map(q => [q.id, q]));
const CARD_LIST = CARDS.map((c, i) => ({ ...c, id: i, ti: TOPICS.findIndex(t => t.name === c.topic) }));
const correctText = q => q.o[q.a];

const hist = id => state.h[id] || (state.h[id] = { s: 0, w: 0, r: 0, l: -1, due: 0 });
const inErrors = q => { const h = state.h[q.id]; return !!h && h.w > 0 && h.r < 2 && !h.m; };
const errorList = () => ALL.filter(inErrors);
function smartScore(q) {
  const h = state.h[q.id], now = Date.now();
  if (!h) return 1.5 + Math.random();                   // inédita
  if (h.l === 1 && h.due > now) return -5 + Math.random(); // acertou e ainda não venceu
  return h.w * 3 + (h.l === 0 ? 5 : 0) + (h.due <= now ? 2 : 0) - h.r + Math.random();
}
function logDay(n = 1) { const k = dayKey(); state.days[k] = (state.days[k] || 0) + n; }
function record(q, ok) {
  const h = hist(q.id);
  h.s++;
  if (ok) { h.r++; h.l = 1; h.due = Date.now() + [0, 1, 3, 7, 14, 30][Math.min(h.r, 5)] * 864e5; }
  else { h.w++; h.r = 0; h.l = 0; h.due = 0; delete h.m; } // errou de novo: volta ao caderno mesmo se marcada como dominada
  state.answered++;
  if (ok) state.correct++;
  logDay();
}

// ── Métricas ──────────────────────────────────────────────────────────────
const daysLeft = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((EXAM_DATE - t) / 864e5); };
const doneToday = () => state.days[dayKey()] || 0;
function streak() {
  const d = new Date(); let n = 0;
  if (!state.days[dayKey(d)]) d.setDate(d.getDate() - 1); // hoje ainda não conta contra
  while (state.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function topicStats(i) {
  const qs = ALL.filter(q => q.t === i);
  let seen = 0, tries = 0, wrong = 0, mastered = 0;
  for (const q of qs) { const h = state.h[q.id]; if (h && h.s) { seen++; tries += h.s; wrong += h.w; if (h.r >= 2) mastered++; } }
  return { total: qs.length, seen, tries, wrong, mastered, acc: tries ? pct(tries - wrong, tries) : null };
}
const coverage = () => pct(ALL.filter(q => state.h[q.id]?.s).length, ALL.length);
const accuracy = () => pct(state.correct, state.answered);
const simAvg = () => { const s = state.sims.slice(-5); return s.length ? Math.round(s.reduce((a, x) => a + x.ok * POINTS_PER_Q, 0) / s.length) : null; };
function weakestTopic() {
  const list = TOPICS.map((_, i) => ({ i, ...topicStats(i) })).filter(x => x.tries >= 3).sort((a, b) => a.acc - b.acc);
  if (list.length && list[0].acc < 85) return list[0];
  return null;
}
function rank() {
  const xp = state.correct + state.known.length;
  let i = 0; while (i < RANKS.length - 1 && xp >= RANKS[i + 1][0]) i++;
  const [from, name] = RANKS[i], next = RANKS[i + 1];
  return { i, name, xp, next: next && next[1], need: next ? next[0] - xp : 0, prog: next ? (xp - from) / (next[0] - from) : 1 };
}

// ── Toast e sheet ─────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, action) {
  const el = $("toast");
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button" id="toastAct">${esc(action.label)}</button>` : ""}`;
  el.classList.add("show");
  if (action) $("toastAct").onclick = () => { action.fn(); el.classList.remove("show"); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), action ? 5000 : 3000);
}
function sheet({ title, body = "", actions = [] }) {
  const dlg = $("sheet");
  $("sheetIn").innerHTML = `<h2 id="sheetTitle">${esc(title)}</h2>${body}<div class="sheet-act">${actions.map((a, i) => `<button type="button" class="btn ${a.kind || "line"} wide" data-sheet="${i}">${a.icon ? ico(a.icon, "s") : ""}${esc(a.label)}</button>`).join("")}</div>`;
  $("sheetIn").querySelectorAll("[data-sheet]").forEach(b => b.onclick = () => {
    const a = actions[+b.dataset.sheet];
    dlg.close();
    a.fn && a.fn();
  });
  if (!dlg.open) dlg.showModal();
}
$("sheet").addEventListener("click", e => { if (e.target === $("sheet")) $("sheet").close(); });

// ── Roteador ──────────────────────────────────────────────────────────────
const ROUTES = { home: renderHome, cards: renderCards, quiz: renderQuiz, topics: renderTopics, errors: renderErrors, stats: renderStats, notes: renderNotes };
const TAB_OF = { home: "home", cards: "cards", notes: "cards", quiz: "quiz", errors: "errors", stats: "stats", topics: "home" };
let route = "home";
function currentRoute() { const r = location.hash.slice(1); return ROUTES[r] ? r : "home"; }
function go(r) { if (location.hash === "#" + r) render(true); else location.hash = r; }
function render(changed = false) {
  route = currentRoute();
  document.querySelectorAll(".tab").forEach(t => { if (t.dataset.tab === TAB_OF[route]) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current"); });
  document.body.classList.toggle("focus", route === "quiz" && !!state.active);
  ROUTES[route]();
  if (changed) {
    view.classList.remove("enter"); void view.offsetWidth; view.classList.add("enter");
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
  updateBadge();
}
window.addEventListener("hashchange", () => { $("toast").classList.remove("show"); render(true); });
function updateBadge() {
  const n = errorList().length, b = $("errBadge");
  b.hidden = !n; b.textContent = n > 99 ? "99+" : n;
}

// ── Ações (delegação de eventos) ──────────────────────────────────────────
const ACT = {};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el && ACT[el.dataset.act]) { e.preventDefault(); ACT[el.dataset.act](el.dataset, el); }
});

// ── INÍCIO ────────────────────────────────────────────────────────────────
const pageHead = (kicker, title, sub = "") => `<header class="page-head"><span class="kicker">${esc(kicker)}</span><h1 class="title">${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</header>`;
function resumeBanner() {
  const s = state.active; if (!s) return "";
  const answered = s.picks.filter(p => p != null).length;
  return `<div class="banner"><span class="tile-ico">${ico("pause")}</span><div class="txt"><b>${esc(s.title)} em andamento</b><small>${answered} de ${s.ids.length} respondidas${s.limit ? " · o tempo continua correndo" : ""}</small></div><a class="btn small line" href="#quiz">Continuar</a></div>`;
}
function renderHome() {
  const left = daysLeft(), st = streak(), goal = state.prefs.goal, today = doneToday(), reached = today >= goal;
  const errs = errorList().length, weak = weakestTopic(), avg = simAvg(), last = state.sims[state.sims.length - 1];
  const remaining = Math.max(goal - today, 0);
  const countBlock = left > 0
    ? `<div class="count">${left}</div><div class="count-txt"><b>${left === 1 ? "dia para" : "dias para"}<br>a prova</b><span>20 dez 2026 · IBAM</span></div>`
    : left === 0
      ? `<div class="count-txt"><b>Hoje é o dia da prova</b><span>Boa prova. Confie no treino.</span></div>`
      : `<div class="count-txt"><b>Prova realizada</b><span>20 dez 2026 · IBAM</span></div>`;
  view.innerHTML = `
    <div class="topbar">
      <div class="id"><svg class="logo" aria-hidden="true"><use href="#i-shield"/></svg><div><b>GCM Cubatão</b><small>Central de estudos</small></div></div>
      <span class="chip ${st ? "on" : ""}" title="Dias seguidos de estudo">${ico("flame", "s")}${plural(st, "dia", "dias")}</span>
    </div>
    ${resumeBanner()}
    <div class="home-grid"><div class="stack">
    <section class="hero" aria-label="Missão de hoje">
      <svg class="mark" aria-hidden="true"><use href="#i-shield-line"/></svg>
      <div class="hero-top">${countBlock}</div>
      <div class="goal">
        <div class="goal-row"><span>Missão de hoje</span><b>${Math.min(today, goal)} de ${goal} questões</b></div>
        <div class="meter" role="progressbar" aria-valuenow="${Math.min(today, goal)}" aria-valuemax="${goal}" aria-label="Meta diária"><i style="transform:scaleX(${Math.min(today / goal, 1)})"></i></div>
      </div>
      <button class="btn gold wide" data-act="mission">${ico("bolt", "s")}${reached ? "Meta batida · treinar mais" : `Iniciar missão · ${Math.min(remaining, 20)} questões`}</button>
    </section>
    <button class="card sim-card" data-act="startSim">
      <span class="tile-ico">${ico("clock")}</span>
      <span class="txt"><b>Simulado de prova</b><small>${last ? `Último: ${last.ok * POINTS_PER_Q} de ${last.n * POINTS_PER_Q} pontos` : `${SIM_SIZE} questões · ${SIM_MINUTES} min · ${SIM_SIZE * POINTS_PER_Q} pontos`}</small></span>
      ${ico("right", "chev")}
    </button>
    </div><div class="stack">
    <div class="kpis">
      <div class="kpi"><b>${state.answered ? accuracy() + "%" : "–"}</b><span>de acerto</span></div>
      <div class="kpi"><b>${avg != null ? avg : "–"}</b><span>média nos simulados</span></div>
      <div class="kpi"><b>${coverage()}%</b><span>do banco já visto</span></div>
      <div class="kpi"><b>${state.answered}</b><span>questões feitas</span></div>
    </div>
    ${weak ? `<button class="card weak" data-act="trainTopic" data-t="${weak.i}"><span class="tile-ico">${ico("target")}</span><span style="flex:1;min-width:0"><b style="display:block;font-weight:600;line-height:1.25">Ponto fraco: ${esc(topicName(weak.i))}</b><small class="muted small">${weak.acc}% de acerto · toque para treinar</small></span>${ico("right", "chev")}</button>` : ""}
    </div></div>
    <h2 class="section-title">Estudar</h2>
    <div class="modes">
      <a class="mode" href="#quiz"><span class="tile-ico">${ico("quiz")}</span><span><b>Questões</b><small>${ALL.length} no estilo IBAM</small></span></a>
      <a class="mode" href="#cards"><span class="tile-ico">${ico("cards")}</span><span><b>Cartões</b><small>${CARDS.length} flashcards</small></span></a>
      <a class="mode" href="#notes"><span class="tile-ico">${ico("bulb")}</span><span><b>Macetes</b><small>Revisão de véspera</small></span></a>
      <a class="mode" href="#errors">${errs ? `<span class="pill">${errs}</span>` : ""}<span class="tile-ico">${ico("alert")}</span><span><b>Caderno de erros</b><small>Montado sozinho</small></span></a>
      <a class="mode" href="#topics"><span class="tile-ico">${ico("layers")}</span><span><b>Matérias</b><small>${TOPICS.length} itens do edital</small></span></a>
      <button class="mode" data-act="startSmart"><span class="tile-ico">${ico("refresh")}</span><span><b>Revisão inteligente</b><small>O que você mais erra</small></span></button>
    </div>
    <p class="foot-note">Material de treino baseado na apostila. Confira sempre a lei e o edital oficiais.</p>`;
}
ACT.mission = () => {
  const n = Math.max(Math.min(state.prefs.goal - doneToday(), 20), 10);
  startSession({ mode: "smart", title: "Missão de hoje", n });
};
ACT.startSim = () => startSession({ mode: "sim" });
ACT.startSmart = () => startSession({ mode: "smart", title: "Revisão inteligente", n: 15 });
ACT.trainTopic = d => { train.topic = String(d.t); train.art = "all"; train.only = "all"; startSession({ mode: "treino", title: "Treino: " + topicName(+d.t), n: 15, ids: shuffle(ALL.filter(q => q.t === +d.t)).map(q => q.id) }); };

// ── QUESTÕES: configuração ────────────────────────────────────────────────
const train = { topic: "all", art: "all", amount: "15", only: "all" };
function trainPool() {
  return ALL.filter(q => (train.topic === "all" || q.t === +train.topic) && (train.art === "all" || q.art === train.art) &&
    (train.only === "all" || (train.only === "new" && !state.h[q.id]?.s) || (train.only === "wrong" && state.h[q.id]?.w > 0)));
}
function renderQuiz() {
  if (state.active) return renderRun();
  if (lastResult) return renderResult();
  const arts = [...new Set(ALL.filter(q => train.topic === "all" || q.t === +train.topic).map(q => q.art))].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  if (train.art !== "all" && !arts.includes(train.art)) train.art = "all";
  const errs = errorList().length, avail = trainPool().length, amounts = [["10", "10"], ["15", "15"], ["20", "20"], ["all", "Todas"]];
  const seg = (group, opts, val) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-act="setTrain" data-k="${group}" data-v="${v}" aria-pressed="${v === val}">${l}</button>`).join("")}</div>`;
  view.innerHTML = `
    ${pageHead("Treino de prova", "Questões", `${ALL.length} questões, com alternativas parecidas e pegadinhas no estilo IBAM.`)}
    <div class="list">
      <button class="card sim-card" data-act="startSim"><span class="tile-ico">${ico("clock")}</span><span class="txt"><b>Simulado de prova</b><small>${SIM_SIZE} questões de vários assuntos · ${SIM_MINUTES} min · sem gabarito até entregar</small></span>${ico("right", "chev")}</button>
      <button class="card sim-card" style="border-left-color:var(--line-2)" data-act="startSmart"><span class="tile-ico">${ico("refresh")}</span><span class="txt"><b>Revisão inteligente</b><small>Prioriza erros, vencidas e inéditas</small></span>${ico("right", "chev")}</button>
      <button class="card sim-card" style="border-left-color:var(--line-2)" data-act="startErrors" ${errs ? "" : "disabled"}><span class="tile-ico">${ico("alert")}</span><span class="txt"><b>Caderno de erros</b><small>${errs ? plural(errs, "questão pendente", "questões pendentes") : "Nenhum erro pendente"}</small></span>${ico("right", "chev")}</button>
    </div>
    <h2 class="section-title">Treino por assunto</h2>
    <div class="card pad stack">
      <label class="field">Assunto<select id="trTopic"><option value="all">Todos os assuntos</option>${TOPICS.map((t, i) => `<option value="${i}" ${String(i) === train.topic ? "selected" : ""}>${pad2(i + 1)} · ${esc(t.name)}</option>`).join("")}</select></label>
      <label class="field">Artigo ou tema<select id="trArt"><option value="all">Todos</option>${arts.map(a => `<option ${a === train.art ? "selected" : ""}>${esc(a)}</option>`).join("")}</select></label>
      <div class="field">Questões${seg("only", [["all", "Todas"], ["new", "Inéditas"], ["wrong", "Já errei"]], train.only)}</div>
      <div class="field">Quantidade${seg("amount", amounts, train.amount)}</div>
      <p class="hint">${plural(avail, "questão disponível", "questões disponíveis")} neste filtro</p>
      <button class="btn line wide" data-act="startTrain" ${avail ? "" : "disabled"}>${ico("right", "s")}Começar treino</button>
    </div>`;
  $("trTopic").onchange = e => { train.topic = e.target.value; train.art = "all"; renderQuiz(); };
  $("trArt").onchange = e => { train.art = e.target.value; renderQuiz(); };
}
ACT.setTrain = d => { train[d.k] = d.v; renderQuiz(); };
ACT.startTrain = () => {
  const pool = shuffle(trainPool());
  if (!pool.length) return toast("Nenhuma questão neste filtro");
  const n = train.amount === "all" ? pool.length : +train.amount;
  const label = train.topic === "all" ? "Treino" : "Treino: " + topicName(+train.topic);
  startSession({ mode: "treino", title: label, ids: pool.slice(0, n).map(q => q.id) });
};
ACT.startErrors = () => startSession({ mode: "erros", title: "Caderno de erros", ids: shuffle(errorList()).map(q => q.id) });

// ── Sessão de questões ────────────────────────────────────────────────────
let lastResult = null, tick = null;
/** Simulado: uma questão de cada assunto, em ordem aleatória, priorizando as menos vistas. */
function buildSim() {
  const seenCount = q => state.h[q.id]?.s || 0;
  const buckets = TOPICS.map((_, i) => shuffle(ALL.filter(q => q.t === i)).sort((a, b) => seenCount(a) - seenCount(b)));
  const order = shuffle(TOPICS.map((_, i) => i)), out = [];
  for (let round = 0; out.length < SIM_SIZE && round < 50; round++)
    for (const t of order) { if (out.length >= SIM_SIZE) break; const q = buckets[t][round]; if (q) out.push(q); }
  return shuffle(out).map(q => q.id);
}
function askReplace(fn) {
  sheet({ title: "Já existe uma sessão aberta", body: `<p>${esc(state.active.title)} ainda está em andamento. Começar outra descarta a atual.</p>`, actions: [
    { label: "Continuar a sessão atual", kind: "gold", fn: () => go("quiz") },
    { label: "Descartar e começar outra", kind: "danger", fn: () => { discard(); fn(); } },
    { label: "Cancelar", kind: "ghost" }
  ] });
}
function discard() { state.active = null; stopTick(); save(); }
function startSession({ mode, title, ids, n }) {
  if (state.active) return askReplace(() => startSession({ mode, title, ids, n }));
  if (mode === "sim") { ids = buildSim(); title = "Simulado de prova"; }
  if (mode === "smart") ids = ALL.slice().sort((a, b) => smartScore(b) - smartScore(a)).slice(0, n || 15).map(q => q.id);
  else if (n && ids) ids = ids.slice(0, n);
  if (!ids || !ids.length) return toast(mode === "erros" ? "Nenhum erro pendente" : "Nenhuma questão disponível");
  state.active = {
    mode, title, ids,
    orders: ids.map(id => { const ix = BY_ID.get(id).o.map((_, i) => i); return shuffle(ix); }),
    picks: ids.map(() => null), flags: [], cur: 0, t0: Date.now(), limit: mode === "sim" ? SIM_MINUTES * 60 : 0
  };
  lastResult = null;
  save(); startTick();
  if (route === "quiz") render(true); else go("quiz");
}
function question(i) {
  const s = state.active, q = BY_ID.get(s.ids[i]), order = s.orders[i];
  return { ...q, opts: order.map(k => q.o[k]), ans: order.indexOf(q.a) };
}
const elapsed = s => Math.floor((Date.now() - s.t0) / 1000);
function startTick() { stopTick(); tick = setInterval(onTick, 1000); }
function stopTick() { clearInterval(tick); tick = null; }
function onTick() {
  const s = state.active; if (!s) return stopTick();
  const e = elapsed(s);
  if (s.limit && e >= s.limit) { finish(); toast("Tempo esgotado. Simulado entregue."); return; }
  const el = $("runTimer");
  if (el) { const v = s.limit ? s.limit - e : e; el.textContent = fmtTime(v); el.parentElement.classList.toggle("low", !!s.limit && v <= 300); }
}
function renderRun() {
  const s = state.active, i = s.cur, q = question(i), sim = s.mode === "sim", pick = s.picks[i], answered = pick != null, reveal = !sim && answered;
  const total = s.ids.length, doneN = s.picks.filter(p => p != null).length, flagged = s.flags.includes(i);
  const track = total <= 30
    ? `<div class="track" aria-hidden="true">${s.ids.map((_, k) => {
        let c = ""; const p = s.picks[k];
        if (k === i) c = "cur";
        else if (p != null) c = sim ? "done" : (p === question(k).ans ? "good" : "bad");
        return `<i class="${c}"></i>`; }).join("")}</div>`
    : `<div class="bar" aria-hidden="true"><i style="width:${pct(doneN, total)}%"></i></div>`;
  const opts = q.opts.map((t, k) => {
    let cls = "", mk = "";
    if (reveal) {
      if (k === q.ans) { cls = "good"; mk = ico("check", "s"); }
      else if (k === pick) { cls = "bad"; mk = ico("x", "s"); }
      else cls = "dim";
    } else if (pick === k) cls = "sel";
    const stateTxt = reveal ? (k === q.ans ? " (alternativa correta)" : k === pick ? " (sua resposta, incorreta)" : "") : "";
    return `<button type="button" class="opt ${cls}" data-act="pick" data-k="${k}" ${reveal ? "disabled" : ""} aria-pressed="${pick === k}"><span class="l">${"ABCD"[k]}</span><span class="t">${esc(t)}<span class="vh" style="position:absolute;left:-9999px">${stateTxt}</span></span><span class="mk">${mk}</span></button>`;
  }).join("");
  const isLast = i === total - 1;
  const good = reveal && pick === q.ans;
  const v = s.limit ? Math.max(s.limit - elapsed(s), 0) : elapsed(s);
  view.innerHTML = `
    <div class="run-top">
      <button class="icon-btn" data-act="exitRun" aria-label="Sair da sessão">${ico("x")}</button>
      <div class="mid"><b>${esc(s.title)}</b><small>Questão ${i + 1} de ${total}</small></div>
      ${sim ? `<button class="icon-btn" data-act="openMap" aria-label="Mapa de questões">${ico("grid")}</button>` : ""}
      <div class="timer ${s.limit && v <= 300 ? "low" : ""}" role="timer" aria-label="${s.limit ? "Tempo restante" : "Tempo decorrido"}"><span id="runTimer">${fmtTime(v)}</span></div>
    </div>
    ${track}
    <article class="card q-card" id="qCard">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
        <span class="q-tag">${esc(topicName(q.t))}${sim || q.art === "Geral" ? "" : " · " + esc(q.art)}</span>
        ${sim ? `<button class="icon-btn ${flagged ? "on" : ""}" style="width:44px;height:44px;margin:-6px -6px 0 0" data-act="flag" aria-pressed="${flagged}" aria-label="Marcar para revisar">${ico("flag", "s")}</button>` : ""}
      </div>
      <h2 class="q-text">${esc(q.q)}</h2>
      <div class="opts">${opts}</div>
      ${reveal ? `<div class="why ${good ? "good" : "bad"}" role="status"><b>${ico(good ? "check" : "x", "s")}${good ? "Correto" : "Não foi dessa vez"}</b>${esc(q.w)}</div>` : ""}
    </article>
    <div class="run-nav">
      ${sim ? `<button class="btn line back" data-act="move" data-d="-1" ${i === 0 ? "disabled" : ""} aria-label="Questão anterior">${ico("left")}</button>` : ""}
      ${sim
        ? (isLast ? `<button class="btn gold" data-act="askSubmit">Entregar simulado</button>` : `<button class="btn ${answered ? "gold" : "line"}" data-act="move" data-d="1">${answered ? "Próxima" : "Pular"}${ico("right", "s")}</button>`)
        : (reveal ? `<button class="btn gold" data-act="${isLast ? "finishRun" : "next"}" id="nextBtn">${isLast ? "Ver resultado" : "Próxima"}${ico("right", "s")}</button>` : "")}
    </div>`;
}
function animateQuestion() { const c = $("qCard"); if (c) { c.classList.add("enter"); window.scrollTo({ top: 0 }); } }
ACT.pick = d => {
  const s = state.active; if (!s) return;
  const k = +d.k, i = s.cur;
  if (s.mode === "sim") { s.picks[i] = s.picks[i] === k ? null : k; save(); renderRun(); return; }
  if (s.picks[i] != null) return;
  s.picks[i] = k;
  const q = question(i), ok = k === q.ans;
  record(q, ok); save();
  if (navigator.vibrate && !matchMedia("(prefers-reduced-motion:reduce)").matches) navigator.vibrate(ok ? 12 : [18, 40, 18]);
  renderRun();
  const w = view.querySelector(".why"); if (w) w.scrollIntoView({ block: "nearest", behavior: "smooth" });
};
ACT.next = () => { const s = state.active; s.cur = Math.min(s.cur + 1, s.ids.length - 1); save(); renderRun(); animateQuestion(); };
ACT.move = d => { const s = state.active; s.cur = Math.max(0, Math.min(s.cur + +d.d, s.ids.length - 1)); save(); renderRun(); animateQuestion(); };
ACT.flag = () => { const s = state.active, i = s.cur, at = s.flags.indexOf(i); at >= 0 ? s.flags.splice(at, 1) : s.flags.push(i); save(); renderRun(); };
ACT.openMap = () => {
  const s = state.active;
  const cells = s.ids.map((_, k) => `<button type="button" data-goto="${k}" class="${s.picks[k] != null ? "ans" : ""} ${k === s.cur ? "now" : ""}" aria-label="Questão ${k + 1}${s.picks[k] != null ? ", respondida" : ", em branco"}${s.flags.includes(k) ? ", marcada" : ""}">${k + 1}${s.flags.includes(k) ? `<svg class="ico fl" aria-hidden="true"><use href="#i-flag"/></svg>` : ""}</button>`).join("");
  sheet({ title: "Mapa de questões", body: `<div class="legend"><span>Preenchida: respondida</span><span>Vazia: em branco</span><span>Bandeira: marcada</span></div><div class="qmap">${cells}</div>`, actions: [
    { label: "Entregar simulado", kind: "gold", fn: askSubmit }, { label: "Voltar à questão", kind: "ghost" }
  ] });
  $("sheetIn").querySelectorAll("[data-goto]").forEach(b => b.onclick = () => { s.cur = +b.dataset.goto; save(); $("sheet").close(); renderRun(); animateQuestion(); });
};
function askSubmit() {
  const s = state.active, blanks = s.picks.filter(p => p == null).length;
  sheet({ title: "Entregar simulado?", body: `<p>${blanks ? `Você deixou <b>${plural(blanks, "questão", "questões")} em branco</b>. O edital não desconta erro: em branco é ponto perdido.` : "Todas as questões foram respondidas."}</p>`, actions: [
    { label: "Entregar agora", kind: "gold", fn: finish }, { label: "Continuar revisando", kind: "ghost" }
  ] });
}
ACT.askSubmit = askSubmit;
ACT.finishRun = () => finish();
ACT.exitRun = () => {
  const s = state.active, sim = s.mode === "sim", any = s.picks.some(p => p != null);
  sheet({ title: sim ? "Sair do simulado?" : "Sair do treino?", body: `<p>${sim ? "Você pode voltar depois, mas o cronômetro continua correndo, como na prova." : "Você pode pausar e continuar depois. As respostas já dadas ficam salvas."}</p>`, actions: [
    { label: "Continuar respondendo", kind: "gold" },
    { label: "Pausar e voltar ao início", kind: "line", icon: "pause", fn: () => go("home") },
    ...(sim ? [{ label: "Entregar agora", kind: "line", fn: askSubmit }] : any ? [{ label: "Encerrar e ver resultado", kind: "line", fn: finish }] : []),
    { label: sim ? "Descartar simulado" : "Descartar sessão", kind: "danger", fn: () => { discard(); go("home"); } }
  ] });
};
function finish() {
  const s = state.active; if (!s) return;
  stopTick();
  const sim = s.mode === "sim", sec = s.limit ? Math.min(elapsed(s), s.limit) : elapsed(s);
  // No treino, encerrar antes do fim só conta o que foi respondido. No simulado, em branco conta como erro.
  const items = [];
  s.ids.forEach((id, i) => {
    const q = question(i), p = s.picks[i];
    if (!sim && p == null) return;
    const good = p === q.ans;
    if (sim) record(q, good);
    items.push({ q, pick: p, good });
  });
  const ok = items.filter(x => x.good).length;
  if (sim) state.sims.push({ at: Date.now(), n: s.ids.length, ok, sec });
  lastResult = { mode: s.mode, title: s.title, items, ok, sec, sim };
  state.active = null;
  save();
  if (route === "quiz") render(true); else go("quiz");
}

// ── Resultado ─────────────────────────────────────────────────────────────
function renderResult() {
  const r = lastResult, n = r.items.length, bad = r.items.filter(x => !x.good);
  const R = 76, C = 2 * Math.PI * R, ratio = n ? r.ok / n : 0;
  const points = r.ok * POINTS_PER_Q, maxPoints = n * POINTS_PER_Q;
  let head, msg;
  if (r.sim) {
    if (r.ok >= SAFE_OK) { head = "Acima da linha"; msg = `Com ${points} pontos só em Específicos, você já passa dos 50 pontos da nota mínima.`; }
    else if (r.ok >= TARGET_OK) { head = "Na meta"; msg = `Faltou ${plural(SAFE_OK - r.ok, "acerto", "acertos")} para garantir os 50 pontos só com Específicos.`; }
    else { head = "Abaixo da meta"; msg = `A meta é de ${TARGET_OK} acertos ou mais. Os erros já estão no seu caderno.`; }
  } else {
    const p = pct(r.ok, n);
    head = p >= 80 ? "Excelente" : p >= 60 ? "Bom caminho" : "Continue treinando";
    msg = p >= 80 ? "Mantenha o ritmo e varie os assuntos." : p >= 60 ? "Reforce o que errou e tente de novo." : "Use os erros como guia: eles já estão no caderno.";
  }
  const byTopic = {};
  r.items.forEach(x => { (byTopic[x.q.t] = byTopic[x.q.t] || { ok: 0, n: 0 }); byTopic[x.q.t].n++; if (x.good) byTopic[x.q.t].ok++; });
  const review = r.items.map(x => `
    <details class="review">
      <summary><span class="st ${x.good ? "good" : "bad"}">${ico(x.good ? "check" : "x", "s")}</span><span>${esc(x.q.q)}</span></summary>
      <div class="body">
        <span class="tag">${esc(topicName(x.q.t))}${x.q.art === "Geral" ? "" : " · " + esc(x.q.art)}</span>
        ${x.good ? "" : `<span>Sua resposta: ${x.pick == null ? "em branco" : esc(x.q.opts[x.pick])}</span>`}
        <span><b>Correta: ${esc(x.q.opts[x.q.ans])}</b></span>
        <span>${esc(x.q.w)}</span>
      </div>
    </details>`).join("");
  view.innerHTML = `
    <section class="result-hero">
      <span class="kicker" style="color:var(--gold)">${r.sim ? "Nota final" : "Resultado"}</span>
      <div class="gauge" role="img" aria-label="${r.ok} acertos de ${n}">
        <svg viewBox="0 0 176 176"><circle class="bg" cx="88" cy="88" r="${R}"/><circle class="fg" id="gaugeFg" cx="88" cy="88" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
        <div class="num"><b>${r.sim ? points : pct(r.ok, n) + "%"}</b><small>${r.sim ? `de ${maxPoints} pontos` : "de acerto"}</small></div>
      </div>
      <h1>${esc(head)}</h1><p>${esc(msg)}</p>
      <div class="res-meta"><span>${ico("check", "s")}${r.ok} de ${n} acertos</span><span>${ico("clock", "s")}${fmtTime(r.sec)}</span></div>
    </section>
    <div class="stack" style="margin-top:14px">
      ${bad.length ? `<button class="btn gold wide" data-act="trainBad">${ico("target", "s")}Treinar ${plural(bad.length, "erro", "erros")} agora</button>` : ""}
      <div class="row"><button class="btn line" data-act="again">${r.sim ? "Novo simulado" : "Outra sessão"}</button><button class="btn line" data-act="leaveResult">Início</button></div>
    </div>
    ${r.sim ? `<h2 class="section-title">Por assunto</h2><div class="card pad" style="padding-block:6px">${Object.keys(byTopic).map(t => `<div class="sim-row"><span>${esc(topicName(+t))}</span><span class="tagp ${byTopic[t].ok === byTopic[t].n ? "good" : "bad"}">${ico(byTopic[t].ok === byTopic[t].n ? "check" : "x", "s")}${byTopic[t].ok}/${byTopic[t].n}</span></div>`).join("")}</div>` : ""}
    <h2 class="section-title">Revisão das questões</h2>
    <div>${review || `<p class="muted">Nenhuma questão respondida.</p>`}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const g = $("gaugeFg"); if (g) g.setAttribute("stroke-dashoffset", C * (1 - ratio)); }));
}
ACT.trainBad = () => { const ids = lastResult.items.filter(x => !x.good).map(x => x.q.id); startSession({ mode: "custom", title: "Treino dos erros", ids: shuffle(ids) }); };
ACT.again = () => { const sim = lastResult.sim; lastResult = null; if (sim) startSession({ mode: "sim" }); else renderQuiz(); };
ACT.leaveResult = () => { lastResult = null; go("home"); };

// ── CARTÕES ───────────────────────────────────────────────────────────────
let deck = { filter: "all", list: [], i: 0, flip: false };
function buildDeck(mix) {
  const f = deck.filter;
  let list = f === "all" ? CARD_LIST : f === "review" ? CARD_LIST.filter(c => state.review.includes(c.id)) : f === "new" ? CARD_LIST.filter(c => !state.seen.includes(c.id)) : CARD_LIST.filter(c => c.ti === +f);
  deck.list = mix ? shuffle(list) : list.slice(); deck.i = 0; deck.flip = false;
}
function renderCards() {
  if (!deck.list.length && deck.filter === "all") buildDeck();
  const c = deck.list[deck.i], known = state.known.length, revCount = state.review.length;
  const opt = `<option value="all" ${deck.filter === "all" ? "selected" : ""}>Todos os cartões (${CARDS.length})</option><option value="review" ${deck.filter === "review" ? "selected" : ""}>Para revisar (${revCount})</option><option value="new" ${deck.filter === "new" ? "selected" : ""}>Ainda não vistos (${CARDS.length - state.seen.length})</option>` +
    TOPICS.map((t, i) => { const n = CARD_LIST.filter(x => x.ti === i).length; return n ? `<option value="${i}" ${deck.filter === String(i) ? "selected" : ""}>${esc(t.name)} (${n})</option>` : ""; }).join("");
  view.innerHTML = `
    ${pageHead("Memorização ativa", "Cartões", `${known} de ${CARDS.length} marcados como conhecidos. <a href="#notes" style="color:var(--accent);font-weight:600">Ver macetes</a>`)}
    <div class="row" style="margin-bottom:12px"><select id="deckFilter" aria-label="Filtrar cartões" style="flex:1;min-width:0">${opt}</select><button class="icon-btn" data-act="deckShuffle" aria-label="Embaralhar">${ico("shuffle")}</button></div>
    ${c ? `
    <div class="flip-wrap">
      <div class="flip ${deck.flip ? "on" : ""}" id="flipBtn" data-act="flip" role="button" tabindex="0">
        <div class="face front" aria-hidden="${deck.flip}"><div class="face-top"><span>${esc(c.topic)}</span><span>${deck.i + 1}/${deck.list.length}</span></div><div class="main">${esc(c.front)}</div><div class="tap">${ico("refresh", "s")}Toque para ver a resposta</div></div>
        <div class="face back" aria-hidden="${!deck.flip}"><div class="face-top"><span>Resposta</span><span>${deck.i + 1}/${deck.list.length}</span></div><div class="main">${esc(c.back)}</div><div class="tap">Você sabia?</div></div>
      </div>
    </div>
    <div class="row" style="margin-bottom:10px">
      <button class="btn no" data-act="rate" data-v="0" ${deck.flip ? "" : "disabled"}>${ico("x", "s")}Revisar</button>
      <button class="btn ok" data-act="rate" data-v="1" ${deck.flip ? "" : "disabled"}>${ico("check", "s")}Eu sabia</button>
    </div>
    <div class="row"><button class="btn ghost" data-act="deckMove" data-d="-1">${ico("left", "s")}Anterior</button><button class="btn ghost" data-act="deckMove" data-d="1">Próximo${ico("right", "s")}</button></div>
    ` : `<div class="card empty"><span class="tile-ico">${ico("check")}</span><b>Nada por aqui</b><p>${deck.filter === "review" ? "Nenhum cartão para revisar. Os que você marcar como “Preciso revisar” aparecem aqui." : "Você já viu todos os cartões deste filtro."}</p><button class="btn line" data-act="deckAll">Ver todos os cartões</button></div>`}`;
  $("deckFilter").onchange = e => { deck.filter = e.target.value; buildDeck(); renderCards(); };
  const flipEl = $("flipBtn");
  if (flipEl) flipEl.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); ACT.flip(); } };
}
ACT.flip = () => {
  const c = deck.list[deck.i]; if (!c) return;
  deck.flip = !deck.flip;
  if (deck.flip && !state.seen.includes(c.id)) { state.seen.push(c.id); save(); }
  $("flipBtn").classList.toggle("on", deck.flip);
  view.querySelector(".face.front").setAttribute("aria-hidden", deck.flip);
  view.querySelector(".face.back").setAttribute("aria-hidden", !deck.flip);
  view.querySelectorAll("[data-act=rate]").forEach(b => b.disabled = !deck.flip);
};
ACT.rate = d => {
  const c = deck.list[deck.i]; if (!c) return;
  const yes = d.v === "1";
  state.review = state.review.filter(x => x !== c.id);
  if (yes) { if (!state.known.includes(c.id)) state.known.push(c.id); }
  else { state.review.push(c.id); state.known = state.known.filter(x => x !== c.id); }
  save();
  toast(yes ? "Marcado como conhecido" : "Adicionado à revisão");
  deck.i = (deck.i + 1) % deck.list.length; deck.flip = false; renderCards();
};
ACT.deckMove = d => { if (!deck.list.length) return; deck.i = (deck.i + +d.d + deck.list.length) % deck.list.length; deck.flip = false; renderCards(); };
ACT.deckShuffle = () => { buildDeck(true); renderCards(); toast("Cartões embaralhados"); };
ACT.deckAll = () => { deck.filter = "all"; buildDeck(); renderCards(); };

// ── MATÉRIAS ──────────────────────────────────────────────────────────────
function renderTopics() {
  view.innerHTML = `
    ${pageHead("Edital · Conhecimentos Específicos", `${TOPICS.length} matérias`, "A barra mostra as questões já dominadas, com dois acertos seguidos.")}
    <div class="list">${TOPICS.map((t, i) => {
      const s = topicStats(i);
      return `<button class="topic" data-act="openTopic" data-t="${i}"><span class="n">${pad2(i + 1)}</span><span class="txt"><b>${esc(t.name)}</b><small>${esc(t.sub)}</small><small>${s.mastered} de ${s.total} dominadas${s.acc != null ? ` · ${s.acc}% de acerto` : ""}</small><span class="mini" style="display:block"><i style="width:${pct(s.mastered, s.total)}%"></i></span></span>${ico("right", "chev")}</button>`;
    }).join("")}</div>`;
}
ACT.openTopic = d => {
  const i = +d.t, t = TOPICS[i], s = topicStats(i), cards = CARD_LIST.filter(c => c.ti === i).length, notes = MACETES.filter(m => m.t === i).length;
  sheet({ title: t.name, body: `<p>${esc(t.sub)}</p><p style="margin-top:8px">${s.total} questões · ${cards} cartões · ${notes} macetes${s.acc != null ? ` · ${s.acc}% de acerto` : ""}</p>`, actions: [
    { label: "Treinar questões", kind: "gold", icon: "quiz", fn: () => ACT.trainTopic({ t: i }) },
    { label: "Ver cartões", icon: "cards", fn: () => { deck.filter = String(i); buildDeck(); go("cards"); } },
    { label: "Ver macetes", icon: "bulb", fn: () => { notesFilter = { q: "", t: String(i) }; go("notes"); } },
    { label: "Fechar", kind: "ghost" }
  ] });
};

// ── MACETES ───────────────────────────────────────────────────────────────
let notesFilter = { q: "", t: "all" };
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function notesHtml() {
  const q = norm(notesFilter.q.trim());
  const match = MACETES.filter(m => (notesFilter.t === "all" || m.t === +notesFilter.t) && (!q || norm(m.title + " " + m.tag + " " + m.text + " " + topicName(m.t)).includes(q)));
  if (!match.length) return `<div class="card empty"><span class="tile-ico" style="background:var(--surface-3);color:var(--text-2)">${ico("search")}</span><b>Nada encontrado</b><p>Tente outra palavra, como “flagrante”, “LIMPE” ou “153”.</p></div>`;
  const groups = {}; match.forEach(m => (groups[m.t] = groups[m.t] || []).push(m));
  return Object.keys(groups).map(t => `
    <div class="group-head"><b>${esc(topicName(+t))}</b><a href="#quiz" data-act="trainTopic" data-t="${t}">Treinar</a></div>
    <div class="list">${groups[t].map(m => `<article class="card note"><h3><span>${esc(m.title)}</span><em>${esc(m.tag)}</em></h3><p>${esc(m.text)}</p></article>`).join("")}</div>`).join("");
}
function renderNotes() {
  view.innerHTML = `
    ${pageHead("Revisão expressa", "Macetes", "O que a banca costuma trocar, por assunto. Leia em voz alta na véspera.")}
    <div class="search">${ico("search")}<input class="input" id="noteQ" type="search" placeholder="Buscar: flagrante, LIMPE, 153…" aria-label="Buscar macetes" value="${esc(notesFilter.q)}"></div>
    <select id="noteT" aria-label="Filtrar por assunto"><option value="all">Todos os assuntos</option>${TOPICS.map((t, i) => `<option value="${i}" ${notesFilter.t === String(i) ? "selected" : ""}>${pad2(i + 1)} · ${esc(t.name)}</option>`).join("")}</select>
    <div id="noteList">${notesHtml()}</div>`;
  $("noteQ").oninput = e => { notesFilter.q = e.target.value; $("noteList").innerHTML = notesHtml(); };
  $("noteT").onchange = e => { notesFilter.t = e.target.value; $("noteList").innerHTML = notesHtml(); };
}

// ── CADERNO DE ERROS ──────────────────────────────────────────────────────
function renderErrors() {
  const e = errorList().sort((a, b) => state.h[b.id].w - state.h[a.id].w);
  view.innerHTML = `
    ${pageHead("Caderno automático", "Meus erros", "Cada erro entra aqui sozinho e sai depois de dois acertos seguidos.")}
    ${e.length ? `
      <button class="btn gold wide" data-act="startErrors" style="margin-bottom:14px">${ico("target", "s")}Treinar ${plural(e.length, "erro", "erros")}</button>
      ${e.map(q => { const h = state.h[q.id]; return `
        <details class="review">
          <summary><span class="st bad">${ico("x", "s")}</span><span>${esc(q.q)}</span></summary>
          <div class="body">
            <span class="tag">${esc(topicName(q.t))}${q.art === "Geral" ? "" : " · " + esc(q.art)} · ${plural(h.w, "erro", "erros")}</span>
            <span><b>Correta: ${esc(correctText(q))}</b></span>
            <span>${esc(q.w)}</span>
            <button class="btn line small" style="justify-self:start" data-act="mastered" data-id="${q.id}">${ico("check", "s")}Já dominei</button>
          </div>
        </details>`; }).join("")}`
    : `<div class="card empty"><span class="tile-ico">${ico("check")}</span><b>Nenhum erro pendente</b><p>${state.answered ? "Bom trabalho. Siga treinando para manter o caderno limpo." : "Responda questões e seus erros aparecem aqui, prontos para revisão."}</p><a class="btn line" href="#quiz">Ir para as questões</a></div>`}`;
}
ACT.mastered = d => {
  const h = hist(d.id); h.m = 1; save(); renderErrors();
  toast("Removida do caderno", { label: "Desfazer", fn: () => { delete hist(d.id).m; save(); renderErrors(); } });
};

// ── PROGRESSO ─────────────────────────────────────────────────────────────
function simChart() {
  const sims = state.sims.slice(-12);
  if (!sims.length) return `<p class="muted small">Faça seu primeiro simulado para ver a evolução aqui.</p>`;
  const W = Math.max(Math.round(view.clientWidth - 2 * parseFloat(getComputedStyle(view).paddingLeft) - 34), 240), H = 190, L = 28, R = 12, T = 14, B = 12, Y = v => T + (H - T - B) * (1 - v / 60);
  const X = i => sims.length === 1 ? (L + W - R) / 2 : L + (W - L - R) * i / (sims.length - 1);
  const pts = sims.map((s, i) => [X(i), Y(s.ok * POINTS_PER_Q), s]);
  const meta = TARGET_OK * POINTS_PER_Q;
  const data = pts.map(([x, y, s]) => `${x.toFixed(1)},${y.toFixed(1)},${s.ok * POINTS_PER_Q},${new Date(s.at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`).join("|");
  return `<svg class="chart" id="simChart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pontos nos últimos ${sims.length} simulados. O mais recente: ${sims[sims.length - 1].ok * POINTS_PER_Q} de 60." data-pts="${data}">
    ${[0, 20, 40, 60].map(v => `<line class="gridl" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 7}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
    <line class="meta" x1="${L}" x2="${W - R}" y1="${Y(meta)}" y2="${Y(meta)}"/><text x="${L + 4}" y="${Y(meta) - 5}">meta ${meta}</text>
    ${pts.length > 1 ? `<polyline class="ln" points="${pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}"/>` : ""}
    ${pts.map(p => `<circle class="pt" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5"/>`).join("")}
    <text x="${pts[pts.length - 1][0]}" y="${Math.max(pts[pts.length - 1][1] - 11, 11)}" text-anchor="${pts.length > 1 ? "end" : "middle"}" style="font-weight:600;fill:var(--text)">${sims[sims.length - 1].ok * POINTS_PER_Q}</text>
  </svg>`;
}
function wireChart() {
  const svg = $("simChart"); if (!svg) return;
  const pts = svg.dataset.pts.split("|").map(s => { const [x, y, v, d] = s.split(","); return { x: +x, y: +y, v, d }; });
  const box = svg.parentElement; let tip;
  const show = e => {
    const r = svg.getBoundingClientRect(), k = r.width / svg.viewBox.baseVal.width, mx = (e.clientX - r.left) / k;
    const p = pts.reduce((a, b) => Math.abs(b.x - mx) < Math.abs(a.x - mx) ? b : a);
    if (!tip) { tip = document.createElement("div"); tip.className = "tip"; box.appendChild(tip); }
    tip.textContent = `${p.d} · ${p.v} pontos`;
    const br = box.getBoundingClientRect();
    tip.style.left = Math.min(Math.max(r.left - br.left + p.x * k, 60), br.width - 60) + "px";
    tip.style.top = (r.top - br.top + p.y * k) + "px";
  };
  svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show);
  svg.addEventListener("pointerleave", () => { if (tip) { tip.remove(); tip = null; } });
}
function heatmap() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today); start.setDate(start.getDate() - 34);
  const level = n => !n ? "" : n < 10 ? "l1" : n < 20 ? "l2" : n < 40 ? "l3" : "l4";
  let cells = "", total = 0;
  for (let i = 0; i < 35; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const n = state.days[dayKey(d)] || 0; if (n) total++;
    const label = `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}: ${plural(n, "questão", "questões")}`;
    cells += `<i class="${level(n)} ${i === 34 ? "today" : ""}" title="${label}"></i>`;
  }
  return `<div class="heat" role="img" aria-label="Estudou em ${plural(total, "dia", "dias")} nos últimos 35 dias">${cells}</div>
    <div class="heat-legend"><span style="margin-right:4px">Menos</span><i style="background:var(--heat-0)"></i><i style="background:var(--heat-1)"></i><i style="background:var(--heat-2)"></i><i style="background:var(--heat-3)"></i><i style="background:var(--heat-4)"></i><span style="margin-left:4px">Mais questões</span></div>`;
}
let installEvt = null;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
function renderStats() {
  const r = rank(), total = state.answered;
  const tp = TOPICS.map((t, i) => ({ i, name: t.name, ...topicStats(i) })).filter(x => x.tries).sort((a, b) => a.acc - b.acc);
  const chevs = Array.from({ length: 5 }, (_, k) => `<i class="${k < Math.ceil((r.i + 1) / 2) ? "" : "off"}"></i>`).join("");
  const seg = (k, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-act="setPref" data-k="${k}" data-v="${v}" aria-pressed="${String(state.prefs[k]) === String(v)}">${l}</button>`).join("")}</div>`;
  view.innerHTML = `
    ${pageHead("Acompanhe sua evolução", "Progresso")}
    <section class="rank">
      <div class="chevs" aria-hidden="true">${chevs}</div>
      <div class="txt"><small>Sua graduação de estudo</small><b>${esc(r.name)}</b>
        <div class="meter" aria-hidden="true"><i style="transform:scaleX(${r.prog})"></i></div>
        <small>${r.next ? `${r.need} pontos para ${esc(r.next)}` : "Graduação máxima"} · 1 ponto por acerto ou cartão conhecido</small></div>
    </section>
    <div class="kpis" style="margin-top:12px">
      <div class="kpi"><b>${total ? accuracy() + "%" : "–"}</b><span>de acerto</span></div>
      <div class="kpi"><b>${total}</b><span>questões feitas</span></div>
      <div class="kpi"><b>${state.correct}</b><span>acertos</span></div>
      <div class="kpi"><b>${streak()}</b><span>dias seguidos</span></div>
    </div>
    <h2 class="section-title">Simulados</h2>
    <div class="card chart-card"><h3>Pontos em Específicos</h3><p>Meta: ${TARGET_OK} acertos (${TARGET_OK * POINTS_PER_Q} pontos). Com ${SAFE_OK} (${SAFE_OK * POINTS_PER_Q}), você passa da nota mínima.</p>${simChart()}</div>
    ${state.sims.length ? `<div class="card pad" style="padding-block:6px;margin-top:10px">${state.sims.slice(-6).reverse().map(s => { const ok = s.ok >= TARGET_OK; return `<div class="sim-row"><span>${new Date(s.at).toLocaleDateString("pt-BR")} · ${fmtTime(s.sec)}</span><span style="display:flex;align-items:center;gap:10px"><span class="tagp ${ok ? "good" : "bad"}">${ico(ok ? "check" : "x", "s")}${ok ? "Na meta" : "Abaixo"}</span><b>${s.ok * POINTS_PER_Q}</b></span></div>`; }).join("")}</div>` : ""}
    <h2 class="section-title">Ritmo</h2>
    <div class="card chart-card"><h3>Últimos 35 dias</h3><p>Questões respondidas por dia.</p>${heatmap()}</div>
    <h2 class="section-title">Por assunto · do mais fraco ao mais forte</h2>
    <div class="card pad" style="padding-block:6px">${tp.length ? tp.map(x => `
      <button class="tbar" data-act="openTopic" data-t="${x.i}">
        <span class="r"><span>${esc(x.name)}</span><b>${x.acc}%</b></span>
        <span class="tr" style="display:block"><i style="width:${x.acc}%"></i></span>
        <small>${plural(x.tries, "resposta", "respostas")}</small>
      </button>`).join("") : `<p class="muted small" style="padding:12px 0">Responda questões para ver seu desempenho por assunto.</p>`}</div>
    <h2 class="section-title">Ajustes</h2>
    <div class="card pad">
      <div class="set-row"><b>Aparência</b>${seg("theme", [["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]])}</div>
      <div class="set-row"><b>Meta diária</b>${seg("goal", [[10, "10"], [20, "20"], [30, "30"], [50, "50"]])}</div>
      <div class="set-row"><b>Backup</b><p class="hint">O progresso fica só neste aparelho. Exporte para não perder.</p>
        <div class="row"><button class="btn line small" data-act="exportData">${ico("down", "s")}Exportar</button><button class="btn line small" data-act="importData">${ico("up", "s")}Importar</button></div>
        <input type="file" id="importFile" accept="application/json,.json" hidden></div>
      ${isStandalone() ? "" : `<div class="set-row"><b>Aplicativo</b><button class="btn line small" data-act="install">${ico("plus", "s")}Instalar na tela inicial</button></div>`}
      <div class="set-row"><button class="btn danger small" data-act="resetData">${ico("trash", "s")}Apagar meu progresso</button></div>
    </div>
    <p class="foot-note">${ALL.length} questões · ${CARDS.length} cartões · ${MACETES.length} macetes. Material de treino: confira sempre a lei e o edital oficiais.</p>`;
  wireChart();
  $("importFile").onchange = onImportFile;
}
ACT.setPref = d => {
  state.prefs[d.k] = d.k === "goal" ? +d.v : d.v;
  save(); applyTheme(); renderStats();
};
function applyTheme() {
  const t = state.prefs.theme, root = document.documentElement;
  if (t === "auto") delete root.dataset.theme; else root.dataset.theme = t;
}
ACT.exportData = async () => {
  const name = `gcm-cubatao-backup-${dayKey()}.json`, text = JSON.stringify({ ...state, active: null });
  const file = new File([text], name, { type: "application/json" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia("(pointer:coarse)").matches) { await navigator.share({ files: [file], title: "Backup GCM Cubatão" }); return; }
  } catch (e) { if (e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Backup exportado");
};
ACT.importData = () => $("importFile").click();
async function onImportFile(e) {
  const f = e.target.files[0]; if (!f) return;
  let data;
  try { data = JSON.parse(await f.text()); if (!data || typeof data !== "object" || typeof data.h !== "object") throw 0; }
  catch (err) { toast("Arquivo inválido. Use um backup exportado por este app."); e.target.value = ""; return; }
  e.target.value = "";
  sheet({ title: "Substituir o progresso?", body: `<p>O backup tem ${plural(data.answered || 0, "questão respondida", "questões respondidas")} e ${plural((data.sims || []).length, "simulado", "simulados")}. O progresso atual deste aparelho será trocado por ele.</p>`, actions: [
    { label: "Importar backup", kind: "gold", fn: () => { state = hydrate({ ...data, active: null }); stopTick(); save(); applyTheme(); render(); toast("Backup importado"); } },
    { label: "Cancelar", kind: "ghost" }
  ] });
}
ACT.resetData = () => sheet({ title: "Apagar todo o progresso?", body: `<p>Respostas, simulados, cartões e caderno de erros deste aparelho serão apagados. Isso não pode ser desfeito. Se quiser guardar, exporte um backup antes.</p>`, actions: [
  { label: "Apagar tudo", kind: "danger", icon: "trash", fn: () => { const prefs = state.prefs; state = blank(); state.prefs = prefs; lastResult = null; stopTick(); save(); render(); toast("Progresso apagado"); } },
  { label: "Cancelar", kind: "ghost" }
] });
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; });
ACT.install = async () => {
  if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; return; }
  sheet({ title: "Instalar na tela inicial", body: `<ol class="steps"><li>No iPhone, abra este endereço no Safari.</li><li>Toque em Compartilhar.</li><li>Escolha “Adicionar à Tela de Início”.</li></ol><p style="margin-top:10px">No Android, use o menu do Chrome e escolha “Instalar app”.</p>`, actions: [{ label: "Entendi", kind: "gold" }] });
};

// ── Teclado no quiz ───────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (route !== "quiz" || !state.active || $("sheet").open || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase(), s = state.active, map = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
  if (k in map) { e.preventDefault(); ACT.pick({ k: map[k] }); return; }
  if (s.mode === "sim") {
    if (e.key === "ArrowRight") ACT.move({ d: 1 });
    if (e.key === "ArrowLeft") ACT.move({ d: -1 });
  } else if ((e.key === "Enter" || e.key === "ArrowRight") && s.picks[s.cur] != null) {
    e.preventDefault();
    s.cur === s.ids.length - 1 ? finish() : ACT.next();
  }
});

// ── Inicialização ─────────────────────────────────────────────────────────
function restoreSession() {
  const s = state.active; if (!s) return;
  const valid = Array.isArray(s.ids) && s.ids.length && s.ids.every(id => BY_ID.has(id)) && Array.isArray(s.picks) && Array.isArray(s.orders);
  if (!valid) { state.active = null; save(); return; }
  s.flags = s.flags || [];
  startTick();
  if (s.limit && elapsed(s) >= s.limit) finish();
}
applyTheme();
restoreSession();
render();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("./sw.js").catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController) toast("App atualizado. Reabra para ver as novidades."); });
  });
}
