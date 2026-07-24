# Driveely — Cron RGPD (purge captures)

## Objectif

Supprimer automatiquement les captures d'écran de plus de **30 jours**
(`DRIVEELY_LIMITS.screenshotRetentionDays`).

## Configuration Vercel (obligatoire)

1. Générer un secret :
   ```bash
   openssl rand -hex 32
   ```
2. Dans **chaque** projet Vercel (beta + production) :
   - Settings → Environment Variables
   - `CRON_SECRET` = la valeur générée (Production + Preview)
3. Redéployer après ajout.

Sans `CRON_SECRET`, l'endpoint répond `503 CRON_NOT_CONFIGURED` et **aucune purge** ne tourne.

## Planification

Définie dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/driveely/cron/purge-screenshots",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Vercel Cron appelle la route avec :
`Authorization: Bearer ${CRON_SECRET}`

## Appel manuel (ops)

```bash
curl -X POST "https://TON_DOMAINE/api/driveely/cron/purge-screenshots" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Réponse attendue : `{ "ok": true, ...stats }`  
Sans bearer valide : `401`. Sans secret configuré : `503`.
