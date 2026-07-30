# Driveely — Auth stability fix (2026-07-30)

## Symptom

After login / logout / reconnect, intermittent:

> This page couldn't load

Also: blank screens during protected navigation.

## Root causes

1. **Middleware dropped refreshed auth cookies on redirect**  
   `supabase.auth.getUser()` writes refreshed session cookies onto a `NextResponse` (rewrite/next). Auth redirects then returned a **new** `NextResponse.redirect()` **without** copying those cookies → inconsistent session on the next document/RSC request.

2. **Soft RSC navigation after server-action auth**  
   `signInAction` / `signUpAction` called `redirect()` while cookies were still settling. Next.js App Router soft-navigates the RSC payload → race → "This page couldn't load" (classic Supabase SSR + Next pattern).

3. **Unhandled middleware exceptions**  
   Network / JWT refresh failures in `getUser()` or profile reads could crash Edge middleware → same error page.

## Fixes

| Area | Change |
|------|--------|
| `middleware.ts` | Rebuild response on `setAll`; `redirectPreservingCookies`; try/catch around auth/profile |
| `lib/margeo/auth/middleware-response.ts` | Cookie-preserving redirect helper |
| `lib/margeo/auth/actions.ts` | Return `{ ok, redirectTo }` instead of `redirect()` |
| `components/margeo/auth/auth-form.tsx` | `window.location.assign` on success (hard nav) |
| `how-it-works-tour.tsx` | Hard nav after tour |
| `deconnexion/route.ts` | `Cache-Control: no-store` |

## Verification

```bash
set -a && source .env.local && set +a
AUTH_CYCLES=5 npm run qa:auth-cycles
```

Scenario per cycle: login → dashboard → refresh → logout → login → dashboard → logout.

Expected: **0** "couldn't load", **0** blank pages, clean redirects to login / onboarding / dashboard.
