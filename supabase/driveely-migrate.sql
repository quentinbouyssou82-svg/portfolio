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
