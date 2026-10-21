-- Driveely analyze preflight (Phase 3) — optionnel
-- Appliquer manuellement dans Supabase SQL Editor si souhaité.
-- Réduit 2 aller-retours (profile + quota count) en une RPC.

create or replace function driveely_analyze_preflight(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile margeo_profiles%rowtype;
  v_count int;
  v_day_start timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
begin
  select * into v_profile from margeo_profiles where id = p_user_id;
  if not found then
    return json_build_object('ok', false, 'error', 'PROFILE_NOT_FOUND');
  end if;

  select count(*)::int into v_count
  from margeo_analyses
  where user_id = p_user_id
    and analyzed_at >= v_day_start;

  return json_build_object(
    'ok', true,
    'profile', row_to_json(v_profile),
    'analysesToday', v_count
  );
end;
$$;

revoke all on function driveely_analyze_preflight(uuid) from public;
grant execute on function driveely_analyze_preflight(uuid) to authenticated;
grant execute on function driveely_analyze_preflight(uuid) to service_role;
