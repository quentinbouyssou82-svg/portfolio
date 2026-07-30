# UI/UX Pro Max — Résumé

## Qu’est-ce que c’est ?

Skill d’**intelligence design** pour web et mobile : base de données searchable (BM25) + règles UX prioritaires + générateur de design system (`--design-system`).

Ce n’est **pas** un design system de produit. C’est une **couche de recommandations** (styles, couleurs, typo, patterns, anti-patterns, guidelines stack).

Source installée : `/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/`

---

## Capacités (comptages installés)

Chiffres marketing du skill vs inventaire réel des CSV :

| Capacité | Annonce skill | Inventaire installé |
|----------|---------------|---------------------|
| Styles UI | 50+ | **84** (`data/styles.csv`) |
| Palettes couleur | 161 | **160** (`data/colors.csv`) |
| Pairings typo | 57 | **73** (`data/typography.csv`) |
| Types produit | 161 | **161** (`data/products.csv`) |
| Guidelines UX | 99 | **98** (`data/ux-guidelines.csv`) |
| Types de charts | 25 | **25** (`data/charts.csv`) |
| Patterns landing | — | **34** (`data/landing.csv`) |
| Règles de raisonnement UI | — | **161** (`data/ui-reasoning.csv`) |
| Icônes (catalog) | — | **104** (`data/icons.csv`, surtout Phosphor) |
| Google Fonts | — | **~1923** (`data/google-fonts.csv`) |
| App interface (web/native a11y) | — | **29** (`data/app-interface.csv`) |
| React performance | — | **44** (`data/react-performance.csv`) |
| Stacks | « 10 » (description) | **16** CSV dans `data/stacks/` |

Fichiers **non lus** par le moteur de recherche :

- `data/draft.csv` — backup / référence uniquement (note explicite dans le fichier)
- `data/design.csv` — contenu bilingue (ex. Bauhaus), hors pipeline CLI
- `data/_sync_all.py` — script de sync products ↔ colors / ui-reasoning

---

## Structure du skill source

```
ui-ux-pro-max/
├── SKILL.md                 # Workflow, Quick Reference, checklists
├── scripts/
│   ├── search.py            # CLI principal
│   ├── design_system.py     # Agrégation + persist MASTER.md
│   └── core.py              # BM25, CSV_CONFIG, STACK_CONFIG
└── data/
    ├── styles.csv, colors.csv, typography.csv, products.csv
    ├── landing.csv, charts.csv, ux-guidelines.csv, ui-reasoning.csv
    ├── icons.csv, google-fonts.csv, app-interface.csv, react-performance.csv
    └── stacks/*.csv         # 16 stacks
```

---

## Domaines searchable (`--domain`)

Définis dans `scripts/core.py` → `CSV_CONFIG` :

| Domain | Fichier | Usage |
|--------|---------|--------|
| `style` | styles.csv | Styles UI, effets, prompts AI, checklist |
| `color` | colors.csv | Palettes sémantiques par type produit |
| `typography` | typography.csv | Pairings heading/body + imports |
| `google-fonts` | google-fonts.csv | Fonts individuelles |
| `product` | products.csv | Style / landing / dashboard recommandés |
| `landing` | landing.csv | Structure de page, CTA, conversion |
| `chart` | charts.csv | Type de chart + a11y + lib |
| `ux` | ux-guidelines.csv | Do/Don’t UX |
| `icons` | icons.csv | Icônes (Phosphor principalement) |
| `react` | react-performance.csv | Perf React/Next |
| `web` | app-interface.csv | Guidelines app (iOS/Android/RN) |

> Note : le `SKILL.md` source mentionne parfois un domain `prompt` ; **il n’existe pas** dans `CSV_CONFIG`. Les mots-clés « prompt / CSS » sont couverts via `style`.

---

## Stacks (`--stack`)

`react`, `nextjs`, `vue`, `svelte`, `astro`, `swiftui`, `react-native`, `flutter`, `nuxtjs`, `nuxt-ui`, `html-tailwind`, `shadcn`, `jetpack-compose`, `threejs`, `angular`, `laravel`

Chaque stack = guidelines Do/Don’t + exemples code + sévérité (+ Docs URL).

---

## Styles (échantillon représentatif)

Parmi les 84 entrées : Glassmorphism, Claymorphism, Neumorphism, Brutalism / Neubrutalism / Kinetic Brutalism, Minimalism & Swiss Style, Flat Design, Skeuomorphism, Bento Box Grid, Dark Mode (OLED), Aurora UI, Liquid Glass, Soft UI Evolution, Motion-Driven, Hero-Centric, Trust & Authority, Conversion-Optimized, dashboards (Data-Dense, Executive, Financial, Real-Time…), Cyberpunk, Vaporwave, Bauhaus, Memphis, Spatial UI (VisionOS), AI-Native UI, Zero Interface, etc.

Chaque style inclut : couleurs, effets, best for / do not use, light/dark, perf, a11y, mobile, keywords AI + CSS, checklist d’implémentation, variables design system.

---

## Palettes couleur

160 palettes alignées sur les types produit (SaaS, e-commerce, fintech, healthcare, beauty, etc.).

Tokens typiques par palette : Primary / On Primary, Secondary, Accent, Background, Foreground, Card, Muted, Border, Destructive, Ring — format proche shadcn.

---

## Typographie

73 pairings nommés (Classic Elegant, Tech Startup, Minimal Swiss, Friendly SaaS, Luxury Serif, Crypto/Web3, Gaming Bold, scripts locaux VN/JP/KR/CN/AR/TH/HE, etc.) avec :

- Heading Font + Body Font
- URL Google Fonts, CSS Import, Tailwind Config
- Mood / Best For / Notes

Plus lookup individuel via `google-fonts`.

---

## CLI — commandes clés

Prérequis : Python 3.

```bash
SKILL=/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max

# 1. Design system complet (TOUJOURS en premier pour un nouveau produit/page)
python3 $SKILL/scripts/search.py "fintech crypto modern" --design-system -p "Driveely"

# Markdown + persist Master + override page
python3 $SKILL/scripts/search.py "SaaS dashboard" --design-system -f markdown --persist -p "Driveely" --page "dashboard"

# 2. Domaine
python3 $SKILL/scripts/search.py "glassmorphism dark" --domain style -n 5
python3 $SKILL/scripts/search.py "animation accessibility" --domain ux

# 3. Stack
python3 $SKILL/scripts/search.py "list performance" --stack nextjs
python3 $SKILL/scripts/search.py "composition primitives" --stack shadcn
```

`--design-system` cherche en parallèle product / style / color / landing / typography, applique `ui-reasoning.csv`, renvoie pattern + style + couleurs + typo + effets + anti-patterns.

`--persist` écrit `design-system/<project>/MASTER.md` (+ `pages/<page>.md` si `--page`).

---

## Priorités de règles (1 → 10)

Voir [RULES.md](./RULES.md). Ordre résumé :

1. Accessibility (CRITICAL)  
2. Touch & Interaction (CRITICAL)  
3. Performance (HIGH)  
4. Style Selection (HIGH)  
5. Layout & Responsive (HIGH)  
6. Typography & Color (MEDIUM)  
7. Animation (MEDIUM)  
8. Forms & Feedback (MEDIUM)  
9. Navigation Patterns (HIGH)  
10. Charts & Data (LOW)

---

## Intégrations mentionnées

- Description du skill : **shadcn/ui MCP** pour recherche de composants / exemples
- Stack `shadcn` dans les CSV (guidelines composition)
- Icônes cataloguées surtout **Phosphor** (`@phosphor-icons/react`) ; le skill recommande aussi Lucide / Heroicons (pas d’emoji comme icônes structurelles)

---

## Upstream GitHub

Aucune URL de dépôt upstream n’est déclarée dans le skill installé. Ground truth = contenu local ci-dessus.
