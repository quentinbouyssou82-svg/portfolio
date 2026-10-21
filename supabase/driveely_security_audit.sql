-- Journal d'audit sécurité Driveely (appliquer manuellement dans Supabase SQL Editor)
-- Voir SECURITY.md Phase 5

create table if not exists public.driveely_security_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  user_id uuid null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists driveely_security_audit_created_at_idx
  on public.driveely_security_audit (created_at desc);

create index if not exists driveely_security_audit_action_idx
  on public.driveely_security_audit (action);

alter table public.driveely_security_audit enable row level security;

-- Pas d'accès client : lecture/écriture via service_role uniquement
drop policy if exists driveely_security_audit_no_client on public.driveely_security_audit;
create policy driveely_security_audit_no_client
  on public.driveely_security_audit
  for all
  using (false)
  with check (false);
