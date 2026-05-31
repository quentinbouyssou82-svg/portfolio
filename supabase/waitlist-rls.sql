-- Table waitlist (si pas encore créée)
-- create table public.waitlist (
--   id uuid primary key default gen_random_uuid(),
--   email text not null unique,
--   created_at timestamptz default now()
-- );

-- Policy INSERT pour le rôle anon (clé publique Next.js)
create policy "allow insert"
on public.waitlist
for insert
to anon
with check (true);

-- Optionnel : lecture pour le dashboard authentifié uniquement
-- create policy "allow read authenticated"
-- on public.waitlist
-- for select
-- to authenticated
-- using (true);
