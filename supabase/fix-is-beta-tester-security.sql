-- Driveely — Protection is_beta_tester : couche REVOKE complémentaire
-- Prérequis : driveely-security-entitlements-rls-v1.sql DOIT être appliqué d'abord.
-- Ce fichier ajoute une 4e couche (column-level REVOKE) sans dupliquer le trigger.
--
-- RÉSUMÉ des protections après les deux migrations :
--   1. Trigger trg_margeo_profiles_protect_billing (entitlements-rls-v1) :
--      reset silencieux de toutes les colonnes billing + is_beta_tester pour clients JWT
--   2. REVOKE UPDATE(is_beta_tester) (ce fichier) :
--      PostgREST rejette la requête avant même d'atteindre le trigger
--   3. policy margeo_profiles_update_own inchangée (par colonnes : vehicle, costs, etc.)
--
-- ROLLBACK :
--   GRANT UPDATE (is_beta_tester) ON public.margeo_profiles TO authenticated;

-- Column-level revoke (défense en profondeur, sans toucher au trigger existant)
REVOKE UPDATE (is_beta_tester) ON public.margeo_profiles FROM authenticated;
REVOKE UPDATE (is_beta_tester) ON public.margeo_profiles FROM anon;

-- Vérification : après migration, cette requête doit retourner DENIED ou 0 rows modifiées :
-- UPDATE public.margeo_profiles SET is_beta_tester = true WHERE id = auth.uid();
