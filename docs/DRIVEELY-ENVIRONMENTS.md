# Driveely — environnements (Beta vs Production)

Une **codebase**, deux **projets Vercel**. Aucune duplication de features métier.

## Modes

| Variable | Valeurs | Où |
|----------|---------|-----|
| `DRIVEELY_APP_MODE` | `production` \| `beta` | Serveur (Vercel) |
| `NEXT_PUBLIC_DRIVEELY_APP_MODE` | **identique** | Client + serveur |

Les feature flags sont dérivés automatiquement via `lib/margeo/config` :

- **production** : freemium, paywall, billing, Stripe (quand branché)
- **beta** : tout débloqué, pas de paiement, pas de paywall, feedback prêt

## Architecture

```
lib/margeo/config/
  environment.ts   # getAppMode()
  features.ts      # getAppFeatures()
  index.ts

lib/margeo/feedback/   # stubs bug / idée / problème
```

**Règle d'or** : ne jamais écrire `if (process.env…beta)` dans les composants.
Toujours : `getAppFeatures().paywall`, `.billing`, `.allPremiumUnlocked`, etc.

## Projets Vercel

### 1. Production (ex. `driveely` / `uberly.app`)

```
DRIVEELY_APP_MODE=production
NEXT_PUBLIC_DRIVEELY_APP_MODE=production
NEXT_PUBLIC_APP_URL=https://uberly.app   # ou domaine Driveely
# + Supabase prod
# + STRIPE_* quand prêt
```

### 2. Beta (ex. `driveely-beta` / `beta.uberly.app`)

```
DRIVEELY_APP_MODE=beta
NEXT_PUBLIC_DRIVEELY_APP_MODE=beta
NEXT_PUBLIC_APP_URL=https://beta.uberly.app
# + même Supabase OU projet Supabase dédié (recommandé long terme)
# PAS de STRIPE_SECRET_KEY
```

Déploiements indépendants : push sur la même branche ou branches distinctes ; chaque projet Vercel a son propre set d'env.

## Supabase

- **Court terme** : même projet Supabase (auth + data inchangés).
- **Moyen terme** : projet Supabase séparé pour la bêta (isolation totale).
- Colonne `is_beta_tester` déjà présente ; les events `margeo_beta_events` peuvent porter `metadata.appMode`.

Aucune migration obligatoire pour activer le mode app.

## Comportement bêta

| Zone | Effet |
|------|--------|
| Entitlements | Elite pour tous |
| Quota | Illimité |
| `/premium` | Page « Fonctionnalités débloquées » |
| `/subscription`, checkout | Redirect → `/premium` |
| Onboarding | → dashboard (pas paywall) |
| Soft banner | Masqué |
| `activatePlanAction` | Refusé (message clair) |

## Feedback (préparé)

`submitFeedbackAction({ kind: 'bug' \| 'idea' \| 'issue', title, body })`  
UI à brancher plus tard ; flags `features.feedback.*` déjà actifs en mode beta.

## Local

```bash
# .env.local — tester la bêta
DRIVEELY_APP_MODE=beta
NEXT_PUBLIC_DRIVEELY_APP_MODE=beta
```

Legacy : `DRIVEELY_BETA_MODE=true` bascule encore en mode beta (migration douce).
