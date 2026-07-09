-- Maison — Architecture FOYER (household-centric)
-- Exécuter dans Supabase → SQL Editor, puis maison-rls.sql
-- Remplace l'ancien schéma auth.users / maison_families si présent
--
-- Base déjà déployée (schéma preferences incomplet) :
--   → supabase/maison-preferences-migrate.sql (idempotent, toutes colonnes v2 + goûts)

-- Nettoyage ancien schéma (auth SaaS)
drop trigger if exists maison_on_auth_user_created on auth.users;
drop function if exists public.maison_handle_new_user();
drop function if exists public.maison_user_family_ids();
drop function if exists public.maison_is_admin(uuid);

drop table if exists public.maison_grocery_items cascade;
drop table if exists public.maison_grocery_lists cascade;
drop table if exists public.maison_meals cascade;
drop table if exists public.maison_meal_plans cascade;
drop table if exists public.maison_budgets cascade;
drop table if exists public.maison_members cascade;
drop table if exists public.maison_user_families cascade;
drop table if exists public.maison_families cascade;

-- 🏠 Foyers
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  household_key text not null unique,
  budget_monthly numeric(10, 2) not null default 480,
  onboarding_completed boolean not null default false,
  global_settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists households_key_idx on public.households (household_key);

-- 👨‍👩‍👧 Membres internes du foyer
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  pin_hash text not null,
  goals text,
  activity_level text not null default 'moderate',
  portion_factor numeric(4, 2) not null default 1,
  days_at_home jsonb not null default '[0,1,2,3,4,5,6]',
  created_at timestamptz not null default now()
);

create index if not exists members_household_idx on public.members (household_id);

-- 🥗 Préférences alimentaires par membre
create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.members (id) on delete cascade,
  liked_foods text[] not null default '{}',
  disliked_foods text[] not null default '{}',
  allergies text[] not null default '{}',
  must_have_foods text[] not null default '{}',
  nutrition_goal text not null default 'maintain'
    check (nutrition_goal in ('weight_loss', 'maintain', 'light_gain')),
  diet_type text not null default 'omnivore',
  forbidden_foods text[] not null default '{}',
  intolerances text[] not null default '{}',
  food_ratings jsonb not null default '{}',
  consumption_habits jsonb not null default '{}',
  preferred_meals text[] not null default '{lunch,dinner}',
  updated_at timestamptz not null default now()
);

-- 🍽️ Planning repas (JSONB)
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  week_start date not null,
  week_end date not null,
  data jsonb not null default '{"meals":[]}',
  created_at timestamptz not null default now(),
  unique (household_id, week_start)
);

create index if not exists meal_plans_household_week_idx
  on public.meal_plans (household_id, week_start desc);

-- 🛒 Listes de courses (JSONB)
create table if not exists public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  meal_plan_id uuid references public.meal_plans (id) on delete set null,
  items jsonb not null default '{"items":[],"total_estimated":0}',
  status text not null default 'draft'
    check (status in ('draft', 'finalized', 'exported')),
  created_at timestamptz not null default now()
);

create index if not exists grocery_lists_household_idx
  on public.grocery_lists (household_id, created_at desc);

-- 💰 Budgets hebdomadaires
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  week_start date not null,
  estimated_cost numeric(10, 2) not null default 0,
  actual_cost numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (household_id, week_start)
);
