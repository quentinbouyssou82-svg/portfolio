-- Margeo — Row Level Security
-- Exécuter après margeo-setup.sql

alter table public.margeo_profiles enable row level security;
alter table public.margeo_rides enable row level security;
alter table public.margeo_analyses enable row level security;
alter table public.margeo_feedback enable row level security;

-- Profiles
drop policy if exists margeo_profiles_select_own on public.margeo_profiles;
create policy margeo_profiles_select_own on public.margeo_profiles
  for select using (auth.uid() = id);

drop policy if exists margeo_profiles_insert_own on public.margeo_profiles;
create policy margeo_profiles_insert_own on public.margeo_profiles
  for insert with check (auth.uid() = id);

drop policy if exists margeo_profiles_update_own on public.margeo_profiles;
create policy margeo_profiles_update_own on public.margeo_profiles
  for update using (auth.uid() = id);

-- Rides
drop policy if exists margeo_rides_select_own on public.margeo_rides;
create policy margeo_rides_select_own on public.margeo_rides
  for select using (auth.uid() = user_id);

drop policy if exists margeo_rides_insert_own on public.margeo_rides;
create policy margeo_rides_insert_own on public.margeo_rides
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_rides_update_own on public.margeo_rides;
create policy margeo_rides_update_own on public.margeo_rides
  for update using (auth.uid() = user_id);

drop policy if exists margeo_rides_delete_own on public.margeo_rides;
create policy margeo_rides_delete_own on public.margeo_rides
  for delete using (auth.uid() = user_id);

-- Analyses
drop policy if exists margeo_analyses_select_own on public.margeo_analyses;
create policy margeo_analyses_select_own on public.margeo_analyses
  for select using (auth.uid() = user_id);

drop policy if exists margeo_analyses_insert_own on public.margeo_analyses;
create policy margeo_analyses_insert_own on public.margeo_analyses
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_analyses_update_own on public.margeo_analyses;
create policy margeo_analyses_update_own on public.margeo_analyses
  for update using (auth.uid() = user_id);

-- Feedback
drop policy if exists margeo_feedback_select_own on public.margeo_feedback;
create policy margeo_feedback_select_own on public.margeo_feedback
  for select using (auth.uid() = user_id);

drop policy if exists margeo_feedback_insert_own on public.margeo_feedback;
create policy margeo_feedback_insert_own on public.margeo_feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists margeo_feedback_update_own on public.margeo_feedback;
create policy margeo_feedback_update_own on public.margeo_feedback
  for update using (auth.uid() = user_id);
