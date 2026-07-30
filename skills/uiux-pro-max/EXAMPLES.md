# UI/UX Pro Max — Exemples

Exemples concrets pour agents. CLI = skill source  
`/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/scripts/search.py`

---

## 1. Workflow type — « Faire une homepage AI search »

### Analyser

- Produit : outil (search AI)
- Audience : C-end, rapidité
- Keywords : modern, minimal, content-first, dark mode
- Stack : Next.js → `--stack nextjs`

### Design system (requis)

```bash
python3 .../search.py "AI search tool modern minimal" --design-system -p "AI Search"
```

### Compléments

```bash
python3 .../search.py "minimalism dark mode" --domain style
python3 .../search.py "search loading animation" --domain ux
python3 .../search.py "list performance navigation" --stack nextjs
```

Puis synthétiser + implémenter (en respectant le DS repo s’il existe).

---

## 2. Prompts CLI efficaces

| Besoin | Query / flags |
|--------|----------------|
| Nouveau SaaS | `"SaaS B2B clean professional" --design-system -p "Acme"` |
| Fintech | `"fintech crypto trust dark" --design-system` |
| Beauty / spa | `"beauty spa wellness service" --design-system -p "Serenity Spa"` |
| Palette | `"healthcare calm" --domain color` |
| Typos | `"elegant luxury" --domain typography` |
| Landing hero | `"hero social-proof" --domain landing` |
| Chart dashboard | `"real-time dashboard" --domain chart` |
| A11y pass | `"animation accessibility z-index loading" --domain ux` |
| shadcn | `"composition primitives" --stack shadcn` |
| Persist Master | `--design-system --persist -p "Driveely" --page "checkout"` |

**Astuce :** keywords multi-dimensionnels — produit + industrie + ton + densité  
Bon : `"entertainment social vibrant content-dense"`  
Faible : `"app"`

---

## 3. Persist Master + overrides

```bash
python3 .../search.py "EV charging marketplace" --design-system --persist -p "Driveely" --page "dashboard"
```

Crée (sous le cwd ou `-o`) :

- `design-system/driveely/MASTER.md` — vérité globale
- `design-system/driveely/pages/dashboard.md` — overrides page

**Retrieval agent :**

```
Je construis la page Checkout.
Lire design-system/.../MASTER.md
Puis design-system/.../pages/checkout.md s’il existe (prioritaire).
Sinon MASTER seul. Ensuite générer le code…
```

---

## 4. Patterns — Do / Don’t

### Icônes

| Do | Don’t |
|----|-------|
| Lucide / Phosphor / Heroicons SVG | 🎨 ⚙️ en nav |
| Une stroke width / famille | Mélanger filled + outline au même niveau |
| hitSlop / padding → 44pt | Icône 16px sans zone tactile |

### Accessibilité

| Do | Don’t |
|----|-------|
| Contraste 4.5:1 + focus ring | Gris sur gris + `outline: none` |
| Label visible + erreur sous champ | Placeholder-only + erreur en toast seul |
| `prefers-reduced-motion` | Animations non désactivables |

### Interaction

| Do | Don’t |
|----|-------|
| Press feedback &lt;150ms | Tap sans feedback |
| Disable + spinner async | Double-submit |
| Click/tap pour action critique | Hover-only sur desktop pensé mobile |

### Layout

| Do | Don’t |
|----|-------|
| Mobile-first, 8pt grid | Largeurs px fixes + scroll horizontal |
| `min-h-dvh`, safe areas | Contenu sous notch / home bar |
| Une CTA primaire | 3 boutons « primary » concurrents |

### Animation

| Do | Don’t |
|----|-------|
| opacity/transform 150–300ms | Animer `height` / layout |
| Signification spatiale | Décoration seule sur 6 éléments |
| Exit plus court que enter | Linear 800ms partout |

### Charts

| Do | Don’t |
|----|-------|
| Bar pour &gt;5 catégories | Pie à 12 parts |
| Légende + pattern + table alt | Couleur seule pour sens |
| Empty / loading / error | Axe vide pendant le fetch |

---

## 5. Exemples de décisions produit (d’après `products.csv`)

| Produit | Style primaire typique (skill) | Focus couleur |
|---------|--------------------------------|---------------|
| SaaS (General) | Minimalism / Soft UI (selon reasoning) | Trust blue + accent CTA |
| Fintech/Crypto | Dark + Trust / Neo styles | Trust + alertes |
| Beauty/Spa | Soft / Organic / Clay | Calm pastels |
| Portfolio | Minimal / Editorial / Bento | Brand-led |
| Kids Learning | Claymorphism + Vibrant | Bright + reward gold |
| Anonymous Community | Dark OLED + Minimalism | Dark + upvote accent |

Toujours re-valider avec `--design-system` : le reasoning peut différer selon keywords.

---

## 6. Relation Driveely / frontend-ai-studio — exemples

### Cas A — Feature Driveely avec DS existant

**Do :** réutiliser tokens / composants ; utiliser Pro Max pour checklist a11y + UX forms.  
**Don’t :** regénérer une palette glassmorphism via `--design-system` et l’imposer.

### Cas B — Landing greenfield (pas encore de DS)

**Do :** `--design-system` → persist MASTER → implémenter ; aligner ensuite avec frontend-ai-studio (minimal SaaS) si c’est le brief.  
**Don’t :** ignorer les anti-patterns renvoyés par le CLI.

### Cas C — Review « ça fait pas pro »

**Do :** passer RULES §§1–3 + checklist C ; `--domain ux`.  
**Don’t :** seulement changer les couleurs sans touch targets / contraste / labels.

---

## 7. Sorties utiles

```bash
# Terminal (ASCII box)
python3 .../search.py "fintech crypto" --design-system

# Doc markdown
python3 .../search.py "fintech crypto" --design-system -f markdown

# JSON domain
python3 .../search.py "brutalism" --domain style --json
```

---

## 8. Quand skipper Pro Max

- Pure logique backend / API / DB
- Perf infra hors UI
- Scripts non visuels

Sinon : **RULES.md + CHECKLIST.md** avant de coder l’UI.
