# Driveely — domaine produit (driveely.app)

## Cause du bug Nocta sur driveely.app

Le monorepo sert **Nocta** via `app/page.tsx` à la racine `/`.

Driveely vit sous `app/demos/driveely` → URL interne `/demos/driveely`.

Le middleware ne redirigeait `/` vers Driveely **que** pour d’anciens hôtes.
`driveely.app` n’était pas dans la liste → `/` = Nocta.

## Solution

Sur les **hôtes produit** (`driveely.app`, `www.driveely.app`, `beta.driveely.app`) :

1. Rewrite `/` → `/demos/driveely` (fichiers inchangés)
2. Rewrite `/login`, `/dashboard`, `/analyse`, … → `/demos/driveely/…`
3. Redirect 301 `/demos/driveely/*` → `/*` (URLs canoniques propres)
4. Nocta / Maison / Control Tower non servis

`margeo.vercel.app` n’est **plus** un hôte Driveely (autre produit).

Variable Vercel (projet Driveely) :

```
NEXT_PUBLIC_DRIVEELY_AT_ROOT=true
```

→ liens client en `/login`, `/dashboard` (plus de `/demos/driveely` dans l’UI).

## Vérifications

| URL | Attendu |
|-----|---------|
| https://driveely.app/ | Landing Driveely |
| https://driveely.app/login | Login Driveely |
| https://driveely.app/dashboard | Dashboard (auth) |
| https://driveely.app/analyse | Analyse (auth) |

Header de contrôle : `x-driveely-host-mode: product`
