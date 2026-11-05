// push-send: chamada de hora em hora pelo pg_cron. Envia o lembrete para quem escolheu este horário,
// ainda não recebeu hoje e ainda não estudou hoje. Remove inscrições que o navegador invalidou.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { buildMessage, localNow, shouldSend } from "./messages.js";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:contato@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("unauthorized", { status: 401 });
  }
  const now = new Date();
  // {"teste": true} no corpo: envia agora para todas as inscrições ativas, ignorando horário (para conferir a configuração).
  const teste = await req.json().then((b) => b?.teste === true).catch(() => false);
  const { data: subs, error } = await db.from("push_subscriptions").select("*").eq("active", true);
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0, removed = 0, skipped = 0;
  for (const sub of subs ?? []) {
    if (!teste && !shouldSend(sub, now)) { skipped++; continue; }
    const msg = buildMessage(sub, now);
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(msg),
        { TTL: 6 * 3600, urgency: "normal" },
      );
      if (!teste) await db.from("push_subscriptions").update({ last_sent: localNow(sub.tz, now).date }).eq("endpoint", sub.endpoint);
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint); removed++; }
      else console.error("push falhou", code, (e as Error).message);
    }
  }
  return Response.json({ sent, removed, skipped });
});
