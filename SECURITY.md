# Driveely — Sécurité (driveely-web)

Document auditable des mesures de sécurité. Chaque protection sensible passe d'abord en **log only**, puis en **strict** après observation.

## Principes

1. **Backward-compatible** : ne jamais bloquer un utilisateur légitime sans phase d'observation.
2. **Log only → strict** : variables `*_MODE=log_only|strict` (alias `block` pour strict).
3. **Chemin critique préservé** : auth → quota → Vision → moteur → réponse.

---

## Phase 1 — Garde-fous anti-abus

### 1.1 Mode beta en production (env vars)

| Statut | Implémentation |
|--------|----------------|
| ✅ Actif | `lib/margeo/config/assert-production-safe.ts` |

Le build et le runtime **échouent** si `VERCEL_ENV=production` et `DRIVEELY_APP_MODE=beta` (ou `NEXT_PUBLIC_*`).

Tests : `npx tsx scripts/test-assert-production-safe.ts`

### 1.2 Vercel WAF — Bot Protection

| Statut | Action |
|--------|--------|
| 📋 Manuel + doc | [`docs/DRIVEELY-VERCEL-WAF.md`](docs/DRIVEELY-VERCEL-WAF.md) |

### 1.3 Circuit breaker Mistral (24 h)

| Statut | Implémentation |
|--------|----------------|
| ✅ Actif (log only par défaut) | `lib/margeo/security/mistral-circuit-breaker.ts` |

Compteur Redis si Upstash configuré, sinon RAM. Variables : `MISTRAL_DAILY_CALL_LIMIT`, `MISTRAL_CIRCUIT_BREAKER_MODE`.

Plafond dashboard : [`docs/DRIVEELY-MISTRAL-BUDGET.md`](docs/DRIVEELY-MISTRAL-BUDGET.md)

### 1.4 Validation StoreKit (App Store Server API)

| Statut | Implémentation |
|--------|----------------|
| ✅ Actif (log only par défaut) | `lib/margeo/billing/app-store-verify.ts` |

iOS envoie le JWS ; le serveur vérifie Apple. `provider: simulated` désactivé en production.

---

## Phase 2 — Attestation & API

### 2.1 Apple App Attest

| Statut | Implémentation |
|--------|----------------|
| ✅ Actif (désactivé par défaut / log_only) | `lib/margeo/security/app-attest.ts` + iOS `DriveelyAppAttestService` |

```env
APP_ATTEST_ENABLED=false          # true pour activer l'observation
APP_ATTEST_MODE=log_only          # puis strict
APPLE_TEAM_ID=
```

Endpoints : `POST /api/driveely/attest/challenge`, `POST /api/driveely/attest/register`.  
Headers sur `/analyze` : `X-Driveely-Attest-*`. Entitlement iOS : `com.apple.developer.devicecheck.appattest-environment`.

### 2.2 Rate limit distribué Redis

| Statut | Implémentation |
|--------|----------------|
| ✅ Actif | `lib/margeo/api/rate-limit-redis.ts` + `global-rate-limit.ts` |

Routes branchées : analyze, feedback, survey, location, product-feedback, auth signup.  
Fallback RAM si Upstash absent.

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
DRIVEELY_GLOBAL_ANALYZE_PER_MIN=500
```

### 2.3 Vercel BotID

| Statut | Implémentation |
|--------|----------------|
| ✅ Actif (désactivé par défaut / log_only) | `lib/margeo/security/botid-guard.ts` |

```env
BOTID_ENABLED=false
BOTID_MODE=log_only
```

Clients iOS (`X-Driveely-Client: ios`) exclus — App Attest à la place.  
Client web : `instrumentation-client.ts` + `withBotId(nextConfig)`.

---

## Phase 3 — Secrets & supply chain

| Mesure | Statut |
|--------|--------|
| Gitleaks CI | ✅ `.github/workflows/gitleaks.yml` (web + iOS) |
| Dependabot | ✅ `.github/dependabot.yml` |
| Rotation trimestrielle | ✅ Runbook ci-dessous |
| Audit service_role | ✅ Documenté |

### Rotation trimestrielle (runbook)

**Cadence** : 1er jour ouvré de jan/avr/jul/oct. **Owner** : ops Driveely.

Secrets (ordre) :

1. `MISTRAL_API_KEY` — dual-key 24 h si possible → Vercel → déployer → révoquer ancienne
2. `SUPABASE_SECRET_KEY` / `SERVICE_ROLE` — Dashboard Supabase → Vercel → redéployer
3. `CRON_SECRET` — `openssl rand -hex 32` → Vercel Cron
4. `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`/`AUTH_TOKEN`, `STRIPE_*`, `APPLE_*` si exposés

**Rollback** : remettre l'ancienne valeur Vercel + redeploy immédiat. Ne révoquer l'ancienne clé qu'après N heures de stabilité.

Checklist post-rotation : health, analyze test, login, cron purge.

### Audit clé service Supabase

Usages légitimes de `getMargeoAdminDb()` :

| Fichier | Nécessité |
|---------|-----------|
| `services/storage.ts` | Upload / purge Storage |
| `services/screenshot-retention.ts` | Cron purge |
| `services/account.ts` | Suppression compte + export |
| `services/subscription.ts` | Sync metadata auth post-achat |
| `auth/actions.ts` | Signup admin bêta / confirm email |
| `security/audit-log.ts` | Insert audit (RLS deny client) |
| `onboarding-repair.ts` | Réparation onboarding |

`request-db.ts` : **ne plus préférer** service_role — Bearer/cookies d'abord ; fallback admin loggé.

---

## Phase 4 — RGPD

| Mesure | Statut |
|--------|--------|
| Scrubbing PII logs/Sentry | ✅ `lib/margeo/security/pii-scrub.ts` |
| Suppression compte | ✅ `DELETE /api/driveely/account` |
| Export JSON | ✅ `GET /api/driveely/account/export` |
| Inventaire sous-traitants | ✅ [`PRIVACY.md`](PRIVACY.md) |

---

## Phase 5 — Observabilité

| Mesure | Statut |
|--------|--------|
| Sentry + beforeSend scrub | ✅ `sentry.server.config.ts` |
| Alertes sécurité | ✅ [`docs/DRIVEELY-SECURITY-ALERTS.md`](docs/DRIVEELY-SECURITY-ALERTS.md) |
| Journal d'audit | ✅ `lib/margeo/security/audit-log.ts` + `supabase/driveely_security_audit.sql` |

---

## Variables d'environnement sécurité (résumé)

| Variable | Défaut | Rôle |
|----------|--------|------|
| `MISTRAL_DAILY_CALL_LIMIT` | `0` | Plafond Mistral 24 h |
| `MISTRAL_CIRCUIT_BREAKER_MODE` | `log_only` | Circuit breaker |
| `STOREKIT_VERIFICATION_MODE` | `log_only` | Vérif StoreKit |
| `APP_ATTEST_ENABLED` | `false` | App Attest |
| `APP_ATTEST_MODE` | `log_only` | Mode App Attest |
| `BOTID_ENABLED` | `false` | BotID web |
| `BOTID_MODE` | `log_only` | Mode BotID |
| `UPSTASH_REDIS_REST_*` | — | Rate limit / challenges |

## Déploiement progressif recommandé

1. Déployer code (tous modes log_only / flags off)
2. Upstash Redis → observer rate limits
3. WAF Bot Protection log only
4. `APP_ATTEST_ENABLED=true` log_only → puis strict
5. `BOTID_ENABLED=true` log_only (web) → puis strict
6. `STOREKIT_VERIFICATION_MODE=strict` + `MISTRAL_CIRCUIT_BREAKER_MODE=strict`
7. Appliquer SQL `driveely_security_audit.sql`

*Dernière mise à jour : Phases 1–5 implémentées (août 2026).*
