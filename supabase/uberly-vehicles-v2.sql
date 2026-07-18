-- Uberly : véhicules détaillés + coûts/km réalistes
-- À exécuter dans le SQL Editor Supabase.

alter table public.margeo_profiles
  drop constraint if exists margeo_profiles_vehicle_check;

-- Migrer les anciennes valeurs
update public.margeo_profiles set vehicle = 'scooter_thermique' where vehicle = 'scooter';
update public.margeo_profiles set vehicle = 'voiture_essence' where vehicle = 'voiture';

alter table public.margeo_profiles
  add constraint margeo_profiles_vehicle_check
  check (
    vehicle in (
      'velo',
      'velo_electrique',
      'trottinette_electrique',
      'scooter',
      'scooter_thermique',
      'scooter_electrique',
      'moto',
      'voiture',
      'voiture_essence',
      'voiture_diesel',
      'voiture_hybride',
      'voiture_electrique'
    )
  );

-- Recaler les coûts par défaut si l'utilisateur n'a pas customisé (approx)
update public.margeo_profiles set cost_per_km = 0.03 where vehicle = 'velo' and cost_per_km in (0.05, 0.24);
update public.margeo_profiles set cost_per_km = 0.07 where vehicle = 'velo_electrique' and cost_per_km in (0.08, 0.24);
update public.margeo_profiles set cost_per_km = 0.18 where vehicle = 'scooter_thermique' and cost_per_km in (0.24);
update public.margeo_profiles set cost_per_km = 0.22 where vehicle = 'moto' and cost_per_km in (0.22, 0.24);
update public.margeo_profiles set cost_per_km = 0.32 where vehicle = 'voiture_essence' and cost_per_km in (0.35, 0.24);
