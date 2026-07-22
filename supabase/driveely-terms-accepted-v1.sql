-- Driveely : horodatage d'acceptation CGU / confidentialité à l'inscription
-- Appliquer dans le SQL Editor Supabase (prod) si la colonne n'existe pas encore.

alter table public.margeo_profiles
  add column if not exists terms_accepted_at timestamptz;

alter table public.margeo_profiles
  add column if not exists terms_version text;

comment on column public.margeo_profiles.terms_accepted_at is
  'Horodatage d''acceptation CGU + politique de confidentialité (inscription).';

comment on column public.margeo_profiles.terms_version is
  'Version des documents acceptés (ex. cgu-privacy-v1).';
