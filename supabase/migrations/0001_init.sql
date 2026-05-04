-- Road to 1K — Reto FÓRMULA 100K — schema inicial.
-- Edición 11 de mayo 2026. 42 días, 100 participantes esperadas.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Reto config (single row). Permite cambiar fechas sin redeploy.
-- ---------------------------------------------------------------------------
create table public.challenge (
  id              int primary key default 1,
  edition_label   text        not null default '11 de mayo 2026',
  start_date      date        not null default '2026-05-11',
  end_date        date        not null default '2026-06-21',
  total_days      int         not null default 42,
  checkpoint_1    date        not null default '2026-05-24',
  checkpoint_2    date        not null default '2026-06-07',
  checkpoint_3    date        not null default '2026-06-21',
  signup_deadline date        not null default '2026-05-10',
  constraint single_row check (id = 1)
);

insert into public.challenge (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Participants. Una fila por persona inscrita.
-- ---------------------------------------------------------------------------
create type public.user_role   as enum ('participant', 'admin');
create type public.signup_state as enum ('pending', 'approved', 'rejected');

create table public.participants (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text        not null unique,
  full_name             text        not null,
  instagram_handle      text        not null,         -- sin @, lowercase
  rubro                 text,
  followers_initial     int         not null default 0,
  followers_final       int,
  role                  user_role   not null default 'participant',
  state                 signup_state not null default 'pending',
  created_at            timestamptz not null default now(),
  approved_at           timestamptz,
  notes                 text                              -- notas internas de Andrea
);

create unique index participants_ig_unique on public.participants (lower(instagram_handle));

-- ---------------------------------------------------------------------------
-- Daily submissions. Un row por (participante, día). Día 1..42.
-- ---------------------------------------------------------------------------
create type public.submission_status as enum ('pending_review', 'valid', 'invalid', 'duplicate');
create type public.analysis_status   as enum ('idle', 'queued', 'running', 'done', 'error');

create table public.daily_submissions (
  id                  uuid primary key default uuid_generate_v4(),
  participant_id      uuid not null references public.participants(id) on delete cascade,
  day_number          int  not null check (day_number between 1 and 42),
  reel_url            text not null,
  hook_screenshot_path text,                            -- path en Storage bucket "hooks"
  observations        text,
  status              submission_status not null default 'valid',
  analysis_status     analysis_status   not null default 'idle',
  analysis_result     jsonb,                            -- output de Gemini
  analysis_input_hash text,                             -- para cache
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (participant_id, day_number)
);

create index daily_submissions_participant_idx on public.daily_submissions (participant_id, day_number);
create index daily_submissions_status_idx      on public.daily_submissions (status);

-- ---------------------------------------------------------------------------
-- Checkpoints (3 por participante: día 14, 28, 42).
-- ---------------------------------------------------------------------------
create table public.checkpoints (
  id              uuid primary key default uuid_generate_v4(),
  participant_id  uuid not null references public.participants(id) on delete cascade,
  cp_number       int  not null check (cp_number in (1, 2, 3)),
  reach           int  not null default 0,           -- alcance 14d
  interactions    int  not null default 0,           -- interacciones 14d
  drive_link      text,                              -- link a la carpeta Drive con capturas
  validated       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (participant_id, cp_number)
);

-- ---------------------------------------------------------------------------
-- Sales evidence (bonus 0-100).
-- ---------------------------------------------------------------------------
create table public.sales_evidence (
  id              uuid primary key default uuid_generate_v4(),
  participant_id  uuid not null references public.participants(id) on delete cascade,
  amount_usd      numeric(10,2) not null check (amount_usd >= 0),
  evidence_url    text  not null,
  description     text,
  validated       boolean not null default false,
  created_at      timestamptz not null default now()
);

create index sales_evidence_participant_idx on public.sales_evidence (participant_id);

-- ---------------------------------------------------------------------------
-- Trigger updated_at.
-- ---------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_daily_submissions_updated_at
  before update on public.daily_submissions
  for each row execute function public.tg_set_updated_at();

create trigger trg_checkpoints_updated_at
  before update on public.checkpoints
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- Vista: stats agregadas por participante (insumo del leaderboard).
-- ---------------------------------------------------------------------------
create or replace view public.participant_stats as
select
  p.id,
  p.full_name,
  p.instagram_handle,
  p.followers_initial,
  p.followers_final,
  coalesce(p.followers_final, p.followers_initial) - p.followers_initial as followers_gained,
  coalesce(sum(c.reach),        0) as total_reach,
  coalesce(sum(c.interactions), 0) as total_interactions,
  coalesce((select sum(s.amount_usd) from public.sales_evidence s
            where s.participant_id = p.id and s.validated), 0) as total_sales_usd,
  (select count(*) from public.daily_submissions d
    where d.participant_id = p.id and d.status = 'valid') as valid_days
from public.participants p
left join public.checkpoints c on c.participant_id = p.id
where p.state = 'approved'
group by p.id;

-- ---------------------------------------------------------------------------
-- Función: ranking proporcional sobre cada categoría → puntos finales.
-- max_pts: 450 seguidores, 300 alcance, 150 interacciones, 100 bonus ventas.
-- El máximo de cada categoría obtiene el max; resto se asigna proporcionalmente
-- al valor (no al rank), de modo que un caso extremo sí se castiga al estilo
-- "proporcional al máximo". Si el reto pide ranking estricto se ajusta acá.
-- ---------------------------------------------------------------------------
create or replace function public.compute_leaderboard()
returns table (
  participant_id     uuid,
  full_name          text,
  instagram_handle   text,
  followers_gained   int,
  total_reach        int,
  total_interactions int,
  total_sales_usd    numeric,
  pts_followers      numeric,
  pts_reach          numeric,
  pts_interactions   numeric,
  pts_sales          numeric,
  pts_total          numeric
)
language sql stable as $$
  with s as (select * from public.participant_stats),
  m as (
    select
      greatest(max(followers_gained),   1) as max_followers,
      greatest(max(total_reach),        1) as max_reach,
      greatest(max(total_interactions), 1) as max_interactions,
      greatest(max(total_sales_usd),    1) as max_sales
    from s
  )
  select
    s.id                 as participant_id,
    s.full_name,
    s.instagram_handle,
    s.followers_gained,
    s.total_reach,
    s.total_interactions,
    s.total_sales_usd,
    round(450 * greatest(s.followers_gained, 0)::numeric / m.max_followers,    2) as pts_followers,
    round(300 * s.total_reach::numeric        / m.max_reach,                   2) as pts_reach,
    round(150 * s.total_interactions::numeric / m.max_interactions,            2) as pts_interactions,
    round(100 * s.total_sales_usd::numeric    / m.max_sales,                   2) as pts_sales,
    round(
      450 * greatest(s.followers_gained, 0)::numeric / m.max_followers
    + 300 * s.total_reach::numeric        / m.max_reach
    + 150 * s.total_interactions::numeric / m.max_interactions
    + 100 * s.total_sales_usd::numeric    / m.max_sales
    , 2) as pts_total
  from s, m
  order by pts_total desc;
$$;

-- ---------------------------------------------------------------------------
-- Vista materializada: leaderboard. Refresca on-demand desde RPC `refresh_leaderboard`.
-- (Las MV no aceptan suscripción Realtime directa; el cliente se suscribe a la
-- tabla mirror que mantenemos sincronizada).
-- ---------------------------------------------------------------------------
create table public.leaderboard (
  participant_id     uuid primary key references public.participants(id) on delete cascade,
  full_name          text,
  instagram_handle   text,
  followers_gained   int,
  total_reach        int,
  total_interactions int,
  total_sales_usd    numeric,
  pts_followers      numeric,
  pts_reach          numeric,
  pts_interactions   numeric,
  pts_sales          numeric,
  pts_total          numeric,
  position           int,
  refreshed_at       timestamptz not null default now()
);

create or replace function public.refresh_leaderboard()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.leaderboard;
  insert into public.leaderboard (
    participant_id, full_name, instagram_handle,
    followers_gained, total_reach, total_interactions, total_sales_usd,
    pts_followers, pts_reach, pts_interactions, pts_sales, pts_total, position
  )
  select
    l.participant_id, l.full_name, l.instagram_handle,
    l.followers_gained, l.total_reach, l.total_interactions, l.total_sales_usd,
    l.pts_followers, l.pts_reach, l.pts_interactions, l.pts_sales, l.pts_total,
    row_number() over (order by l.pts_total desc, l.followers_gained desc) as position
  from public.compute_leaderboard() l;
end $$;

-- Refresca leaderboard tras INSERT/UPDATE/DELETE en datos clave.
create or replace function public.tg_refresh_leaderboard()
returns trigger language plpgsql as $$
begin
  perform public.refresh_leaderboard();
  return null;
end $$;

create trigger trg_refresh_lb_participants
  after insert or update or delete on public.participants
  for each statement execute function public.tg_refresh_leaderboard();

create trigger trg_refresh_lb_checkpoints
  after insert or update or delete on public.checkpoints
  for each statement execute function public.tg_refresh_leaderboard();

create trigger trg_refresh_lb_sales
  after insert or update or delete on public.sales_evidence
  for each statement execute function public.tg_refresh_leaderboard();

-- ---------------------------------------------------------------------------
-- Helper: resuelve el participante actual desde auth.uid().
-- ---------------------------------------------------------------------------
create or replace function public.current_participant()
returns public.participants
language sql stable security definer set search_path = public as $$
  select * from public.participants where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.participants
    where id = auth.uid() and role = 'admin'
  );
$$;
