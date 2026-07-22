-- Driveely — détails véhicule (marque, modèle, conso…)
alter table public.margeo_profiles
  add column if not exists vehicle_details jsonb not null default '{}'::jsonb;
