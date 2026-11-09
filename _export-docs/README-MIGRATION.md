# Driveely web — Migration to a new Mac

This folder is the **web-only** Driveely export (no Instagram, no other portfolio demos).

## Layout

| Path | Description |
|------|-------------|
| `Driveely-app/code/` | Lean Next.js tree to continue Driveely (`/demos/driveely`) |
| `Driveely-app/docs/` | Secrets, migration notes, `DRIVEELY-*.md` |
| `Driveely-app/assets/` | Driveely public images (also in `code/public/driveely`) |

Sister folder: `Driveely-iOS/` for the Expo/iOS app.

## Prerequisites

1. Node.js LTS (20+) — https://nodejs.org or `brew install node`
2. Git (`xcode-select --install`)
3. Vercel project access (Driveely / driveely.app — pas le projet Margéo resto)
4. Supabase / Stripe / etc. — see `SECRETS-ET-ACCES.md` (private)

## Start the web app

```bash
cp -R "/Volumes/PHILIPS UFD/Driveely-app/code" ~/Developer/driveely-web
cd ~/Developer/driveely-web

ls -la .env.local   # should be present
npm install
npm run dev
```

Open http://localhost:3000 — root redirects to `/demos/driveely`.

## Notes

- Other portfolio demos/projects were **removed** from this copy.
- `.git` history from the portfolio monorepo is kept when present (working tree is pruned).
- `node_modules` / `.next` were not copied — always `npm install` on the new machine.
