-- Driveely — codes bêta Premium (one-time / limited uses)
-- Idempotent. Appliquer via SQL Editor, MCP, ou scripts/apply-beta-codes-migration.mjs
--
-- iOS attend 6 caractères alphanumériques (ex. AB7KQ2).
-- Redeem uniquement via API (auth JWT) → RPC service_role → is_beta_tester.

create table if not exists public.driveely_beta_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  active boolean not null default true,
  max_uses integer not null default 1 check (max_uses >= 1),
  use_count integer not null default 0 check (use_count >= 0),
  expires_at timestamptz null,
  note text null,
  created_at timestamptz not null default now(),
  constraint driveely_beta_codes_code_format
    check (code ~ '^[A-Z0-9]{6}$'),
  constraint driveely_beta_codes_use_lte_max
    check (use_count <= max_uses)
);

create unique index if not exists driveely_beta_codes_code_uidx
  on public.driveely_beta_codes (code);

create index if not exists driveely_beta_codes_active_idx
  on public.driveely_beta_codes (active)
  where active = true;

create table if not exists public.driveely_beta_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.driveely_beta_codes (id) on delete cascade,
  user_id uuid not null,
  redeemed_at timestamptz not null default now(),
  constraint driveely_beta_code_redemptions_code_user_uidx
    unique (code_id, user_id)
);

create index if not exists driveely_beta_code_redemptions_user_idx
  on public.driveely_beta_code_redemptions (user_id);

alter table public.driveely_beta_codes enable row level security;
alter table public.driveely_beta_code_redemptions enable row level security;

-- RLS on + aucune policy client = deny anon/authenticated.
-- service_role bypass RLS (API / scripts fondateur).

-- Atomic redeem: validate + increment + redemption + mark beta tester.
create or replace function public.driveely_redeem_beta_code(
  p_code text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_row public.driveely_beta_codes%rowtype;
  v_already boolean;
begin
  if p_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED');
  end if;

  v_code := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(v_code) <> 6 then
    return jsonb_build_object('ok', false, 'error', 'BETA_CODE_INVALID');
  end if;

  -- Idempotent: already a beta tester → success without consuming another use.
  if exists (
    select 1 from public.margeo_profiles
    where id = p_user_id and is_beta_tester = true
  ) then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  select * into v_row
  from public.driveely_beta_codes
  where code = v_code
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'BETA_CODE_INVALID');
  end if;

  if not v_row.active then
    return jsonb_build_object('ok', false, 'error', 'BETA_CODE_UNAVAILABLE');
  end if;

  if v_row.expires_at is not null and v_row.expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'BETA_CODE_EXPIRED');
  end if;

  select exists (
    select 1 from public.driveely_beta_code_redemptions
    where code_id = v_row.id and user_id = p_user_id
  ) into v_already;

  if v_already then
    -- Re-grant flags if somehow lost
    update public.margeo_profiles
    set
      is_beta_tester = true,
      premium_source = coalesce(premium_source, 'beta')
    where id = p_user_id;
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  if v_row.use_count >= v_row.max_uses then
    return jsonb_build_object('ok', false, 'error', 'BETA_CODE_ALREADY_USED');
  end if;

  update public.driveely_beta_codes
  set use_count = use_count + 1
  where id = v_row.id;

  insert into public.driveely_beta_code_redemptions (code_id, user_id)
  values (v_row.id, p_user_id);

  update public.margeo_profiles
  set
    is_beta_tester = true,
    premium_source = coalesce(nullif(premium_source, ''), 'beta')
  where id = p_user_id;

  if not found then
    -- Profile may not exist yet — still record redemption; profile trigger may create later.
    -- Soft-fail: return ok so client can refresh once profile exists.
    null;
  end if;

  return jsonb_build_object('ok', true, 'already', false);
end;
$$;

revoke all on function public.driveely_redeem_beta_code(text, uuid) from public;
revoke all on function public.driveely_redeem_beta_code(text, uuid) from anon;
revoke all on function public.driveely_redeem_beta_code(text, uuid) from authenticated;
grant execute on function public.driveely_redeem_beta_code(text, uuid) to service_role;
