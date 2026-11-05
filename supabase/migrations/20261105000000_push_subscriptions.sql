-- Inscrições de lembrete diário. Sem login: cada linha é um navegador/aparelho.
create table if not exists public.push_subscriptions (
  endpoint      text primary key,
  p256dh        text not null,
  auth          text not null,
  hour          smallint not null check (hour between 0 and 23),
  tz            text not null default 'America/Sao_Paulo',
  concurso      text,
  concurso_name text,
  exam_date     date,
  last_study    date,
  streak        integer not null default 0,
  weak          text,
  goal          integer,
  last_sent     date,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Ninguém de fora lê ou grava direto: só as Edge Functions, com a service role.
alter table public.push_subscriptions enable row level security;
