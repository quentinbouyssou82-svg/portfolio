---
name: design-os
description: Senior art-director design OS. Use BEFORE any UI/landing/dashboard/SaaS/iOS interface work. Orchestrates 21st.dev, shadcn, Magic MCP, Pro Max, Vercel HIG, Apple HIG, Mobbin, Refero, Raylight, Spline. Triggers: design, UI, UX, landing, dashboard, paywall, onboarding, audit design, anti AI-slop.
---

# DESIGN_OS — Directeur artistique

Système permanent de direction artistique. **Lis ce fichier en premier** avant toute tâche UI / landing / dashboard / SaaS / iOS / paywall / onboarding / pricing / audit design.

Barre de qualité : **startup YC-funded / top App Store**. Le design system du repo gagne toujours s’il existe ; DESIGN_OS choisit les outils et fixe la barre.

**Version :** voir [VERSION.md](VERSION.md) (`1.0.1`).

---

## Ordre de lecture (agents)

0. **Si app productivity / focus / gamification / habit / behavior / screen-time / anti-addiction** → charger **`behavioral-psychology` AVANT toute proposition UX** (voir règle 8).
1. **Ce fichier** (`SKILL.md`) — workflow + règles dures
2. [WORKFLOW.md](WORKFLOW.md) — étapes 1–6 détaillées
3. Playbook pertinent dans [PLAYBOOKS/](PLAYBOOKS/)
4. [TOOLS.md](TOOLS.md) — quand utiliser / ne pas utiliser chaque outil
5. [ANTI_AI_SLOP.md](ANTI_AI_SLOP.md) + [CHECKLIST_ANTI_SLOP.md](CHECKLIST_ANTI_SLOP.md)
6. Si commande « Audit Design » → [AUDIT_DESIGN.md](AUDIT_DESIGN.md)
7. Prompts prêts → [PROMPTS.md](PROMPTS.md)

---

## Règles dures (non négociables)

1. **Toujours démarrer par DESIGN_OS** avant de coder une interface.
2. **Design system du repo d’abord** (tokens, composants, brand). Ne pas inventer une esthétique concurrente.
3. **Composants : 21st.dev EN PREMIER, puis shadcn/ui — jamais l’inverse.**
4. **Références avant pixels** : Mobbin → Refero → Raylight → apps similaires.
5. **Zéro AI-slop** : voir [ANTI_AI_SLOP.md](ANTI_AI_SLOP.md).
6. **Audit avant ship** pour landings / surfaces marketing : Vercel Guidelines + checklist anti-slop.
7. Cross-linker les skills spécialisés ; **ne pas dupliquer** leur contenu.
8. **Behavior avant UX** : toute nouvelle app ou feature **productivity / focus / gamification / habit / behavior / screen-time / anti-addiction** (et contextes Driveely engagement) **DOIT** charger `behavioral-psychology` **avant** toute proposition UX / UI. Invocation : `/behavioral-psychology`. Paths : `/Users/quentinbouyssou/portfolio/skills/behavioral-psychology/` · `/Users/quentinbouyssou/.cursor/skills/behavioral-psychology/`.

---

## Workflow directeur (6 étapes)

Encoder en détail dans [WORKFLOW.md](WORKFLOW.md). Résumé :

| # | Étape | Action |
|---|--------|--------|
| 1 | Comprendre le besoin produit | Job-to-be-done, persona, contrainte plateforme |
| 2 | Références | Mobbin → Refero → Raylight → apps similaires |
| 3 | Définir le style | Stripe, Linear, Raycast, Arc, Notion, Apple… |
| 4 | Construire les composants | **21st.dev d’abord**, puis shadcn/ui |
| 5 | Audit visuel | Magic MCP, UI/UX Pro Max, Frontend Design, Vercel Guidelines |
| 6 | Optimiser | Hiérarchie, contraste, spacing, responsive, mobile, motion, a11y |

---

## Stack d’outils — priorité

Ordre d’invocation typique (détail : [TOOLS.md](TOOLS.md)) :

1. **DESIGN_OS** (ce skill) — orchestration
2. **Mobbin / Refero / Raylight** — références produit
3. **21st.dev** (+ Magic MCP / skills 21st) — composants premium
4. **shadcn/ui** — fondations / compléments absents de 21st
5. **UI/UX Pro Max** — intelligence design (styles, palettes, UX)
6. **Frontend Design** + **Frontend AI Studio** — identité / craft frontend
7. **Vercel Design Guidelines** — audit landing / marketing
8. **Apple HIG** — iOS / native
9. **Spline** — 3D / hero immersif seulement si justifié

---

## Skills & docs liés (cross-links)

Ne pas recopier ces skills — les **lire** quand l’étape l’exige.

| Besoin | Chemin |
|--------|--------|
| **Behavioral psychology (AVANT UX behavior apps)** | `/Users/quentinbouyssou/portfolio/skills/behavioral-psychology/` · `~/.cursor/skills/behavioral-psychology/` |
| UI/UX Pro Max (portfolio) | `/Users/quentinbouyssou/portfolio/skills/uiux-pro-max/` |
| UI/UX Pro Max (runtime) | `/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/` |
| Vercel Design Guidelines | `/Users/quentinbouyssou/portfolio/skills/vercel-design/` |
| Apple HIG (si présent) | `/Users/quentinbouyssou/portfolio/skills/apple-hig/` |
| Frontend Design | `/Users/quentinbouyssou/.cursor/skills/frontend-design/` |
| Frontend AI Studio | `/Users/quentinbouyssou/.cursor/skills/frontend-ai-studio/` |
| 21st CLI / AI / Build / Explore / Review / Registry / Sync | `/Users/quentinbouyssou/.cursor/skills/21st-*/` |
| Magic MCP (21st) docs | `/Users/quentinbouyssou/.cursor/docs/21st-magic-mcp.md` |

Miroirs DESIGN_OS :

- Canon portfolio : `/Users/quentinbouyssou/portfolio/skills/design-os/`
- Global Cursor : `/Users/quentinbouyssou/.cursor/skills/design-os/`

---

## Commande « Audit Design »

Si l’utilisateur dit **Audit Design** (ou équivalent) :

1. Lire [AUDIT_DESIGN.md](AUDIT_DESIGN.md)
2. Scanner l’UI → lister les issues → scorer **/100**
3. Comparer à **Linear / Stripe / Raycast / Notion**
4. Livrer des correctifs **priorisés**

---

## Playbooks

Choisir le playbook adapté, puis suivre ses étapes outil par outil :

| Surface | Fichier |
|---------|---------|
| Landing | [PLAYBOOKS/landing-page.md](PLAYBOOKS/landing-page.md) |
| Dashboard SaaS | [PLAYBOOKS/dashboard-saas.md](PLAYBOOKS/dashboard-saas.md) |
| Paywall | [PLAYBOOKS/paywall.md](PLAYBOOKS/paywall.md) |
| Auth | [PLAYBOOKS/auth.md](PLAYBOOKS/auth.md) |
| Onboarding | [PLAYBOOKS/onboarding.md](PLAYBOOKS/onboarding.md) |
| Pricing | [PLAYBOOKS/pricing.md](PLAYBOOKS/pricing.md) |
| Mobile app | [PLAYBOOKS/mobile-app.md](PLAYBOOKS/mobile-app.md) |
| iOS native | [PLAYBOOKS/ios-native.md](PLAYBOOKS/ios-native.md) |
| Productivity / focus / habit | [PLAYBOOKS/productivity.md](PLAYBOOKS/productivity.md) |
| Empty states | [PLAYBOOKS/empty-states.md](PLAYBOOKS/empty-states.md) |
| Settings | [PLAYBOOKS/settings.md](PLAYBOOKS/settings.md) |

---

## Anti AI-slop (rappel)

Interdit : cards génériques, gradients inutiles, glassmorphism excessif, sections interminables, 15 CTAs, dashboard vide, illustrations AI génériques, landing « texte+texte+texte ».

→ [ANTI_AI_SLOP.md](ANTI_AI_SLOP.md) · [CHECKLIST_ANTI_SLOP.md](CHECKLIST_ANTI_SLOP.md)

---

## Décision rapide

```
Brief UI reçu
  → Si productivity/focus/gamification/habit/behavior/screen-time :
       charger behavioral-psychology (Behavior Audit si demandé) AVANT UX
  → Lire SKILL.md + WORKFLOW.md
  → Choisir playbook
  → Étapes 1–3 (besoin, refs, style)
  → Étape 4 : chercher 21st → sinon shadcn → sinon custom aligné DS
  → Étape 5–6 : audits + optimize
  → Si « Audit Design » : AUDIT_DESIGN.md
  → Avant ship : CHECKLIST_ANTI_SLOP + Vercel (landings)
```
