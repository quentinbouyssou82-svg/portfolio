-- Uberly — système d'abonnement (prêt Stripe / LemonSqueezy)
-- Exécuter dans le SQL Editor Supabase.

-- Plan dénormalisé sur le profil (cache lecture rapide)
alter table public.margeo_profiles
  add column if not exists plan_id text not null default 'discovery';

alter table public.margeo_profiles
  drop constraint if exists margeo_profiles_plan_id_check;

alter table public.margeo_profiles
  add constraint margeo_profiles_plan_id_check
  check (plan_id in ('discovery', 'pro', 'elite'));

-- Abonnement courant (1 ligne / utilisateur)
create table if not exists public.margeo_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null check (plan_id in ('discovery', 'pro', 'elite')),
  status text not null
    check (status in (
      'active',
      'trialing',
      'canceled',
      'past_due',
      'incomplete',
      'expired'
    )),
  created_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  canceled_at timestamptz,
  cancel_at_period_end boolean not null default false,
  auto_renew boolean not null default true,
  billing_period text not null default 'monthly'
    check (billing_period in ('monthly', 'yearly')),
  provider text
    check (provider is null or provider in ('simulated', 'stripe', 'lemonsqueezy')),
  provider_customer_id text,
  provider_subscription_id text,
  payment_status text not null default 'none'
    check (payment_status in (
      'none',
      'simulated',
      'pending',
      'paid',
      'failed',
      'refunded'
    )),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint margeo_subscriptions_user_unique unique (user_id)
);

create index if not exists margeo_subscriptions_plan_idx
  on public.margeo_subscriptions (plan_id);
create index if not exists margeo_subscriptions_status_idx
  on public.margeo_subscriptions (status);

-- Historique des changements
create table if not exists public.margeo_subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_id uuid references public.margeo_subscriptions (id) on delete set null,
  event_type text not null
    check (event_type in (
      'created',
      'activated',
      'upgraded',
      'downgraded',
      'canceled',
      'reactivated',
      'renewed',
      'expired',
      'provider_sync'
    )),
  from_plan text,
  to_plan text,
  from_status text,
  to_status text,
  provider text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists margeo_subscription_events_user_idx
  on public.margeo_subscription_events (user_id, created_at desc);

-- RLS
alter table public.margeo_subscriptions enable row level security;
alter table public.margeo_subscription_events enable row level security;

drop policy if exists margeo_subscriptions_select_own on public.margeo_subscriptions;
create policy margeo_subscriptions_select_own on public.margeo_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists margeo_subscriptions_insert_own on public.margeo_subscriptions;
create policy margeo_subscriptions_insert_own on public.margeo_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_subscriptions_update_own on public.margeo_subscriptions;
create policy margeo_subscriptions_update_own on public.margeo_subscriptions
  for update using (auth.uid() = user_id);

drop policy if exists margeo_subscription_events_select_own on public.margeo_subscription_events;
create policy margeo_subscription_events_select_own on public.margeo_subscription_events
  for select using (auth.uid() = user_id);

drop policy if exists margeo_subscription_events_insert_own on public.margeo_subscription_events;
create policy margeo_subscription_events_insert_own on public.margeo_subscription_events
  for insert with check (auth.uid() = user_id);

-- Backfill : profils premium → plan pro + abonnement
update public.margeo_profiles
set plan_id = case
  when premium = true and coalesce(plan_id, 'discovery') = 'discovery' then 'pro'
  else coalesce(plan_id, 'discovery')
end
where true;

insert into public.margeo_subscriptions (
  user_id,
  plan_id,
  status,
  started_at,
  current_period_start,
  current_period_end,
  auto_renew,
  billing_period,
  provider,
  payment_status,
  metadata
)
select
  p.id,
  coalesce(nullif(p.plan_id, ''), 'discovery'),
  case when p.premium then 'active' else 'active' end,
  coalesce(p.created_at, now()),
  now(),
  case
    when p.premium then coalesce(p.premium_until, now() + interval '30 days')
    else null
  end,
  p.premium,
  'monthly',
  case
    when p.premium_source = 'stripe' then 'stripe'
    when p.premium then 'simulated'
    else null
  end,
  case
    when p.premium then 'simulated'
    else 'none'
  end,
  jsonb_build_object('backfilled', true)
from public.margeo_profiles p
on conflict (user_id) do nothing;
