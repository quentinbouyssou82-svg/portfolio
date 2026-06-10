-- Personal Control Tower — politiques RLS (utilisateur = ses données uniquement)
-- Exécuter après control-tower-setup.sql

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- tasks
drop policy if exists "tasks_all_own" on public.tasks;
create policy "tasks_all_own"
  on public.tasks for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sessions
drop policy if exists "sessions_all_own" on public.sessions;
create policy "sessions_all_own"
  on public.sessions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- metrics_daily
drop policy if exists "metrics_daily_all_own" on public.metrics_daily;
create policy "metrics_daily_all_own"
  on public.metrics_daily for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- business_metrics
drop policy if exists "business_metrics_all_own" on public.business_metrics;
create policy "business_metrics_all_own"
  on public.business_metrics for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- skills
drop policy if exists "skills_all_own" on public.skills;
create policy "skills_all_own"
  on public.skills for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Realtime (optionnel — activer dans Dashboard → Database → Replication)
-- alter publication supabase_realtime add table public.tasks;
-- alter publication supabase_realtime add table public.sessions;
-- alter publication supabase_realtime add table public.metrics_daily;
-- alter publication supabase_realtime add table public.business_metrics;
-- alter publication supabase_realtime add table public.skills;
