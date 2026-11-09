-- Driveely — Correction des privilèges UPDATE sur margeo_profiles
-- Date : 2026-11-09
-- Auteur : Claude Code (Mission finale)
--
-- PROBLÈME : authenticated et anon ont un GRANT UPDATE table-level sur margeo_profiles.
-- Le REVOKE column-level sur is_beta_tester est inefficace (PostgreSQL : table-level > column-level).
--
-- SOLUTION : Retirer le GRANT table-level, puis ré-accorder UPDATE uniquement sur les
-- colonnes de profil que les utilisateurs peuvent légitimement modifier.
--
-- COLONNES PROTÉGÉES (billing + beta) :
--   premium, premium_until, premium_source, plan_id, is_beta_tester
--   → Modifiables uniquement par service_role (backend)
--   → Double protection : trigger trg_margeo_profiles_protect_billing + GRANT column-level
--
-- COLONNES AUTORISÉES (profil utilisateur) :
--   name, city, vehicle, cost_per_km, target_hourly, daily_target, platforms,
--   onboarding_completed, other_platform, last_lat, last_lng, location_updated_at,
--   location_permission, min_benefit, max_distance_km, empty_returns, weekly_hours,
--   vehicle_details, updated_at
--
-- COMPATIBILITÉ :
--   - iOS : met à jour name, city, vehicle, coûts, location, onboarding → OK
--   - Backend (service_role) : bypasse ces restrictions → OK
--   - RLS policy margeo_profiles_update_own (auth.uid() = id) : inchangée → OK
--
-- IDEMPOTENT : safe to re-run.
-- DOWNTIME : aucun.
-- TEMPS D'EXÉCUTION : < 1 seconde.
--
-- ROLLBACK :
--   GRANT UPDATE ON public.margeo_profiles TO authenticated;
--   GRANT UPDATE ON public.margeo_profiles TO anon;

-- ============================================================================
-- ÉTAPE 1 : Sauvegarder l'état actuel (pour vérification, pas d'effet)
-- ============================================================================
-- Avant exécution, vérifier :
--   SELECT grantee, privilege_type FROM information_schema.table_privileges
--   WHERE table_name = 'margeo_profiles' AND privilege_type = 'UPDATE';
-- Attendu : authenticated, anon, service_role, postgres (tous table-level)

-- ============================================================================
-- ÉTAPE 2 : Retirer UPDATE table-level pour authenticated et anon
-- ============================================================================
REVOKE UPDATE ON public.margeo_profiles FROM authenticated;
REVOKE UPDATE ON public.margeo_profiles FROM anon;

-- ============================================================================
-- ÉTAPE 3 : Ré-accorder UPDATE sur les colonnes de profil uniquement
-- ============================================================================
GRANT UPDATE (
  name,
  city,
  vehicle,
  cost_per_km,
  target_hourly,
  daily_target,
  platforms,
  onboarding_completed,
  other_platform,
  last_lat,
  last_lng,
  location_updated_at,
  location_permission,
  min_benefit,
  max_distance_km,
  empty_returns,
  weekly_hours,
  vehicle_details,
  updated_at
) ON public.margeo_profiles TO authenticated;

-- Note : anon ne reçoit AUCUN GRANT UPDATE.
-- anon n'a pas de policy UPDATE dans RLS de toute façon, mais on retire aussi le GRANT
-- pour la défense en profondeur.

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================
-- Test 1 : Colonnes billing inaccessibles pour authenticated
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'is_beta_tester', 'UPDATE');
--   → Attendu : false
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'premium', 'UPDATE');
--   → Attendu : false
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'premium_until', 'UPDATE');
--   → Attendu : false
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'premium_source', 'UPDATE');
--   → Attendu : false
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'plan_id', 'UPDATE');
--   → Attendu : false

-- Test 2 : Colonnes profil accessibles pour authenticated
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'name', 'UPDATE');
--   → Attendu : true
--   SELECT has_column_privilege('authenticated', 'margeo_profiles', 'vehicle', 'UPDATE');
--   → Attendu : true

-- Test 3 : anon bloqué partout
--   SELECT has_table_privilege('anon', 'margeo_profiles', 'UPDATE');
--   → Attendu : false

-- Test 4 : service_role conserve tous les droits
--   SELECT has_column_privilege('service_role', 'margeo_profiles', 'is_beta_tester', 'UPDATE');
--   → Attendu : true
--   SELECT has_column_privilege('service_role', 'margeo_profiles', 'premium', 'UPDATE');
--   → Attendu : true

-- Test 5 : Trigger billing toujours en place
--   SELECT tgname, tgenabled FROM pg_trigger
--   WHERE tgname = 'trg_margeo_profiles_protect_billing';
--   → Attendu : 1 row, tgenabled = 'O'

-- Test 6 : Beta testers inchangés
--   SELECT count(*) FROM margeo_profiles WHERE is_beta_tester = true;
--   → Attendu : 52

-- Test 7 : Simulation d'attaque (en tant qu'authenticated via RPC ou PostgREST)
--   UPDATE margeo_profiles SET is_beta_tester = true WHERE id = auth.uid();
--   → Attendu : ERROR permission denied for column is_beta_tester
--   UPDATE margeo_profiles SET premium = true WHERE id = auth.uid();
--   → Attendu : ERROR permission denied for column premium
