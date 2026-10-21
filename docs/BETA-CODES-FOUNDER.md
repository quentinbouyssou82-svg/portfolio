# Codes bêta Premium — guide fondateur (2 min)

## Créer un code

```bash
cd driveely-web
npx tsx scripts/create-beta-codes.ts
# ou plusieurs :
npx tsx scripts/create-beta-codes.ts --count 5 --note "livreur Lyon"
```

Affiche `XXX-YYY` à envoyer.

Prérequis migration (déjà appliquée sur le projet uberly) :
`supabase/driveely-beta-codes-v1.sql`

## Envoyer

WhatsApp / SMS / Message : le code seul, ex. `CYN-YHV`.

## Livreur

1. Ouvre Driveely (connecté).
2. Écran « Êtes-vous bêta-testeur ? » → saisit le code → Valider.
   Ou plus tard : **Profil → J’ai un code bêta**.
3. « Accès bêta / Premium activé » → Premium immédiat.

## Vérifier

Supabase SQL :

```sql
select id, is_beta_tester, premium_source
from public.margeo_profiles
where is_beta_tester = true
order by updated_at desc nulls last
limit 20;
```

Ou dans l’app : Profil → « Accès premium actif ».

## Révoquer

Compte :

```sql
update public.margeo_profiles
set is_beta_tester = false
where id = 'UUID';
```

Code (ne révoque pas les comptes déjà redeemés) :

```sql
update public.driveely_beta_codes
set active = false
where code = 'CYNYHV';
```

## Ce soir (Debug LAN)

- Backend local : `npm run dev -- --hostname 0.0.0.0 --port 3000`
- iPhone + Mac même Wi‑Fi
- API Debug = `http://10.149.50.187:3000` (resync : `bash driveely-ios/Scripts/sync-lan-api-url.sh`)

Pour TestFlight / prod HTTPS : déployer `driveely-web` (route `/api/driveely/beta/redeem`) sur Vercel.
