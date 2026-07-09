-- Uberly beta v3 — stats Vision agrégées
-- Exécuter après uberly-beta-v2.sql

create or replace view public.uberly_beta_vision_stats as
select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_type = 'analysis_success') as analyses_ok,
  count(*) filter (where event_type = 'analysis_failed') as analyses_ko,
  count(*) filter (where event_type = 'vision_low_confidence') as low_confidence,
  count(*) filter (where event_type = 'feedback_correction') as corrections,
  round(avg((metadata->>'geminiMs')::numeric) filter (
    where metadata ? 'geminiMs'
  ), 0) as avg_gemini_ms,
  round(avg((metadata->>'totalMs')::numeric) filter (
    where metadata ? 'totalMs'
  ), 0) as avg_total_ms,
  round(avg(vision_confidence) filter (
    where vision_confidence is not null
  ), 2) as avg_confidence
from public.margeo_beta_events
group by 1
order by 1 desc;
