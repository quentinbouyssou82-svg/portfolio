# Exemples — audit landing (Vercel Web Interface Guidelines)

## Prompt d’audit (copier-coller)

```text
Audite cette landing contre le skill vercel-design.
Lis CHECKLIST.md dans /Users/quentinbouyssou/portfolio/skills/vercel-design/
(ou ~/.cursor/skills/vercel-design/CHECKLIST.md).
Pour chaque item : PASS / FAIL / N/A avec preuve (fichier:ligne ou observation UI).
Corrige les FAIL bloquants (a11y, focus, zoom, contraste, liens, CLS, reduced-motion).
Ne invente aucune règle hors des Web Interface Guidelines Vercel.
Si uiux-pro-max s’applique, lance aussi sa checklist ; le design system du repo prime.
```

## Prompt review code (style `command.md`)

```text
Review ces fichiers pour conformité Vercel Web Interface Guidelines.
Output concis, groupé par fichier, format path:line — finding.
Flag anti-patterns : zoom disabled, paste blocked, transition:all,
outline-none sans remplacement, navigation sans <a>, images sans dimensions,
icon buttons sans aria-label, inputs sans label.
```

---

## Pass / Fail par thème

### Focus

| | Exemple |
|---|--------|
| **PASS** | `button:focus-visible { outline: 2px solid …; outline-offset: 2px }` |
| **FAIL** | `button { outline: none }` ou `outline-none` Tailwind **sans** `focus-visible:ring-*` |

### Liens

| | Exemple |
|---|--------|
| **PASS** | `<Link href="/pricing">Pricing</Link>` / `<a href="…">` |
| **FAIL** | `<div onClick={() => router.push('/pricing')}>Pricing</div>` |

### Zoom & mobile

| | Exemple |
|---|--------|
| **PASS** | `<meta name="viewport" content="width=device-width, initial-scale=1">` + inputs `text-base` (≥16px) |
| **FAIL** | `maximum-scale=1` ou `user-scalable=no` ; input `text-sm` (14px) sur mobile |

### Motion

| | Exemple |
|---|--------|
| **PASS** | `@media (prefers-reduced-motion: reduce) { * { animation: none; transition: none } }` + `transition: opacity 200ms, transform 200ms` |
| **FAIL** | `transition: all 300ms` ; hero animée en boucle sans respect reduced-motion |

### Images / CLS

| | Exemple |
|---|--------|
| **PASS** | `<Image src=… width={1200} height={630} priority alt="…" />` |
| **FAIL** | `<img src="/hero.png">` sans width/height ni aspect-ratio réservé |

### A11y boutons

| | Exemple |
|---|--------|
| **PASS** | `<button type="button" aria-label="Open menu"><MenuIcon aria-hidden /></button>` |
| **FAIL** | `<button><MenuIcon /></button>` sans nom accessible |

### Formulaires

| | Exemple |
|---|--------|
| **PASS** | Submit toujours cliquable → au submit : disable + spinner + label « Subscribe » conservé ; erreur sous le champ email |
| **FAIL** | Submit `disabled` tant que le champ est vide (empêche de voir la validation) ; paste bloqué sur email |

### Contraste / états

| | Exemple |
|---|--------|
| **PASS** | Lien repos gris foncé ; hover/focus plus sombre ou underline + ring |
| **FAIL** | Texte gris clair sur fond blanc sous seuil APCA/AA ; hover identique au repos |

### Copy (Vercel-specific — optionnel)

| | Exemple |
|---|--------|
| **PASS** (marketing) | « Ship faster with previews. » (sentence case) + CTA « Start deploying » |
| **FAIL** (si ton Vercel exigé) | CTA « Continue » ; erreur « Invalid input » sans next step |

### Ellipsis & typo

| | Exemple |
|---|--------|
| **PASS** | « Loading… » / « Learn more… » avec caractère `…` |
| **FAIL** | « Loading... » avec trois points ASCII |

---

## Exemple de rapport agent (court)

```text
## Landing /pricing — audit Vercel WIG

PASS: 41 | FAIL: 4 | N/A: 12

FAIL
- components/Hero.tsx:28 — <img> sans dimensions (CLS)
- components/Nav.tsx:44 — menu icon button sans aria-label
- app/layout.tsx:12 — maximum-scale=1 dans viewport
- styles/globals.css:90 — transition: all sur .cta

N/A: forms, virtualization, optimistic UI (landing statique)

Bloquants corrigés avant ship : OUI/NON
Pro Max: non demandé
```

---

## Ce qui n’est **pas** dans les guidelines

Ne pas inventer comme règles Vercel WIG :

- « Hero full-bleed obligatoire »
- « Pas de cards »
- Choix de police / palette brand (→ design system repo ou Geist si projet Vercel)
- Structure pricing / social proof

Ces sujets peuvent venir d’autres skills (ex. uiux-pro-max, frontend-ai-studio) — les séparer clairement du rapport WIG.
