-- ═══════════════════════════════════════════════════════════════════════════
-- Uberly — migration Auth + Onboarding (v3)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Remplace : uberly-onboarding-v3.sql (et toute migration onboarding antérieure)
--
-- Où l'exécuter :
--   Supabase Dashboard → SQL Editor → New query → Run
--
-- Prérequis :
--   Tables margeo_profiles + trigger margeo_handle_new_user déjà présents
--   (UBERLY-MIGRATION-FINAL.sql ou équivalent déjà appliqué)
--
-- Sécurité :
--   Idempotent — ne supprime aucune donnée utilisateur existante
--   Les comptes déjà créés conservent onboarding_completed tel quel
--
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 1. Colonnes onboarding wizard ─────────────────────────────────────────

alter table public.margeo_profiles
  add column if not exists min_benefit numeric(6, 2),
  add column if not exists max_distance_km numeric(6, 2),
  add column if not exists empty_returns text,
  add column if not exists weekly_hours text;

-- Valeurs par défaut pour les utilisateurs existants (sans écraser les réponses)
update public.margeo_profiles
set
  min_benefit = coalesce(min_benefit, 6),
  max_distance_km = coalesce(max_distance_km, 8)
where min_benefit is null
   or max_distance_km is null;

alter table public.margeo_profiles
  alter column min_benefit set default 6,
  alter column max_distance_km set default 8;

alter table public.margeo_profiles
  alter column min_benefit set not null,
  alter column max_distance_km set not null;


-- ─── 2. Contraintes véhicule + préférences onboarding ──────────────────────

alter table public.margeo_profiles
  drop constraint if exists margeo_profiles_vehicle_check;

alter table public.margeo_profiles
  add constraint margeo_profiles_vehicle_check
  check (vehicle in ('velo', 'velo_electrique', 'scooter', 'moto', 'voiture'));

alter table public.margeo_profiles
  drop constraint if exists margeo_profiles_empty_returns_check;

alter table public.margeo_profiles
  add constraint margeo_profiles_empty_returns_check
  check (
    empty_returns is null
    or empty_returns in ('yes', 'no', 'short_only')
  );

alter table public.margeo_profiles
  drop constraint if exists margeo_profiles_weekly_hours_check;

alter table public.margeo_profiles
  add constraint margeo_profiles_weekly_hours_check
  check (
    weekly_hours is null
    or weekly_hours in ('under_10', '10_20', '20_30', '30_40', 'over_40')
  );


-- ─── 3. Trigger profil auto (email + Google OAuth) ─────────────────────────
-- Crée margeo_profiles à l'inscription auth.users
-- Nom : name (email) ou full_name (Google)

create or replace function public.margeo_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.margeo_profiles (id, name, onboarding_completed)
  values (new.id, display_name, false)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists margeo_on_auth_user_created on auth.users;

create trigger margeo_on_auth_user_created
  after insert on auth.users
  for each row execute function public.margeo_handle_new_user();


-- ─── 4. Profils orphelins (utilisateurs auth sans ligne margeo_profiles) ───

insert into public.margeo_profiles (id, name, onboarding_completed)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    split_part(u.email, '@', 1),
    ''
  ),
  false
from auth.users u
left join public.margeo_profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;


-- ─── 5. Vérification (lecture seule — doit retourner les 4 colonnes) ───────

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'margeo_profiles'
  and column_name in (
    'onboarding_completed',
    'min_benefit',
    'max_distance_km',
    'empty_returns',
    'weekly_hours',
    'vehicle'
  )
order by column_name;

-- Attendu : 6 lignes
-- onboarding_completed | boolean
-- min_benefit          | numeric | default 6
-- max_distance_km      | numeric | default 8
-- empty_returns        | text    | nullable
-- weekly_hours         | text    | nullable
-- vehicle              | text    | check inclut moto
