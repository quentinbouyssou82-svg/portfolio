# Driveely — Auth stability fix (driveely.app)

## Target

- Domain: **https://driveely.app**
- Repo: `quentinbouyssou82-svg/portfolio` @ `main`
- Vercel project: **`margeo`** (`.vercel/project.json`) — powers driveely.app

## Prod symptoms (before fix)

After a successful login, users sometimes saw:

1. Vercel **"This page couldn't load"** + English **Retry**, or
2. A bounce that felt like **"Connexion impossible"**

Clicking Retry then loaded the dashboard — session already existed.

## Root cause (factual)

Three cooperating races:

1. **`redirectPreservingCookies` dropped cookie attributes**  
   Middleware refreshed Supabase JWTs onto a response, then redirected with  
   `cookies.getAll()` → `set(name, value)` only. Path / Secure / HttpOnly /  
   Max-Age / SameSite were lost → intermittent session loss mid-navigation →  
   RSC failure → Vercel Retry page.

2. **Middleware bounced too early**  
   Auth cookies present but `getUser()` briefly null (JWT settle) → immediate  
   redirect to `/login` instead of letting the shell retry.

3. **Shell / sign-in had no wait**  
   `getAuthUser()` / `ensureProfileForUser()` returning null once redirected to  
   login. `getPostAuthPath` errors after a successful `signInWithPassword`  
   could surface as **"Connexion impossible."** even though cookies were set.

## Fix

1. `redirectPreservingCookies` copies raw `Set-Cookie` via `headers.getSetCookie()`
2. Middleware: if Supabase auth cookies exist but user is null → allow through  
   (`x-driveely-auth-soft: cookie-without-user`)
3. `waitForAuthUser` / `waitForProfile` with backoff in shell layout
4. Post-login **AuthContinuing** gate (logo + "Connexion en cours…", auto-retry;  
   no Retry button for transient failures)
5. `signIn` / signup: never fail the action for post-auth path races once  
   session cookies are set

## Verify

```bash
curl -sI https://driveely.app/deconnexion | rg -i location
# expect: https://driveely.app/login?loggedOut=1  (NOT margeo.vercel.app)

AUTH_CYCLES=5 npm run qa:auth-cycles
```

Expect: no `This page couldn't load`, no bare `Retry`, no `Connexion impossible`  
during post-login settle; dashboard after automatic gate.
