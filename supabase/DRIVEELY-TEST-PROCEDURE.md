# Driveely — Procédure test par livreur beta

## Avant le test (toi)

1. Migrations 1→7 exécutées (voir `DRIVEELY-MIGRATIONS.md` + `driveely-beta-v3.sql`)
2. `.env` prod configuré, `DRIVEELY_BETA_MODE=true`
3. `curl https://TON-DOMAINE/api/driveely/health` → `readyForBeta: true`

## Par testeur (15 min)

### Étape 1 — Création compte
- S'inscrire email ou Google sur `/demos/driveely/signup`
- **Attendu** : redirection onboarding
- **Supabase** : `account_created` dans `margeo_beta_events`

### Étape 2 — Onboarding
- Remplir les 5 étapes (ville, plateformes, véhicule, objectifs)
- **Attendu** : dashboard vide
- **Supabase** : `onboarding_completed`, `is_beta_tester = true`

### Étape 3 — Première analyse
- Aller sur Analyse, autoriser GPS si demandé
- Uploader une **vraie capture** Uber Eats / Deliveroo
- **Attendu** : verdict + score en < 10 s
- **Supabase** : `first_analysis`, `analysis_success`, ligne dans `margeo_analyses`

### Étape 4 — Vérifier le résultat
- Montant extrait ≈ capture réelle
- Si `extractionQuality: partial` → warnings affichés, verdict prudent
- Historique contient la course

### Étape 5 — Feedback
- Répondre « Oui j'ai accepté » + temps/gain réels
- **Supabase** : `feedback_submitted`, éventuellement `feedback_correction`

### Étape 6 — Limite free (optionnel)
- Faire 5 analyses dans la journée
- La 6e doit renvoyer erreur 429

## En cas de problème

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| 422 capture illisible | Gemini n'a pas lu le montant | Reprendre photo, vérifier clé API |
| 404 profil | Trigger SQL absent | `ensureProfile` corrige — vérifier migrations |
| 500 save | RLS ou colonnes manquantes | Exécuter `driveely-verify-beta.sql` |
| Pas d'events beta | SERVICE_ROLE manquante | Ajouter clé + redéployer |
| Image non stockée | Bucket absent | Exécuter `driveely-backend-v2.sql` |

## SQL monitoring après session

```sql
select * from driveely_beta_funnel where user_id = 'UUID';
select * from driveely_beta_vision_stats limit 7;
select * from driveely_beta_errors limit 20;
```
