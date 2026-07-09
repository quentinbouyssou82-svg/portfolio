-- Voir supabase/maison-preferences-migrate.sql (fichier unique recommandé)
-- Contenu identique — conservé pour compatibilité scripts existants.

alter table public.preferences
  add column if not exists taste_completed_at timestamptz,
  add column if not exists dislike_levels jsonb not null default '{}';

notify pgrst, 'reload schema';
