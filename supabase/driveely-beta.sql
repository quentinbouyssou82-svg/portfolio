-- Driveely — préparation beta (10-20 livreurs)
-- Exécuter après : margeo-setup.sql → margeo-rls.sql → driveely-migrate.sql → driveely-backend-v2.sql

-- ─── Champs nullable (ne pas inventer de valeurs) ───
alter table public.margeo_rides
  alter column distance_km drop not null,
  alter column duration_min drop not null;

alter table public.margeo_rides
  add column if not exists missing_fields jsonb not null default '[]',
  add column if not exists extraction_quality text not null default 'complete'
    check (extraction_quality in ('complete', 'partial', 'failed'));

-- ─── Premium (sans Stripe — activation manuelle ou future webhook) ───
alter table public.margeo_profiles
  add column if not exists premium_until timestamptz,
  add column if not exists premium_source text
    check (premium_source is null or premium_source in ('manual', 'beta', 'stripe', 'trial'));

-- ─── Télémétrie beta (métriques produit) ───
create table if not exists public.margeo_beta_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type in (
    'analysis_started',
    'analysis_success',
    'analysis_failed',
    'vision_low_confidence',
    'feedback_submitted'
  )),
  analysis_id uuid references public.margeo_analyses (id) on delete set null,
  duration_ms integer,
  vision_source text,
  vision_confidence numeric(4, 3),
  error_code text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists margeo_beta_events_user_created_idx
  on public.margeo_beta_events (user_id, created_at desc);

create index if not exists margeo_beta_events_type_created_idx
  on public.margeo_beta_events (event_type, created_at desc);

alter table public.margeo_beta_events enable row level security;

-- Utilisateur : lecture de ses propres événements uniquement
drop policy if exists margeo_beta_events_select_own on public.margeo_beta_events;
create policy margeo_beta_events_select_own on public.margeo_beta_events
  for select using (auth.uid() = user_id);

-- Pas d'insert/update/delete côté client — écriture via service_role (API serveur)

-- ─── Renfort RLS location_logs (lecture propre) ───
alter table public.margeo_location_logs enable row level security;

drop policy if exists margeo_location_logs_update_block on public.margeo_location_logs;
create policy margeo_location_logs_update_block on public.margeo_location_logs
  for update using (false);

drop policy if exists margeo_location_logs_delete_own on public.margeo_location_logs;
create policy margeo_location_logs_delete_own on public.margeo_location_logs
  for delete using (auth.uid() = user_id);

-- ─── Vue agrégée beta (dashboard interne Supabase) ───
create or replace view public.driveely_beta_stats as
select
  date_trunc('day', created_at) as day,
  event_type,
  count(*) as event_count,
  avg(duration_ms) filter (where duration_ms is not null) as avg_duration_ms,
  avg(vision_confidence) filter (where vision_confidence is not null) as avg_confidence,
  count(*) filter (where error_code is not null) as error_count
from public.margeo_beta_events
group by 1, 2
order by 1 desc, 2;
