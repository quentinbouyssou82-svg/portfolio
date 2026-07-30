# Driveely — une app, deux modes (même domaine)

Une **codebase**, un **déploiement** (`driveely.app`).  
Le mode **public / officiel** vs **bêta** est une préférence **cookie/session**, pas un second site Vercel.

## Modes

| Source | Valeurs | Rôle |
|--------|---------|------|
| Cookie `driveely_app_mode` | `production` \| `beta` | Préférence utilisateur (prioritaire) |
| Header `x-driveely-app-mode` | idem | Injecté par le middleware pour le SSR |
| `DRIVEELY_APP_MODE` / `NEXT_PUBLIC_DRIVEELY_APP_MODE` | idem | **Défaut** si aucun cookie |
| Legacy `DRIVEELY_BETA_MODE=true` | — | Fallback défaut → beta (à éviter) |

Les feature flags sont dérivés via `lib/margeo/config` :

- **production (public)** : freemium, paywall, billing code présent ; achats réels seulement si `DRIVEELY_PURCHASES_ENABLED=true`
- **beta** : tout débloqué, pas de paiement, badge Bêta, feedback

## Parcours produit

```
Landing (driveely.app)
  → CTA « Rejoindre la bêta »  (joinBetaAction → cookie=beta)
  → Auth (/login?mode=signup&beta=1) si anonyme
  → App en mode bêta (premium unlocked, pas Stripe)
```

Sortie bêta (optionnelle) : `leaveBetaAction` → cookie=`production`.

## Architecture

```
lib/margeo/config/
  mode-cookie.ts     # cookie + header
  environment.ts     # getAppMode / getAppModeAsync
  features.ts        # getAppFeatures / getAppFeaturesAsync
  index.ts

lib/margeo/actions/beta-mode.ts   # joinBetaAction / leaveBetaAction
components/margeo/beta/join-beta-cta.tsx
```

**Règle d'or** : ne jamais écrire `if (process.env…beta)` dans les composants.  
Toujours : `getAppFeatures().paywall`, `.billing`, `.purchasesEnabled`, `.allPremiumUnlocked`, etc.  
Sur le serveur, préférer `getAppFeaturesAsync()` / `getAppModeAsync()`.

## Vercel (un seul projet)

```
DRIVEELY_APP_MODE=production
NEXT_PUBLIC_DRIVEELY_APP_MODE=production
NEXT_PUBLIC_APP_URL=https://driveely.app
NEXT_PUBLIC_DRIVEELY_AT_ROOT=true
# Achats Stripe (officiel) — laisser false jusqu'à ouverture
# DRIVEELY_PURCHASES_ENABLED=true
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

Plus besoin d'un projet `driveely-beta` / `beta.driveely.app` pour le mode app.  
Les hôtes legacy beta peuvent rester dans `DRIVEELY_PRODUCT_HOSTS` si tu veux encore router le produit dessus.

## Flip « ouverture officielle »

1. `DRIVEELY_PURCHASES_ENABLED=true` (+ clés Stripe)
2. Les utilisateurs sans cookie restent en production (défaut)
3. Les cookies `beta` continuent de débloquer la bêta tant qu'ils existent
4. Aucun refactor de features métier

## Comportement

| Zone | Production (achats off) | Bêta |
|------|-------------------------|------|
| Entitlements | Freemium | Elite effectif (`unlockSource: app_mode`) |
| `/premium` | « Ouverture prochaine » | Fonctionnalités débloquées |
| Checkout | Bloqué (« Ouverture prochaine ») | Désactivé |
| Soft banner | Oui (si freemium) | Masqué |
| Badge UI | Non | Oui |

**Pas d’incohérence** : en bêta, « premium effectif » ≠ « client payant ». Aucune écriture `premium=true` en base uniquement à cause du mode app.

## Cron RGPD (captures 30 jours)

Inchangé — `CRON_SECRET` + route cron Vercel. Voir le reste de la doc ops dans le repo.
