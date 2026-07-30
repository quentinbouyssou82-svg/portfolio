# Règles — Vercel Web Interface Guidelines

Synthèse **fidèle aux sources** (MUST / SHOULD / NEVER). Détail et checklist : [CHECKLIST.md](./CHECKLIST.md). Sources : [SUMMARY.md](./SUMMARY.md).

Légende : **MUST** = non-négociable documenté · **SHOULD** = fortement recommandé · **NEVER** = anti-pattern documenté · **Vercel-only** = section brand, pas universelle.

---

## Interactions & clavier

| Règle | Niveau |
|-------|--------|
| Tous les flux opérables au clavier (WAI-ARIA APG) | MUST |
| Anneau de focus visible ; préférer `:focus-visible` ; groupes `:focus-within` | MUST |
| Gérer focus (trap / move / return) selon APG | MUST |
| `outline: none` sans remplacement visible | NEVER |
| Cible hit ≥ 24px ; mobile ≥ 44px (élargir si visuel plus petit) | MUST |
| `input` mobile font-size ≥ 16px (anti zoom iOS) | MUST |
| Désactiver le zoom navigateur (`user-scalable=no`, `maximum-scale=1`) | NEVER |
| `touch-action: manipulation` sur contrôles | MUST |
| `-webkit-tap-highlight-color` intentionnel | SHOULD |
| Inputs hydration-safe (pas de perte focus/valeur) | MUST |
| Bloquer le paste | NEVER |
| Bouton loading : spinner + **garder le label d’origine** | MUST |
| Liens de navigation = `<a>` / `<Link>` ; pas `<div>`/`<button>` pour naviguer | MUST |
| Confirmer actions destructives ou Undo | MUST |
| `overscroll-behavior: contain` dans modales/drawers | MUST |
| État UI deep-linkable (filtres, tabs, etc.) quand applicable | MUST |
| Si ça a l’air cliquable, ça doit l’être (pas de dead zones) | MUST |
| `aria-live="polite"` pour toasts / validation async | MUST |
| Autofocus : desktop + input primaire unique ; rarement mobile | SHOULD |

---

## Motion

| Règle | Niveau |
|-------|--------|
| Honorer `prefers-reduced-motion` (variante ou off) | MUST |
| Animer `transform` / `opacity` (compositor) | MUST |
| Animer `top` / `left` / `width` / `height` | NEVER |
| `transition: all` | NEVER |
| Préférer CSS > WAAPI > libs JS | SHOULD |
| Animer seulement cause/effet ou delight volontaire | SHOULD |
| Animations interruptibles + déclenchées par l’input (pas autoplay) | MUST |
| `transform-origin` correct ; SVG via wrapper `<g>` + `transform-box: fill-box` | MUST |

---

## Layout & responsive

| Règle | Niveau |
|-------|--------|
| Alignement délibéré (grille / baseline / bords) | MUST |
| Alignement optique ±1px si perception > géométrie | SHOULD |
| Vérifier mobile, laptop, ultra-wide (simuler 50 %) | MUST |
| Respecter `env(safe-area-inset-*)` | MUST |
| Corriger overflows / scrollbars parasites | MUST |
| Flex/grid plutôt que mesure JS | SHOULD |
| Balance poids/taille/couleur icon + texte | SHOULD |

---

## Typographie & contenu

| Règle | Niveau |
|-------|--------|
| Caractère ellipsis `…` (pas `...`) | MUST |
| Guillemets typographiques “ ” | SHOULD |
| Espaces insécables : `10&nbsp;MB`, raccourcis, noms de marque | MUST |
| Loading / suites : « Loading… », « Rename… » | SHOULD |
| `font-variant-numeric: tabular-nums` pour comparaisons chiffrées | MUST |
| Éviter veuves : `text-wrap: balance` / `text-pretty` sur titres | SHOULD |
| Conteneurs texte : truncate / line-clamp / break-words ; flex `min-w-0` | MUST |
| États empty / error / dense conçus ; pas d’impasse | MUST |
| `<title>` reflète le contexte | MUST |
| Skeletons = forme du contenu final (anti CLS) | MUST |
| Formats dates/nombres via `Intl.*` | MUST |
| Langue via Accept-Language / `navigator.languages`, pas IP | MUST |
| `translate="no"` sur marques, tokens, identifiants | SHOULD |

---

## Accessibilité

| Règle | Niveau |
|-------|--------|
| Sémantique native (`button`, `a`, `label`, `table`) avant ARIA | MUST |
| Boutons icon-only : `aria-label` descriptif | MUST |
| Images : `alt` (ou `alt=""` décoratif) ; icônes déco : `aria-hidden` | MUST |
| Titres hiérarchiques `h1`–`h6` + skip link « Skip to content » | MUST |
| `scroll-margin-top` sur ancres de titres | MUST |
| Statuts : pas couleur seule ; labels texte | MUST |
| Noms accessibles même si label visuel omis | MUST |

---

## Formulaires

| Règle | Niveau |
|-------|--------|
| Tout contrôle a un label associé | MUST |
| Label cliquable active le contrôle | MUST |
| Enter soumet (textarea : ⌘/Ctrl+Enter) | MUST |
| Submit enabled jusqu’au début requête ; puis disable + spinner | MUST |
| Pré-désactiver submit / bloquer frappe pour « forcer » le format | NEVER |
| Erreurs à côté des champs ; focus première erreur au submit | MUST |
| `autocomplete` + `name` ; `type` / `inputmode` corrects | MUST |
| Placeholders = exemples + finissent par `…` | SHOULD |
| Warn avant navigation si données non sauvées | MUST |
| Compat password managers / collage OTP | MUST |
| Trim espaces trailing (IME / expansions) | MUST |
| `select` natif : `background-color` + `color` explicites (Windows) | MUST |

---

## Performance & images

| Règle | Niveau |
|-------|--------|
| Dimensions explicites images (anti-CLS) | MUST |
| Above-fold : preload / `priority` / `fetchpriority="high"` ; reste : `loading="lazy"` | MUST |
| Listes > 50 : virtualiser | MUST |
| Mutations POST/PATCH/DELETE cible &lt; 500 ms | MUST |
| Preférer inputs uncontrolled ; controlled cheap | SHOULD |
| `preconnect` CDN ; preload fonts critiques | SHOULD |
| Pas de lectures layout dans le render (`getBoundingClientRect`, etc.) | MUST |
| Work coûteux hors main thread (Workers) | SHOULD |

---

## Thème & design visuel

| Règle | Niveau |
|-------|--------|
| Contraste suffisant — préférer APCA | MUST |
| Hover / active / focus = contraste **augmenté** | MUST |
| `color-scheme: dark` sur `html` en thème sombre | MUST |
| `theme-color` aligné au fond de page | SHOULD |
| Ombres en ≥ 2 couches (ambient + direct) | SHOULD |
| Bordures semi-transparentes + ombres ; nested radii enfant ≤ parent | SHOULD |
| Teinter bordures/ombres/texte vers la teinte du fond non neutre | SHOULD |
| Charts : palettes daltonisme-friendly | MUST |
| Éviter banding de dégradés (masks → images si besoin) | SHOULD |

---

## Copywriting Vercel-specific (Vercel-only)

Appliquer **seulement** si le projet vise le ton / brand Vercel, ou si le brief le demande.

| Règle | Niveau |
|-------|--------|
| Voix active ; 2e personne ; peu de mots | Vercel-only |
| Headings/boutons produit : Title Case (Chicago) ; **marketing : sentence case** | Vercel-only |
| Préférer `&` à `and` ; numerals pour comptages | Vercel-only |
| Labels boutons spécifiques (pas « Continue » vague) | Vercel-only |
| Erreurs = problème + **comment corriger** | Vercel-only |
| Langage positif / résolutoire même en erreur | Vercel-only |

---

## Anti-patterns à flagger (command.md)

- Zoom désactivé · paste bloqué · `transition: all` · `outline-none` sans focus-visible  
- Navigation via `onClick` sans `<a>` · `<div>`/`<span>` cliquables  
- Images sans dimensions · listes longues sans virtualisation  
- Inputs sans labels · icon buttons sans `aria-label`  
- Dates/nombres hardcodés · `autoFocus` sans justification  
