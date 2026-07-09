-- Migration préférences enrichies (v2)
-- Exécuter après maison-setup.sql

alter table public.preferences
  add column if not exists diet_type text not null default 'omnivore',
  add column if not exists forbidden_foods text[] not null default '{}',
  add column if not exists intolerances text[] not null default '{}',
  add column if not exists food_ratings jsonb not null default '{}',
  add column if not exists consumption_habits jsonb not null default '{}',
  add column if not exists preferred_meals text[] not null default '{lunch,dinner}';
