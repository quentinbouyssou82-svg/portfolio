-- Driveely — élargir les CHECK prod pour ne plus casser saveAnalysis.
-- Sûr à rejouer. Ne change pas le moteur économique.
-- À exécuter dans Supabase → SQL Editor (projet prod).

alter table public.margeo_rides
  drop constraint if exists margeo_rides_vision_source_check;

alter table public.margeo_rides
  add constraint margeo_rides_vision_source_check
  check (vision_source is null or vision_source in ('mock', 'vision', 'on_device_ocr'));

alter table public.margeo_rides
  drop constraint if exists margeo_rides_extraction_quality_check;

alter table public.margeo_rides
  add constraint margeo_rides_extraction_quality_check
  check (
    extraction_quality is null
    or extraction_quality in ('complete', 'partial', 'failed', 'unsafe')
  );

alter table public.margeo_rides
  alter column distance_km drop not null;

alter table public.margeo_rides
  alter column duration_min drop not null;
