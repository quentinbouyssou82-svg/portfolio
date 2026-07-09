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
