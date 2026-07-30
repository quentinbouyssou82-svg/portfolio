# TOOLS — Catalogue directeur

Pour chaque outil : **quand l’utiliser**, **quand ne pas**, **forces**, **limites**, **prompts optimaux**, **priorité dans la stack**.

Priorité globale rappel : DESIGN_OS → refs (Mobbin/Refero/Raylight) → **21st.dev** → **shadcn** → audits (Magic / Pro Max / Frontend Design / Vercel / Apple HIG) → Spline (si justifié).

Prompts longs : [PROMPTS.md](PROMPTS.md).

---

## 1. 21st.dev

| | |
|--|--|
| **Priorité stack** | **P1 composants** — toujours avant shadcn |
| **Type** | Catalogue / génération de composants UI production |

### Quand utiliser

- Besoin d’un bloc UI non trivial (pricing table, hero, bento, navbar, testimonials, command palette…)
- On veut un départ **au-dessus** du boilerplate shadcn
- Skills `21st-cli-use`, `21st-ui-build`, `21st-ai`, registry

### Quand NE PAS utiliser

- Primitive triviale déjà dans le DS repo (Button simple, Input)
- Le composant trouvé est trop « démo » et résiste à l’adaptation tokens
- Contrainte licence / dépendance incompatible

### Forces

- Qualité visuelle souvent supérieure au générique AI
- Variété de patterns marketing + product
- Intégration Cursor via CLI + MCP

### Limites

- Peut diverger du DS local → **adapter obligatoire**
- Sur-fetch de composants « beaux » sans fit produit
- Auth / clé API requise pour MCP (voir docs Magic)

### Meilleurs prompts

- « Cherche sur 21st un [composant] style [Linear/Stripe], dense, sans cards inutiles, adaptable Tailwind tokens. »
- « Propose 3 variantes pricing ; recommande celle la plus proche de notre DS. »

### Skills liés

`~/.cursor/skills/21st-cli-use`, `21st-ui-build`, `21st-ai`, `21st-registry`, `21st-design-sync`, `21st-ui-explore`, `21st-ui-review`

---

## 2. shadcn/ui

| | |
|--|--|
| **Priorité stack** | **P2 composants** — après échec / absence 21st |
| **Type** | Primitives accessibles, copy-paste, Radix + Tailwind |

### Quand utiliser

- Fondations : Button, Input, Form, Dialog, Sheet, Dropdown, Table, Tabs, Toast
- Compléter un import 21st avec des primitives cohérentes
- Projet déjà shadcn-based

### Quand NE PAS utiliser

- **En premier** alors qu’un match 21st existe (règle DESIGN_OS)
- Pour « faire une landing entière » avec 12 cards shadcn
- Remplacer un DS custom déjà mature sans raison

### Forces

- A11y solide, ownership du code, écosystème large
- Parfait pour product UI dense

### Limites

- Look par défaut reconnaissable / générique si non thématisé
- Moins « direction art » out-of-the-box que 21st premium

### Meilleurs prompts

- « Ajoute le primitive shadcn X, mappe aux tokens CSS du repo, pas de style démo. »
- « Remplace les gaps manquants après import 21st par shadcn only. »

---

## 3. Magic MCP (21st MCP)

| | |
|--|--|
| **Priorité stack** | **P1 découverte/génération** parallèle à 21st CLI |
| **Type** | Serveur MCP Cursor `21st` |

### Quand utiliser

- Recherche / import / génération de composants depuis le chat
- Review de variantes (`21st-ui-review`)
- Sync design tokens / explore directions

### Quand NE PAS utiliser

- MCP non authentifié (`API_KEY_21ST` manquante) → basculer CLI login
- Tâches purement backend
- Remplacer l’audit Vercel / Pro Max

### Forces

- Workflow in-chat, aligné skills 21st
- Moins de friction que copier-coller manuel

### Limites

- Dépend de l’auth et de la dispo serveur
- Peut pousser des composants hors-DS si l’agent ne discipline pas

### Docs

`/Users/quentinbouyssou/.cursor/docs/21st-magic-mcp.md`

### Meilleurs prompts

- « Via Magic MCP, search “command palette” limit 5, filtre dark dense Linear-like. »
- « Review ce composant vs notre registry / tokens. »

---

## 4. UI/UX Pro Max

| | |
|--|--|
| **Priorité stack** | **P1 guidance** (styles, UX, a11y, stacks) — après DS repo |
| **Type** | Intelligence design searchable (palettes, fonts, guidelines) |

### Quand utiliser

- Choisir style / palette / font pairing / product type
- Review UX avant ship
- Mobile + web, charts, patterns

### Quand NE PAS utiliser

- Pour **écraser** le DS repo
- Comme unique source de composants (ce n’est pas 21st/shadcn)

### Forces

- Large base (styles, palettes, UX rules)
- CLI search design-system

### Limites

- Peut suggérer des styles « à la mode » (glass, etc.) → filtrer via ANTI_AI_SLOP
- Guidance ≠ implémentation

### Chemins

- Portfolio : `/Users/quentinbouyssou/portfolio/skills/uiux-pro-max/`
- Runtime : `/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/`

### Meilleurs prompts

- « search.py design-system pour SaaS dashboard dark, dense, Linear-like. »
- « Checklist UX a11y pour paywall mobile. »

---

## 5. Frontend Design Skill

| | |
|--|--|
| **Priorité stack** | **P1 craft / identité** anti-générique |
| **Type** | Skill Anthropic-adapté — composition, typo, motion, anti-slop |

### Quand utiliser

- Création / refonte visuelle distinctive
- Landings, pricing, polish, design systems
- Avec Frontend AI Studio si les deux sont présents

### Quand NE PAS utiliser

- Backend pur, CI, bugs non visuels
- Pour justifier une rupture de DS existant

### Forces

- Pousse un vrai risque esthétique justifiable
- Excellent contre AI-slop

### Limites

- Sans DESIGN_OS, peut diverger du workflow refs→21st
- Doit rester sous DS repo

### Chemin

`/Users/quentinbouyssou/.cursor/skills/frontend-design/`

### Meilleurs prompts

- « Pass 1 plan design : direction [X], anti-slop, hero budget landing. »
- « Audit composition : un focal, typo expressive, motion 2–3. »

---

## 6. Vercel Design Guidelines

| | |
|--|--|
| **Priorité stack** | **P0 audit landings / marketing** |
| **Type** | Web Interface Guidelines (a11y, interaction, perf, content) |

### Quand utiliser

- Toute landing / marketing surface avant ship
- Audit UI, review a11y focus/zoom/contrast
- Mentions « Vercel guidelines »

### Quand NE PAS utiliser

- UI native iOS pure (préférer Apple HIG)
- Comme générateur de composants

### Forces

- Checklist concrète PASS/FAIL
- Craft interaction / contenu marketing

### Limites

- Moins « art direction » que Frontend Design
- Scope web marketing

### Chemin

`/Users/quentinbouyssou/portfolio/skills/vercel-design/`

### Meilleurs prompts

- « Audite cette landing contre CHECKLIST.md Vercel ; liste FAIL bloquants. »
- « Corrige focus, contraste, CLS, liens vides. »

---

## 7. Apple Human Interface Guidelines

| | |
|--|--|
| **Priorité stack** | **P0 iOS / native** |
| **Type** | Guidelines Apple (navigation, typography SF, controls, layout) |

### Quand utiliser

- Apps iOS / iPadOS / visionOS patterns
- SwiftUI, tab bars, sheets, nav bars, Dynamic Type
- Playbook [ios-native.md](PLAYBOOKS/ios-native.md)

### Quand NE PAS utiliser

- Imposer HIG sur une landing web marketing
- Remplacer le DS iOS du projet s’il est déjà HIG-compliant

### Forces

- Standard App Store, cohérence plateforme
- Accessibilité système (Dynamic Type, Reduce Motion)

### Limites

- Pas un kit de composants web
- Skill portfolio peut être en cours : `/Users/quentinbouyssou/portfolio/skills/apple-hig/`

### Meilleurs prompts

- « Aligne cet écran SwiftUI sur HIG : navigation, spacing, hit targets. »
- « Review paywall iOS vs patterns App Store top. »

---

## 8. Mobbin

| | |
|--|--|
| **Priorité stack** | **P0 références** — **premier** de la chaîne refs |
| **Type** | Library de flows UI product (mobile + web) |

### Quand utiliser

- Étape 2 systématique
- Onboarding, paywall, auth, empty, settings, tab flows

### Quand NE PAS utiliser

- Comme source de code
- Pour inspiration purement « moodboard artistique » (préférer Raylight)

### Forces

- Flows réels, patterns éprouvés
- Excellent pour mobile product

### Limites

- Accès / recherche manuelle (pas un MCP local standard)
- Tentation de copier sans adapter

### Meilleurs prompts (brief agent)

- « Synthèse Mobbin : 3 flows onboarding fintech ; extraire structure écrans + CTA. »
- « Patterns empty state SaaS : action primaire claire, pas mascotte. »

---

## 9. Refero

| | |
|--|--|
| **Priorité stack** | **P0 références** — **après Mobbin** |
| **Type** | Références UI haute fidélité (product + marketing) |

### Quand utiliser

- Dashboards, settings desktop, landings, pricing pages
- Compléter Mobbin pour le desktop / marketing

### Quand NE PAS utiliser

- Remplacer Mobbin pour un flow 100 % mobile
- Scraping massif sans annotation

### Forces

- Qualité visuelle / densité réelle des meilleures apps
- Bon pour SaaS desktop

### Limites

- Pas d’export code
- Besoin de synthèse humaine/agent

### Meilleurs prompts

- « Refs Refero : dashboard analytics dense type Linear ; noter sidebar, densités, empty. »
- « Pricing pages Refero : comparaison 3 colonnes, highlight plan. »

---

## 10. Raylight

| | |
|--|--|
| **Priorité stack** | **P1 références visuelles** — **après Mobbin + Refero** |
| **Type** | Inspiration direction artistique / look contemporain |

### Quand utiliser

- Étape 3 : affiner mood, couleur, typographie, atmosphère
- Quand le produit a besoin d’une personnalité (pas template SaaS gris)

### Quand NE PAS utiliser

- Comme seule source de UX flows
- Pour justifier du glassmorphism / gradients gratuits

### Forces

- Direction art fraîche, moins « catalogue composant »
- Aide à nommer un style

### Limites

- Peut être trop « mood » vs product pragmatique
- Filtrer via ANTI_AI_SLOP

### Meilleurs prompts

- « 3 directions Raylight pour brand [X] : retenir signaux typo/couleur exploitables. »
- « Mood éditorial sobre, pas neon glow. »

---

## 11. Spline

| | |
|--|--|
| **Priorité stack** | **P3 optionnel** — hero 3D justifié seulement |
| **Type** | 3D / interactive scenes web |

### Quand utiliser

- Hero produit où le 3D **explique** le produit (device, spatial UI, objet)
- Brand déjà 3D-native

### Quand NE PAS utiliser

- Décoration landing par défaut
- Dashboards, settings, forms, paywalls
- Perf mobile critique sans fallback

### Forces

- Différenciation forte, wow controlé

### Limites

- Poids, perf, accessibilité, maintenance
- Souvent AI-slop si mal motivé

### Meilleurs prompts

- « Scene Spline minimale : objet produit, loop lent, fallback image statique, respects reduced-motion. »
- « Ne pas utiliser Spline — photo produit full-bleed à la place. »

---

## Matrice priorité (résumé)

| Rang | Outil | Rôle |
|------|-------|------|
| 0 | DESIGN_OS | Orchestration |
| 0 | Design system repo | Source de vérité visuelle |
| 1 | Mobbin → Refero → Raylight | Références |
| 1 | 21st.dev + Magic MCP | Composants premium |
| 2 | shadcn/ui | Primitives |
| 1–2 | UI/UX Pro Max, Frontend Design, Frontend AI Studio | Guidance + craft |
| 0 (landings) | Vercel Guidelines | Audit ship |
| 0 (iOS) | Apple HIG | Native |
| 3 | Spline | 3D rare |

### Frontend AI Studio

Pas listé comme « outil externe » mais **skill obligatoire** sur beaucoup de workspaces UI :

`/Users/quentinbouyssou/.cursor/skills/frontend-ai-studio/`

Utiliser **avec** Frontend Design + DESIGN_OS. DS repo > Studio aesthetics génériques.
