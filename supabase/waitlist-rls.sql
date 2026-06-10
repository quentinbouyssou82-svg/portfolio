-- Policies + grants pour waitlist (formulaire Next.js avec clé anon)
-- Exécuter dans Supabase → SQL Editor (projet Nocta Agency OS)

alter table public.waitlist enable row level security;

-- Nettoyage anciennes policies
drop policy if exists "allow insert" on public.waitlist;
drop policy if exists "allow update" on public.waitlist;
drop policy if exists "waitlist_anon_insert" on public.waitlist;
drop policy if exists "waitlist_anon_update" on public.waitlist;

-- Droits SQL (en plus des policies RLS)
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.waitlist to anon, authenticated;

-- INSERT (nouvelle inscription)
create policy "waitlist_anon_insert"
on public.waitlist
for insert
to anon, authenticated
with check (true);

-- UPDATE (email déjà inscrit — formulaire complet)
create policy "waitlist_anon_update"
on public.waitlist
for update
to anon, authenticated
using (true)
with check (true);
