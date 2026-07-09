# Uberly — Audit parcours backend

## Flux vérifié (code)

```
Signup (auth/actions) → trigger SQL profil → account_created event
Onboarding (actions/onboarding) → update profil → onboarding_completed
Analyze (api/uberly/analyze) → quota → storage → Gemini → scoring → save
Feedback (api/uberly/feedback) → validation → save → correction event
Location (api/uberly/location) → profil + location_logs
```

## Points de rupture identifiés

| Étape | Risque | Mitigation backend |
|-------|--------|-------------------|
| Signup | Email confirmation bloque login | Config Supabase : désactiver confirm email en beta |
| Profil | Trigger absent → 404 | `ensureProfileForUser()` fallback |
| Analyse | Gemini down | Erreur 500 + event `analysis_failed` |
| Extraction | Montant illisible | 422 + event, pas de save |
| Storage | Pas de SERVICE_ROLE | Upload silencieux, `storageOk: false` dans logs |
| Beta events | Pas de SERVICE_ROLE | Events ignorés, warning console |
| Quota | 6e analyse | 429 `DAILY_LIMIT_REACHED` |
| OAuth | Compte existant mal détecté | Fenêtre 120s sur `created_at` |

## Permissions RLS

Chaque table `margeo_*` : lecture/écriture limitée à `auth.uid()`.
`margeo_beta_events` : lecture seule client, écriture API (service_role).

## Commandes de vérification

```bash
node scripts/test-uberly-quota.mjs      # 9/9
node scripts/test-uberly-vision.mjs     # 4/4
node scripts/uberly-beta-check.mjs      # env local
curl /api/uberly/health                 # prod
```

Puis dans Supabase : `supabase/uberly-verify-beta.sql`
