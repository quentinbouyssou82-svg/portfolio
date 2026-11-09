-- Driveely — sécurité pré-lancement : RLS billing / StoreKit uniqueness
-- Appliquer manuellement dans Supabase SQL Editor (prod) AVANT le lancement commercial.
-- Idempotent : safe to re-run.
--
-- Corrige :
--   B) Client INSERT/UPDATE sur margeo_subscriptions (+ events insert)
--   B) Client UPDATE des colonnes billing sur margeo_profiles
--   C) UNIQUE (provider, provider_subscription_id) pour anti-reuse StoreKit
--   + autorise provider = 'app_store'

-- ---------------------------------------------------------------------------
-- 1) Abonnements : lecture seule côté client (JWT user)
--    Écritures = service_role uniquement (API /checkout StoreKit / Stripe)
-- ---------------------------------------------------------------------------

drop policy if exists margeo_subscriptions_insert_own on public.margeo_subscriptions;
drop policy if exists margeo_subscriptions_update_own on public.margeo_subscriptions;
drop policy if exists margeo_subscription_events_insert_own on public.margeo_subscription_events;

-- SELECT own conservé (si absent, le recréer)
drop policy if exists margeo_subscriptions_select_own on public.margeo_subscriptions;
create policy margeo_subscriptions_select_own on public.margeo_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists margeo_subscription_events_select_own on public.margeo_subscription_events;
create policy margeo_subscription_events_select_own on public.margeo_subscription_events
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2) Provider check : autoriser app_store
-- ---------------------------------------------------------------------------

alter table public.margeo_subscriptions
  drop constraint if exists margeo_subscriptions_provider_check;

alter table public.margeo_subscriptions
  add constraint margeo_subscriptions_provider_check
  check (
    provider is null
    or provider in ('simulated', 'stripe', 'app_store')
  );

-- ---------------------------------------------------------------------------
-- 3) Unicité StoreKit / Stripe subscription id (anti-reuse cross-account)
-- ---------------------------------------------------------------------------

create unique index if not exists margeo_subscriptions_provider_sub_uidx
  on public.margeo_subscriptions (provider, provider_subscription_id)
  where provider is not null
    and provider_subscription_id is not null
    and length(trim(provider_subscription_id)) > 0;

-- ---------------------------------------------------------------------------
-- 4) Profils : protéger colonnes billing / allowlist beta contre UPDATE client
--    service_role (auth.role() = 'service_role') peut toujours écrire.
-- ---------------------------------------------------------------------------

create or replace function public.margeo_profiles_protect_billing_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Bypass pour service_role (API serveur, StoreKit checkout, admin)
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  -- Client JWT : ignorer toute tentative de self-upgrade billing / allowlist
  new.premium := old.premium;
  new.premium_until := old.premium_until;
  new.premium_source := old.premium_source;
  new.plan_id := old.plan_id;
  new.is_beta_tester := old.is_beta_tester;

  return new;
end;
$$;

drop trigger if exists trg_margeo_profiles_protect_billing
  on public.margeo_profiles;

create trigger trg_margeo_profiles_protect_billing
  before update on public.margeo_profiles
  for each row
  execute function public.margeo_profiles_protect_billing_columns();

-- Note : la policy UPDATE own sur margeo_profiles reste (profil véhicule / coûts).
-- Le trigger ci-dessus empêche le self-upgrade premium / plan / is_beta_tester.
