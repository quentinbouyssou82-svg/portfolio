-- Exécuter dans Supabase → SQL Editor (nouveau projet ou table absente)

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  company text,
  website text,
  need text,
  source text default 'website',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "allow insert" on public.waitlist;
drop policy if exists "allow update" on public.waitlist;
drop policy if exists "waitlist_anon_insert" on public.waitlist;
drop policy if exists "waitlist_anon_update" on public.waitlist;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.waitlist to anon, authenticated;

create policy "waitlist_anon_insert"
on public.waitlist
for insert
to anon, authenticated
with check (true);

create policy "waitlist_anon_update"
on public.waitlist
for update
to anon, authenticated
using (true)
with check (true);
