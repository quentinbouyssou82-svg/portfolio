# Alertes sécurité Driveely

Procédure manuelle + hooks code pour surveiller les pics anormaux.

## Métriques clés

| Métrique | Source | Seuil suggéré | Action |
|----------|--------|---------------|--------|
| Échecs auth / h | logs `[driveely/audit] auth.signin_failed` + Sentry | > 50 / h | Vérifier credential stuffing |
| Signups / h | `auth-signup:global` rate limit | > 100 / h (déjà plafonné) | OK si rate limit OK |
| Rate limit 429 analyze | Vercel logs + Redis | Pic soudain | Vérifier BotID / WAF |
| WAF Bot Protection | Vercel Firewall | Faux positifs iOS | Rester Log Only si doute |
| Circuit breaker Mistral | `[driveely/security] mistral_circuit_breaker` | tripped=true | Vérifier abus + budget |
| App Attest fails | `[driveely/security] app_attest` | > 20 % des analyze | Rester log_only |
| BotID blocks | `[driveely/security] botid` | Pic | Passer strict seulement après observation |

## Configuration recommandée

### Vercel

1. **Firewall → Alerts** : email sur spike Bot Protection
2. **Logs → Drain** (optionnel) vers Datadog/Better Stack

### Sentry

1. Créer une alerte sur tag `route:analyze` + message `analyze.pipeline_failure`
2. Alerte sur volume d'événements `mistral.vision_failed_waste`

### Slack / Email (manuel)

Webhook simple : filtrer les logs Vercel contenant `[driveely/audit]` ou `[driveely/security]` avec `shouldBlock: true`.

## Code

- Audit : `lib/margeo/security/audit-log.ts` → table `driveely_security_audit`
- SQL : `supabase/driveely_security_audit.sql`
