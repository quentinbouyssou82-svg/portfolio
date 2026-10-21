# Plafond de dépense Mistral — procédure manuelle

> Action **hors code** — à configurer sur le [dashboard Mistral](https://console.mistral.ai/) avant toute montée en charge.

## 1. Définir un budget mensuel

1. Connecte-toi à [console.mistral.ai](https://console.mistral.ai/)
2. Va dans **Billing** / **Usage** (libellé exact selon l’UI Mistral)
3. Définis un **plafond mensuel** (exemples selon phase produit) :

| Phase | Utilisateurs actifs | Plafond suggéré | Alerte à |
|-------|---------------------|-----------------|----------|
| Bêta fermée | < 50 | **10 €** | 50 % |
| Lancement | 100–500 | **50 €** | 60 % |
| Croissance | 1 000+ | **200 €** | 70 % |

> Les montants sont indicatifs — calibrer avec `estimatedCostEur` des logs `[driveely/mistral] vision_failed_waste`.

## 2. Configurer une alerte email

1. Dans **Billing → Alerts** (ou équivalent)
2. Active une alerte quand le budget atteint **50–70 %**
3. Ajoute une seconde alerte à **90 %**
4. Email : ton adresse ops + éventuellement Slack (webhook)

## 3. Calibrer l’estimation côté code

Variables optionnelles sur Vercel (depuis la page pricing Mistral pour `mistral-small-latest`) :

```env
DRIVEELY_MISTRAL_INPUT_EUR_PER_M=0.15
DRIVEELY_MISTRAL_OUTPUT_EUR_PER_M=0.15
```

Les logs `vision_failed_waste` incluront alors un `estimatedCostEur` plus précis.

## 4. Surveillance hebdomadaire

Checklist :

- [ ] Usage dashboard Mistral vs plafond
- [ ] Nombre d’events Sentry `mistral.vision_failed_waste`
- [ ] Coût moyen estimé par analyse (logs pipeline)
- [ ] Taux d’échec Vision (step `vision` en timeout/fail)

## 5. En cas de dépassement

1. Vérifier mode app : `DRIVEELY_APP_MODE=production` (pas beta env)
2. Vérifier abus : rate limit Redis (Phase 3) ou désactiver temporairement `/analyze`
3. Activer cache Redis Vision (Phase 3) pour réduire appels
4. Activer OCR on-device (Phase 2) pour réduire volume Mistral

## Références code

- Estimation coût : `lib/margeo/vision/estimate-mistral-cost.ts`
- Log gaspillage : `[driveely/mistral] vision_failed_waste`
- Garde-fou beta prod : `lib/margeo/config/assert-production-safe.ts`
