-- Uberly beta: prénom / nom / photo de profil
-- Exécuter dans le SQL Editor Supabase (ou via CLI).

alter table public.margeo_profiles
  add column if not exists first_name text not null default '',
  add column if not exists last_name text not null default '',
  add column if not exists avatar_url text;

-- Backfill : l'ancien champ "name" (label UI "Prénom") → first_name
update public.margeo_profiles
set first_name = coalesce(nullif(trim(first_name), ''), nullif(trim(name), ''), '')
where coalesce(trim(first_name), '') = '';

-- Resynchroniser name = "Prénom Nom" pour l'affichage legacy
update public.margeo_profiles
set name = trim(both ' ' from concat_ws(' ', nullif(trim(first_name), ''), nullif(trim(last_name), '')))
where true;

-- Bucket public pour les avatars (URL directe dans <img>)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uberly-avatars',
  'uberly-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Policies Storage (idempotent via drop + create)
drop policy if exists "uberly_avatars_public_read" on storage.objects;
drop policy if exists "uberly_avatars_owner_insert" on storage.objects;
drop policy if exists "uberly_avatars_owner_update" on storage.objects;
drop policy if exists "uberly_avatars_owner_delete" on storage.objects;

create policy "uberly_avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'uberly-avatars');

create policy "uberly_avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'uberly-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uberly_avatars_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'uberly-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'uberly-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uberly_avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'uberly-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
