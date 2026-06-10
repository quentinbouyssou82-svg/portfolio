-- Personal Control Tower — schéma initial
-- Exécuter dans Supabase → SQL Editor (après waitlist ou projet dédié)
-- Puis exécuter control-tower-rls.sql

-- Profil utilisateur (PIN login — pas de auth.users requis)
create table if not exists public.profiles (
  id uuid primary key,
  email text not null default 'local@control-tower',
  created_at timestamptz not null default now()
);

-- Tâches du jour (max 3 côté app)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  task_date date not null default (timezone('utc', now()))::date,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date);

-- Sessions de travail
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  domain text not null check (domain in ('business', 'saas', 'quant')),
  task_id uuid references public.tasks (id) on delete set null,
  duration_minutes integer not null check (duration_minutes > 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_created_idx on public.sessions (user_id, created_at desc);

-- Métriques vie quotidienne
create table if not exists public.metrics_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  metric_date date not null,
  focus_of_day text,
  sleep_hours numeric(4, 2) check (sleep_hours is null or (sleep_hours >= 0 and sleep_hours <= 24)),
  screen_time_minutes integer check (screen_time_minutes is null or screen_time_minutes >= 0),
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg > 0),
  sport_done boolean default false,
  sport_type text,
  energy_score smallint check (energy_score is null or (energy_score >= 1 and energy_score <= 10)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_date)
);

-- Pipeline business (compteurs / événements)
create table if not exists public.business_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  metric_type text not null check (
    metric_type in ('lead', 'email', 'reply', 'call', 'client', 'revenue')
  ),
  value numeric(12, 2) not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists business_metrics_user_type_idx
  on public.business_metrics (user_id, metric_type, created_at desc);

-- Progression compétences
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  sort_order smallint not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- updated_at automatique
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists metrics_daily_set_updated_at on public.metrics_daily;
create trigger metrics_daily_set_updated_at
  before update on public.metrics_daily
  for each row execute function public.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.sessions enable row level security;
alter table public.metrics_daily enable row level security;
alter table public.business_metrics enable row level security;
alter table public.skills enable row level security;

grant usage on schema public to anon, authenticated;
grant all on table public.profiles to authenticated;
grant all on table public.tasks to authenticated;
grant all on table public.sessions to authenticated;
grant all on table public.metrics_daily to authenticated;
grant all on table public.business_metrics to authenticated;
grant all on table public.skills to authenticated;
