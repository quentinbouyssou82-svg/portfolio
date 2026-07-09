# Uberly — Checklist backend beta

## Variables `.env.local` / Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (storage + beta events)
- [ ] `UBERLY_GEMINI_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (OAuth + reset password)
- [ ] `UBERLY_BETA_MODE=true` (logs verbeux + flag testeurs)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` (optionnel)

## Migrations Supabase

- [ ] 1 → 7 exécutées (voir `UBERLY-MIGRATIONS.md`)
- [ ] Google OAuth configuré dans Supabase Auth
- [ ] Redirect URL : `{APP_URL}/demos/uberly/auth/callback`

## Tests locaux

```bash
node scripts/test-uberly-vision.mjs   # 4/4
node scripts/test-uberly-quota.mjs    # quotas free/premium
node scripts/uberly-smoke.mjs http://localhost:3000
node scripts/uberly-beta-check.mjs    # variables env
```

Puis Supabase : `supabase/uberly-verify-beta.sql`

## Smoke test manuel

1. Créer un compte → onboarding → analyse capture
2. Vérifier historique + dashboard
3. Envoyer feedback après analyse
4. 6e analyse du jour (free) → erreur 429
5. Supabase : `select * from uberly_beta_funnel limit 5`

## Erreurs connues

- Storage upload silencieux si `SERVICE_ROLE_KEY` manquante (analyse OK sans image)
- Gemini mock auto en `NODE_ENV=development` si Vision échoue
- Rate limit en mémoire — une instance Vercel uniquement (Upstash recommandé plus tard)

## Commandes utiles

```bash
npm run dev
curl -H "Cookie: ..." http://localhost:3000/api/uberly/quota
```

## Prochaines actions post-beta

- Stripe webhook → `premium_source = 'stripe'`
- Upstash rate limit multi-instance
- Export CSV historique Premium
