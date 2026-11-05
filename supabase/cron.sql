-- Rode UMA vez no SQL Editor do Supabase, depois de publicar as funções.
-- Troque SEU_PROJETO pela referência do projeto e SEU_SEGREDO pelo mesmo valor de CRON_SECRET.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'lembrete-diario',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://SEU_PROJETO.supabase.co/functions/v1/push-send',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'SEU_SEGREDO'),
    body    := '{}'::jsonb
  );
  $$
);
