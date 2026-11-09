# Vercel WAF — Bot Protection (driveely-web)

Configuration **manuelle** sur le dashboard Vercel. Commencer toujours en **Log Only**.

## Prérequis

- Projet Vercel : `driveely-web` (production `driveely.app`)
- Accès **Owner** ou **Member** avec droits Security

## Étapes

### 1. Activer le Firewall

1. [Vercel Dashboard](https://vercel.com) → projet Driveely
2. **Settings** → **Firewall** (ou **Security** → **Web Application Firewall**)
3. Activer le **Web Application Firewall** si désactivé

### 2. Bot Protection (ruleset managé)

1. **Firewall** → **Managed Rulesets**
2. Activer **Bot Protection**
3. Mode initial : **Log Only** (observe sans bloquer)
4. Cibler au minimum :
   - `POST /api/driveely/analyze`
   - `POST /api/driveely/auth/*`
   - Routes signup / login

### 3. Observation (48–72 h)

Surveiller dans Vercel Firewall logs :

- Requêtes marquées bot vs humain
- Faux positifs (apps iOS légitimes, webhooks)
- Pics corrélés aux métriques Mistral / auth

### 4. Durcissement progressif

| Étape | Action |
|-------|--------|
| 1 | Log Only (actuel) |
| 2 | **Challenge** sur `/api/driveely/analyze` uniquement |
| 3 | **Challenge** sur auth + analyze |
| 4 | **Deny** bots avérés sur analyze (après validation zéro faux positif) |

> Les clients iOS natifs ne passent pas par un navigateur : valider que Bot Protection n'impacte pas les requêtes avec JWT Supabase légitimes avant Deny global.

### 5. Corrélation avec le code

- Rate limit applicatif : `lib/margeo/api/rate-limit.ts`
- Circuit breaker Mistral : `lib/margeo/security/mistral-circuit-breaker.ts`
- Doc globale : [`SECURITY.md`](../SECURITY.md)

## Rollback

Repasser Bot Protection en **Log Only** ou désactiver la règle — effet immédiat, sans redéploiement.

---

*Infrastructure as Code : Vercel ne versionne pas encore le WAF dans le repo ; cette doc fait office de source de vérité jusqu'à export Terraform/API Vercel.*
