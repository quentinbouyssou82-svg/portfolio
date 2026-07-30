# Résumé — Vercel Web Interface Guidelines

## Sources (autoritatives)

1. **Page officielle :** https://vercel.com/design/guidelines  
2. **Repo :** https://github.com/vercel-labs/web-interface-guidelines  
3. **Prompt agent (`command.md`) :** https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md  
4. **Règles agents (`AGENTS.md`) :** https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/AGENTS.md  
5. **Changelog agent command :** https://vercel.com/changelog/web-interface-guidelines-now-available-as-an-agent-command  

### Sources connexes (hors checklist UI générale)

- **Geist Design System :** https://vercel.com/geist — système de design produit Vercel (composants, couleurs, typo). Utile pour projets brandés Vercel ; **ne remplace pas** les Web Interface Guidelines.  
- **vercel.com/design** — hub design ; peut exposer d’autres skills brand (ex. rapports Vercel) distincts des guidelines d’interface web.

---

## Nature du document

Liste **vivante et non exhaustive** de décisions pour réussir une interface web. Majoritairement **framework-agnostic** ; quelques points React/Next.js. Feedback bienvenu sur le repo.

Vercel propose aussi l’intégration agents : commande `/web-interface-guidelines` (`curl -fsSL https://vercel.com/design/guidelines/install | bash`) et fichiers `command.md` / `AGENTS.md`.

---

## Structure des guidelines (fidèle aux sources)

### Interactions

Clavier partout (WAI-ARIA APG), focus visible (`:focus-visible`, `:focus-within`), gestion du focus (trap / move / return). Cibles ≥ 24px (mobile ≥ 44px). Inputs mobile ≥ 16px. Ne jamais désactiver le zoom. Hydration-safe. Ne pas bloquer le paste. Boutons loading avec spinner + label d’origine. Délai / durée minimale des états loading pour éviter le flicker. État dans l’URL. Optimistic UI. Ellipsis pour suites / loading. Confirmer les actions destructives. `touch-action: manipulation`. Tap highlight intentionnel. Interactions forgiving. Tooltips groupés (délai puis instantané). `overscroll-behavior: contain` dans modales. Scroll restauré Back/Forward. Autofocus desktop uniquement si input primaire unique. Pas de dead zones. Deep-links. Drag propre (`inert`, no selection). Liens = `<a>` / Next `Link`. `aria-live` poli pour async. Raccourcis localisés.

### Animations

Honorer `prefers-reduced-motion`. Préférer CSS > WAAPI > libs JS. Props compositor (`transform`, `opacity`). Pas de `transition: all`. Animer seulement si cause/effet ou delight volontaire. Interruptible, input-driven (pas d’autoplay). `transform-origin` correct. SVG : wrapper `<g>` + `transform-box: fill-box`.

### Layout

Alignement optique (±1px). Alignement délibéré. Balance icon/texte. Couverture responsive (mobile, laptop, ultra-wide à 50 %). Safe areas. Pas de scrollbars inutiles. Flex/grid plutôt que mesure JS.

### Content & a11y

Aide inline d’abord. Skeletons stables. `<title>` exact. Pas d’impasses. États empty/sparse/dense/error. Guillemets typographiques. Éviter veuves/orphelines. `tabular-nums` pour comparaisons. Statuts non couleur-seuls. Icônes labellisées. Noms accessibles même si UI visuelle sans label. Caractère `…`. `scroll-margin-top` + skip link + titres hiérarchiques. Contenu UGC résilient. Formats locale (`Intl.*`). Langue via `Accept-Language` / `navigator.languages`, pas IP. `translate="no"` sur marques / tokens. Sémantique native avant ARIA. Espaces insécables pour termes collés.

### Forms

Enter submit ; textarea ⌘/Ctrl+Enter. Labels partout + activation. Submit enabled jusqu’au départ requête puis disable + spinner. Ne pas bloquer la frappe. Ne pas pré-désactiver submit. Erreurs inline + focus première erreur. `autocomplete` + `name`. Spellcheck sélectif. Types / `inputmode` corrects. Placeholders = exemples + `…`. Warn unsaved. Compat password managers / 2FA. Trim trailing spaces. `select` Windows : couleurs explicites.

### Performance

Tester iOS Low Power + Safari macOS. Mesurer sans extensions. Minimiser re-renders. Throttle CPU/réseau. Mutations &lt; 500 ms. Inputs uncontrolled de préférence. Virtualiser listes &gt; 50. Preload above-the-fold / lazy reste. Dimensions images (anti-CLS). Preconnect CDN. Preload fonts critiques / subset. Work expensive hors main thread.

### Design (visuel)

Ombres en couches (ambient + direct). Bordures nettes (semi-transparentes + ombres). Radii imbriqués (enfant ≤ parent). Cohérence de teinte. Charts accessibles. Contraste : préférer **APCA** à WCAG 2. Interactions = contraste augmenté. `theme-color` / `color-scheme`. Anti-banding dégradés.

### Vercel-specific (copywriting) — **pas universel**

Préférences de marque Vercel : voix active, Title Case (Chicago) pour headings/boutons produit — **sentence case sur marketing pages**, clarté, `&` vs `and`, 2e personne, placeholders cohérents, chiffres en numerals, messages d’erreur actionnables, labels spécifiques (« Save API Key » pas « Continue »).

---

## Périmètre landing

Les guidelines couvrent **apps et web** en général. Pour une landing, beaucoup d’items (forms, deep-links, listes virtuelles) sont **N/A** si absents — le noter explicitement dans la checklist. Ne pas inventer d’exigences marketing non documentées (hero, pricing cards, etc.) : s’en tenir aux règles listées.
