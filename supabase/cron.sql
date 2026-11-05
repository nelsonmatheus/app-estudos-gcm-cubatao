-- Rode UMA vez no SQL Editor do Supabase, depois de publicar as funções.
-- O script configurar-notificacoes.ps1 troca SEU_SEGREDO pelo valor de CRON_SECRET e copia este SQL.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Se já existir, recria.
select cron.unschedule('lembrete-diario') where exists (select 1 from cron.job where jobname = 'lembrete-diario');

select cron.schedule(
  'lembrete-diario',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://rueeyibvueukgsvfttmn.supabase.co/functions/v1/push-send',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'SEU_SEGREDO'),
    body    := '{}'::jsonb
  );
  $$
);
