// push-subscribe: o app chama esta função para ativar (POST), atualizar o resumo (POST) ou desativar (DELETE).
// Não há login: a chave é o endpoint da inscrição, que só o navegador da pessoa conhece.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://nelsonmatheus.github.io").split(",").map((s) => s.trim());
// Só aceita endpoints dos serviços de push dos navegadores.
const PUSH_HOSTS = [/\.googleapis\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/, /\.mozilla\.com$/, /\.mozaws\.net$/];

function cors(origin: string | null) {
  const allow = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
const str = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : null);
const isDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (!["POST", "DELETE"].includes(req.method)) return new Response("method", { status: 405, headers });

  let b: Record<string, any>;
  try { b = await req.json(); } catch { return new Response("json", { status: 400, headers }); }

  let host = "";
  try { host = new URL(b.endpoint).hostname; } catch { /* inválido */ }
  if (!host || !PUSH_HOSTS.some((r) => r.test(host)) || String(b.endpoint).length > 1000) {
    return new Response("endpoint", { status: 400, headers });
  }

  if (req.method === "DELETE") {
    await db.from("push_subscriptions").delete().eq("endpoint", b.endpoint);
    return Response.json({ ok: true }, { headers });
  }

  const hour = Number(b.hour);
  if (!b.keys?.p256dh || !b.keys?.auth || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    return new Response("dados", { status: 400, headers });
  }
  const row = {
    endpoint: b.endpoint,
    p256dh: str(b.keys.p256dh, 200), auth: str(b.keys.auth, 100),
    hour, tz: str(b.tz, 64) ?? "America/Sao_Paulo",
    concurso: str(b.concurso, 20), concurso_name: str(b.concursoName, 60),
    exam_date: isDate(b.examDate), last_study: isDate(b.lastStudy),
    streak: Math.max(0, Math.min(Number(b.streak) || 0, 3650)),
    weak: str(b.weak, 80), goal: Math.max(0, Math.min(Number(b.goal) || 0, 500)),
    active: true, updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("push_subscriptions").upsert(row, { onConflict: "endpoint" });
  if (error) return new Response(error.message, { status: 500, headers });
  return Response.json({ ok: true }, { headers });
});
