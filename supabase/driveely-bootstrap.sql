-- Driveely bootstrap — ne pas modifier à la main

-- ═══ margeo-setup.sql ═══
-- Margeo — MVP beta (auth.users + profils livreurs)
-- Exécuter dans Supabase → SQL Editor, puis margeo-rls.sql

-- Profil conducteur (1:1 avec auth.users)
create table if not exists public.margeo_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  city text not null default '',
  vehicle text not null default 'scooter'
    check (vehicle in ('velo', 'scooter', 'voiture')),
  cost_per_km numeric(6, 3) not null default 0.24,
  target_hourly numeric(6, 2) not null default 16,
  daily_target numeric(8, 2) not null default 90,
  platforms text[] not null default '{}',
  premium boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Courses extraites des captures d'écran
create table if not exists public.margeo_rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null,
  pickup text not null default '',
  dropoff text not null default '',
  payout numeric(8, 2) not null,
  distance_km numeric(8, 2) not null,
  duration_min integer not null,
  empty_return_km numeric(8, 2) not null default 0,
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists margeo_rides_user_created_idx
  on public.margeo_rides (user_id, created_at desc);

-- Résultats d'analyse Margeo
create table if not exists public.margeo_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ride_id uuid not null references public.margeo_rides (id) on delete cascade,
  gross_gain numeric(8, 2) not null,
  estimated_cost numeric(8, 2) not null,
  net_gain numeric(8, 2) not null,
  hourly_rate numeric(8, 2) not null,
  score integer not null check (score >= 0 and score <= 100),
  verdict text not null check (verdict in ('accept', 'check', 'refuse')),
  explanation text not null default '',
  insights jsonb not null default '[]',
  score_breakdown jsonb not null default '[]',
  analyzed_at timestamptz not null default now()
);

create index if not exists margeo_analyses_user_analyzed_idx
  on public.margeo_analyses (user_id, analyzed_at desc);

create index if not exists margeo_analyses_ride_idx
  on public.margeo_analyses (ride_id);

-- Feedback post-course (acceptation + résultat réel)
create table if not exists public.margeo_feedback (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique references public.margeo_analyses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  accepted boolean,
  actual_duration_min integer,
  actual_gain numeric(8, 2),
  actual_distance_km numeric(8, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists margeo_feedback_user_idx
  on public.margeo_feedback (user_id, created_at desc);

-- Trigger : profil auto à l'inscription
create or replace function public.margeo_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.margeo_profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists margeo_on_auth_user_created on auth.users;
create trigger margeo_on_auth_user_created
  after insert on auth.users
  for each row execute function public.margeo_handle_new_user();

-- updated_at automatique
create or replace function public.margeo_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists margeo_profiles_updated_at on public.margeo_profiles;
create trigger margeo_profiles_updated_at
  before update on public.margeo_profiles
  for each row execute function public.margeo_set_updated_at();

drop trigger if exists margeo_feedback_updated_at on public.margeo_feedback;
create trigger margeo_feedback_updated_at
  before update on public.margeo_feedback
  for each row execute function public.margeo_set_updated_at();


-- ═══ margeo-rls.sql ═══
-- Margeo — Row Level Security
-- Exécuter après margeo-setup.sql

alter table public.margeo_profiles enable row level security;
alter table public.margeo_rides enable row level security;
alter table public.margeo_analyses enable row level security;
alter table public.margeo_feedback enable row level security;

-- Profiles
drop policy if exists margeo_profiles_select_own on public.margeo_profiles;
create policy margeo_profiles_select_own on public.margeo_profiles
  for select using (auth.uid() = id);

drop policy if exists margeo_profiles_insert_own on public.margeo_profiles;
create policy margeo_profiles_insert_own on public.margeo_profiles
  for insert with check (auth.uid() = id);

drop policy if exists margeo_profiles_update_own on public.margeo_profiles;
create policy margeo_profiles_update_own on public.margeo_profiles
  for update using (auth.uid() = id);

-- Rides
drop policy if exists margeo_rides_select_own on public.margeo_rides;
create policy margeo_rides_select_own on public.margeo_rides
  for select using (auth.uid() = user_id);

drop policy if exists margeo_rides_insert_own on public.margeo_rides;
create policy margeo_rides_insert_own on public.margeo_rides
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_rides_update_own on public.margeo_rides;
create policy margeo_rides_update_own on public.margeo_rides
  for update using (auth.uid() = user_id);

drop policy if exists margeo_rides_delete_own on public.margeo_rides;
create policy margeo_rides_delete_own on public.margeo_rides
  for delete using (auth.uid() = user_id);

-- Analyses
drop policy if exists margeo_analyses_select_own on public.margeo_analyses;
create policy margeo_analyses_select_own on public.margeo_analyses
  for select using (auth.uid() = user_id);

drop policy if exists margeo_analyses_insert_own on public.margeo_analyses;
create policy margeo_analyses_insert_own on public.margeo_analyses
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_analyses_update_own on public.margeo_analyses;
create policy margeo_analyses_update_own on public.margeo_analyses
  for update using (auth.uid() = user_id);

-- Feedback
drop policy if exists margeo_feedback_select_own on public.margeo_feedback;
create policy margeo_feedback_select_own on public.margeo_feedback
  for select using (auth.uid() = user_id);

drop policy if exists margeo_feedback_insert_own on public.margeo_feedback;
create policy margeo_feedback_insert_own on public.margeo_feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_feedback_update_own on public.margeo_feedback;
create policy margeo_feedback_update_own on public.margeo_feedback
  for update using (auth.uid() = user_id);


-- ═══ driveely-migrate.sql ═══
-- Driveely — migration depuis Margeo
-- Exécuter après margeo-setup.sql

-- Véhicule : ajout vélo électrique
alter table public.margeo_profiles
  drop constraint if exists margeo_profiles_vehicle_check;

alter table public.margeo_profiles
  add constraint margeo_profiles_vehicle_check
  check (vehicle in ('velo', 'velo_electrique', 'scooter', 'voiture'));

-- Plateforme personnalisée (onboarding « Autre »)
alter table public.margeo_profiles
  add column if not exists other_platform text;

-- Géolocalisation livreur
alter table public.margeo_profiles
  add column if not exists last_lat numeric(10, 7),
  add column if not exists last_lng numeric(10, 7),
  add column if not exists location_updated_at timestamptz,
  add column if not exists location_permission text not null default 'unknown'
    check (location_permission in ('granted', 'denied', 'unknown'));

-- Historique positions (style Strava)
create table if not exists public.margeo_location_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  accuracy_m numeric(8, 2),
  recorded_at timestamptz not null default now()
);

create index if not exists margeo_location_logs_user_idx
  on public.margeo_location_logs (user_id, recorded_at desc);

-- Distance jusqu'au point de récupération (scoring)
alter table public.margeo_rides
  add column if not exists pickup_distance_km numeric(8, 2);

alter table public.margeo_rides
  add column if not exists courier_lat numeric(10, 7),
  add column if not exists courier_lng numeric(10, 7);

-- RLS location logs
alter table public.margeo_location_logs enable row level security;

drop policy if exists margeo_location_logs_select_own on public.margeo_location_logs;
create policy margeo_location_logs_select_own on public.margeo_location_logs
  for select using (auth.uid() = user_id);

drop policy if exists margeo_location_logs_insert_own on public.margeo_location_logs;
create policy margeo_location_logs_insert_own on public.margeo_location_logs
  for insert with check (auth.uid() = user_id);


-- ═══ driveely-backend-v2.sql ═══
-- Driveely — backend production (storage + métadonnées Vision)
-- Exécuter après margeo-setup.sql, margeo-rls.sql, driveely-migrate.sql

-- Métadonnées extraction Vision sur les courses
alter table public.margeo_rides
  add column if not exists vision_source text
    check (vision_source in ('mock', 'vision')),
  add column if not exists vision_confidence numeric(4, 3)
    check (vision_confidence is null or (vision_confidence >= 0 and vision_confidence <= 1));

-- Bucket privé pour captures d'écran (upload serveur via service_role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driveely-screenshots',
  'driveely-screenshots',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lecture : uniquement ses propres fichiers (dossier = user_id)
drop policy if exists driveely_screenshots_select_own on storage.objects;
create policy driveely_screenshots_select_own on storage.objects
  for select
  using (
    bucket_id = 'driveely-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert : uniquement dans son dossier (upload client direct — optionnel)
drop policy if exists driveely_screenshots_insert_own on storage.objects;
create policy driveely_screenshots_insert_own on storage.objects
  for insert
  with check (
    bucket_id = 'driveely-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete : uniquement ses propres fichiers
drop policy if exists driveely_screenshots_delete_own on storage.objects;
create policy driveely_screenshots_delete_own on storage.objects
  for delete
  using (
    bucket_id = 'driveely-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ═══ driveely-beta.sql ═══
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


-- ═══ driveely-beta-v2.sql ═══
-- Driveely beta v2 — événements funnel + testeurs beta
-- Exécuter après driveely-beta.sql

-- Flag testeur beta (identification dans Supabase)
alter table public.margeo_profiles
  add column if not exists is_beta_tester boolean not null default false;

create index if not exists margeo_profiles_beta_tester_idx
  on public.margeo_profiles (is_beta_tester)
  where is_beta_tester = true;

-- Étendre les types d'événements beta
alter table public.margeo_beta_events
  drop constraint if exists margeo_beta_events_event_type_check;

alter table public.margeo_beta_events
  add constraint margeo_beta_events_event_type_check
  check (event_type in (
    'account_created',
    'onboarding_completed',
    'first_analysis',
    'analysis_started',
    'analysis_success',
    'analysis_failed',
    'vision_low_confidence',
    'feedback_submitted',
    'feedback_correction'
  ));

-- Vue funnel beta (inscriptions → première analyse → feedback)
create or replace view public.driveely_beta_funnel as
with users as (
  select id as user_id, created_at as signed_up_at, is_beta_tester
  from public.margeo_profiles
),
events as (
  select user_id, event_type, min(created_at) as first_at
  from public.margeo_beta_events
  group by user_id, event_type
)
select
  u.user_id,
  u.is_beta_tester,
  u.signed_up_at,
  max(e.first_at) filter (where e.event_type = 'onboarding_completed') as onboarded_at,
  max(e.first_at) filter (where e.event_type = 'first_analysis') as first_analysis_at,
  max(e.first_at) filter (where e.event_type = 'feedback_submitted') as first_feedback_at,
  count(e.event_type) filter (where e.event_type = 'analysis_failed') as failed_analyses
from users u
left join events e on e.user_id = u.user_id
group by u.user_id, u.is_beta_tester, u.signed_up_at
order by u.signed_up_at desc;

-- Vue erreurs récentes (monitoring beta)
create or replace view public.driveely_beta_errors as
select
  id,
  user_id,
  event_type,
  error_code,
  vision_confidence,
  metadata,
  created_at
from public.margeo_beta_events
where error_code is not null
   or event_type in ('analysis_failed', 'vision_low_confidence')
order by created_at desc;


-- ═══ driveely-beta-v3.sql ═══
-- Driveely beta v3 — stats Vision agrégées
-- Exécuter après driveely-beta-v2.sql

create or replace view public.driveely_beta_vision_stats as
select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_type = 'analysis_success') as analyses_ok,
  count(*) filter (where event_type = 'analysis_failed') as analyses_ko,
  count(*) filter (where event_type = 'vision_low_confidence') as low_confidence,
  count(*) filter (where event_type = 'feedback_correction') as corrections,
  round(avg((metadata->>'geminiMs')::numeric) filter (
    where metadata ? 'geminiMs'
  ), 0) as avg_gemini_ms,
  round(avg((metadata->>'totalMs')::numeric) filter (
    where metadata ? 'totalMs'
  ), 0) as avg_total_ms,
  round(avg(vision_confidence) filter (
    where vision_confidence is not null
  ), 2) as avg_confidence
from public.margeo_beta_events
group by 1
order by 1 desc;


