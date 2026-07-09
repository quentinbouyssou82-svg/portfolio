-- Maison — migration préférences (idempotent)
-- À exécuter si erreur « Could not find the 'consumption_habits' column »
-- ou toute colonne preferences manquante.
--
-- Ordre complet nouveau projet :
--   1. maison-setup.sql
--   2. maison-rls.sql
-- Projet existant (table preferences déjà créée sans v2) :
--   → exécuter UNIQUEMENT ce fichier

alter table public.preferences
  add column if not exists diet_type text not null default 'omnivore',
  add column if not exists forbidden_foods text[] not null default '{}',
  add column if not exists intolerances text[] not null default '{}',
  add column if not exists food_ratings jsonb not null default '{}',
  add column if not exists consumption_habits jsonb not null default '{}',
  add column if not exists preferred_meals text[] not null default '{lunch,dinner}',
  add column if not exists dislike_levels jsonb not null default '{}',
  add column if not exists taste_completed_at timestamptz;

-- Contrainte nutrition_goal si absente (anciennes installs)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'preferences_nutrition_goal_check'
  ) then
    alter table public.preferences
      add constraint preferences_nutrition_goal_check
      check (nutrition_goal in ('weight_loss', 'maintain', 'light_gain'));
  end if;
exception
  when duplicate_object then null;
end $$;

comment on column public.preferences.food_ratings is
  'Notes par aliment (id catalogue → like|neutral|dislike), par membre';
comment on column public.preferences.consumption_habits is
  'Fréquence par aliment (id catalogue → often|sometimes|rarely), par membre';
comment on column public.preferences.dislike_levels is
  'Intensité d''évitement pour aliments dislikés, par membre';
comment on column public.preferences.diet_type is
  'Régime alimentaire du membre (omnivore, vegetarian, vegan, …)';
comment on column public.preferences.taste_completed_at is
  'Dernière sauvegarde du profil gustatif (onboarding ou paramètres)';

-- Notifie PostgREST / Supabase pour rafraîchir le cache schéma
notify pgrst, 'reload schema';
