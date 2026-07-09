-- Uberly — backend production (storage + métadonnées Vision)
-- Exécuter après margeo-setup.sql, margeo-rls.sql, uberly-migrate.sql

-- Métadonnées extraction Vision sur les courses
alter table public.margeo_rides
  add column if not exists vision_source text
    check (vision_source in ('mock', 'vision')),
  add column if not exists vision_confidence numeric(4, 3)
    check (vision_confidence is null or (vision_confidence >= 0 and vision_confidence <= 1));

-- Bucket privé pour captures d'écran (upload serveur via service_role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uberly-screenshots',
  'uberly-screenshots',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lecture : uniquement ses propres fichiers (dossier = user_id)
drop policy if exists uberly_screenshots_select_own on storage.objects;
create policy uberly_screenshots_select_own on storage.objects
  for select
  using (
    bucket_id = 'uberly-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert : uniquement dans son dossier (upload client direct — optionnel)
drop policy if exists uberly_screenshots_insert_own on storage.objects;
create policy uberly_screenshots_insert_own on storage.objects
  for insert
  with check (
    bucket_id = 'uberly-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete : uniquement ses propres fichiers
drop policy if exists uberly_screenshots_delete_own on storage.objects;
create policy uberly_screenshots_delete_own on storage.objects
  for delete
  using (
    bucket_id = 'uberly-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
