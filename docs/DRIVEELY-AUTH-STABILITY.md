# Driveely — Auth stability fix (driveely.app)

## Target

- Domain: **https://driveely.app**
- Repo: `quentinbouyssou82-svg/portfolio` @ `main`
- Vercel projects linked to this repo: `margeo` + `portfolio` (same push)

## Prod reproduction (before fix)

```http
GET https://driveely.app/deconnexion
→ 307 Location: https://margeo.vercel.app/login?loggedOut=1
```

`margeo.vercel.app` returns `DEPLOYMENT_NOT_FOUND` → *"This page couldn't load"* after logout/reconnect.

Root cause: `deconnexion` used `process.env.NEXT_PUBLIC_APP_URL` (stale `https://margeo.vercel.app`) instead of the live request origin (`https://driveely.app`).

Secondary (already mitigated in middleware/auth form): soft RSC redirects dropping refreshed Supabase cookies.

## Fix

1. `resolveDriveelyRequestOrigin(request)` — always prefer request host on product domains
2. `deconnexion/route.ts` uses that helper
3. SEO canonical ignores `margeo.vercel.app`
4. Auth form hard-nav + middleware cookie-preserving redirects

## Verify

```bash
curl -sI https://driveely.app/deconnexion | rg -i location
# expect: https://driveely.app/login?loggedOut=1  (NOT margeo.vercel.app)

AUTH_CYCLES=5 npm run qa:auth-cycles
```
