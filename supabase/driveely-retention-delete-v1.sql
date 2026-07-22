-- Driveely — rétention captures 30 jours + suppression d'analyses
-- Exécuter dans le SQL Editor Supabase.

-- Index pour le cron de purge (rides avec capture anciennes)
create index if not exists margeo_rides_image_created_idx
  on public.margeo_rides (created_at)
  where image_path is not null;

-- RLS : un utilisateur peut supprimer ses propres analyses
drop policy if exists margeo_analyses_delete_own on public.margeo_analyses;
create policy margeo_analyses_delete_own on public.margeo_analyses
  for delete using (auth.uid() = user_id);

drop policy if exists margeo_feedback_delete_own on public.margeo_feedback;
create policy margeo_feedback_delete_own on public.margeo_feedback
  for delete using (auth.uid() = user_id);
