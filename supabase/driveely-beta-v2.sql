-- Driveely beta v2 — événements funnel + testeurs beta
-- Exécuter après driveely-beta.sql

-- Flag testeur beta (identification dans Supabase)
alter table public.margeo_profiles
  add column if not exists is_beta_tester boolean not null default false;

create index if not exists margeo_profiles_beta_tester_idx
  on public.margeo_profiles (is_beta_tester)
  where is_beta_tester = true;

-- Étendre les types d'événements beta
alter table public.margeo_beta_events
  drop constraint if exists margeo_beta_events_event_type_check;

alter table public.margeo_beta_events
  add constraint margeo_beta_events_event_type_check
  check (event_type in (
    'account_created',
    'onboarding_completed',
    'first_analysis',
    'analysis_started',
    'analysis_success',
    'analysis_failed',
    'vision_low_confidence',
    'feedback_submitted',
    'feedback_correction'
  ));

-- Vue funnel beta (inscriptions → première analyse → feedback)
create or replace view public.driveely_beta_funnel as
with users as (
  select id as user_id, created_at as signed_up_at, is_beta_tester
  from public.margeo_profiles
),
events as (
  select user_id, event_type, min(created_at) as first_at
  from public.margeo_beta_events
  group by user_id, event_type
)
select
  u.user_id,
  u.is_beta_tester,
  u.signed_up_at,
  max(e.first_at) filter (where e.event_type = 'onboarding_completed') as onboarded_at,
  max(e.first_at) filter (where e.event_type = 'first_analysis') as first_analysis_at,
  max(e.first_at) filter (where e.event_type = 'feedback_submitted') as first_feedback_at,
  count(e.event_type) filter (where e.event_type = 'analysis_failed') as failed_analyses
from users u
left join events e on e.user_id = u.user_id
group by u.user_id, u.is_beta_tester, u.signed_up_at
order by u.signed_up_at desc;

-- Vue erreurs récentes (monitoring beta)
create or replace view public.driveely_beta_errors as
select
  id,
  user_id,
  event_type,
  error_code,
  vision_confidence,
  metadata,
  created_at
from public.margeo_beta_events
where error_code is not null
   or event_type in ('analysis_failed', 'vision_low_confidence')
order by created_at desc;
