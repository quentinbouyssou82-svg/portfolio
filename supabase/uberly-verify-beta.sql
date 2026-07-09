-- Uberly — vérification post-migration beta
-- Exécuter dans Supabase SQL Editor après migrations 1→6

-- 1. Colonnes critiques margeo_rides
select column_name, is_nullable, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'margeo_rides'
  and column_name in (
    'distance_km', 'duration_min', 'missing_fields',
    'extraction_quality', 'vision_source', 'vision_confidence', 'image_path'
  )
order by column_name;

-- 2. Colonnes premium / beta profil
select column_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'margeo_profiles'
  and column_name in (
    'premium_until', 'premium_source', 'is_beta_tester'
  );

-- 3. Table beta events
select exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = 'margeo_beta_events'
) as beta_events_exists;

-- 4. RLS activé
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename like 'margeo_%';

-- 5. Bucket storage
select id, public, file_size_limit
from storage.buckets
where id = 'uberly-screenshots';

-- 6. Derniers événements beta (doit retourner des lignes après tests)
select event_type, count(*) as n
from public.margeo_beta_events
where created_at > now() - interval '7 days'
group by event_type
order by n desc;

-- 7. Funnel testeurs
select * from public.uberly_beta_funnel
where is_beta_tester = true
limit 10;

-- 8. Taux extraction réussie (7 derniers jours)
select
  count(*) filter (where event_type = 'analysis_success') as successes,
  count(*) filter (where event_type = 'analysis_failed') as failures,
  round(
    100.0 * count(*) filter (where event_type = 'analysis_success')
    / nullif(
      count(*) filter (where event_type in ('analysis_success', 'analysis_failed')),
      0
    ),
    1
  ) as success_rate_pct
from public.margeo_beta_events
where created_at > now() - interval '7 days';
