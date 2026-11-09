-- Driveely — Retours produit / bugs (iOS + web)
-- Exécuter après driveely-survey-v1.sql (indépendant mais même pattern RLS).

create table if not exists public.margeo_product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('bug', 'idea', 'other', 'issue')),
  title text not null,
  body text not null,
  app_version text,
  device_model text,
  os_version text,
  user_agent text,
  is_ios boolean not null default true,
  screenshot_path text,
  screenshot_bucket text,
  channel text not null default 'ios_app',
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists margeo_product_feedback_user_idx
  on public.margeo_product_feedback (user_id, created_at desc);

create index if not exists margeo_product_feedback_kind_idx
  on public.margeo_product_feedback (kind, created_at desc);

alter table public.margeo_product_feedback enable row level security;

drop policy if exists margeo_product_feedback_select_own on public.margeo_product_feedback;
create policy margeo_product_feedback_select_own on public.margeo_product_feedback
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists margeo_product_feedback_insert_own on public.margeo_product_feedback;
create policy margeo_product_feedback_insert_own on public.margeo_product_feedback
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Pas de update/delete client (audit)
drop policy if exists margeo_product_feedback_update_block on public.margeo_product_feedback;
create policy margeo_product_feedback_update_block on public.margeo_product_feedback
  for update to authenticated using (false);

drop policy if exists margeo_product_feedback_delete_block on public.margeo_product_feedback;
create policy margeo_product_feedback_delete_block on public.margeo_product_feedback
  for delete to authenticated using (false);

-- Vue admin / dashboard (service_role ou SQL editor)
create or replace view public.driveely_product_feedback_recent as
select
  f.id,
  f.user_id,
  f.kind,
  f.title,
  left(f.body, 280) as body_preview,
  f.app_version,
  f.device_model,
  f.os_version,
  f.channel,
  f.screenshot_path,
  f.screenshot_bucket,
  f.created_at
from public.margeo_product_feedback f
order by f.created_at desc;
