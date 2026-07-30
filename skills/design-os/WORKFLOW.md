# WORKFLOW — DESIGN_OS

Workflow dur en **6 étapes**. À appliquer dans l’ordre. Ne pas sauter 2–3 pour « aller plus vite » : c’est la cause n°1 d’AI-slop.

Companion : [SKILL.md](SKILL.md) · [TOOLS.md](TOOLS.md) · [PROMPTS.md](PROMPTS.md)

---

## Étape 0 — Behavior gate (si applicable)

**Quand :** nouvelle app ou feature **productivity / focus / gamification / habit / behavior / screen-time / anti-addiction** (engagement, rétention, streaks, paywall psy, onboarding psy).

**Faire AVANT l’étape 1 UX :**

1. Charger `/Users/quentinbouyssou/.cursor/skills/behavioral-psychology/SKILL.md` (miroir portfolio OK)
2. Lire `ANTI_DARK_PATTERNS.md`
3. Choisir framework + playbook behavior pertinents
4. Si demande **Behavior Audit** → `BEHAVIOR_AUDIT.md`
5. Seulement ensuite → étapes 1–6 DESIGN_OS

Sans cette étape : **pas de proposition UX** pour ces catégories.

---

## Étape 1 — Comprendre le besoin produit

**Objectif :** savoir *pourquoi* cette surface existe avant *comment* elle est belle.

### Faire

- Job-to-be-done : quelle action l’utilisateur doit réussir ?
- Persona + contexte (B2B SaaS, consumer, mobile-first, desktop power-user…)
- Contraintes : plateforme (web / iOS / RN), design system existant, brand, délai
- Métriques de succès : conversion, rétention, clarté, temps-à-valeur
- Contenu réel vs placeholder : textes marketing, empty states, erreurs
- Si behavior gate : intégrer les conclusions psy (comportement cible, frictions, scores)

### Livrable

Une fiche courte (5–10 lignes) : problème, utilisateur, CTA principal unique, contraintes DS.

### Outils

Aucun catalogue nécessaire. Si flou produit → poser 1–3 questions ciblées, pas un questionnaire. Si behavior app → skill `behavioral-psychology`.

### Ne pas

- Ouvrir 21st / shadcn avant d’avoir un JTBD clair
- Empiler des features « nice to have » dans le premier viewport
- Proposer UX engagement/habit **sans** avoir chargé `behavioral-psychology`

---

## Étape 2 — Références

**Ordre imposé :** **Mobbin → Refero → Raylight → apps similaires**

### Faire

1. **Mobbin** — flows mobiles / web product (onboarding, paywall, settings, empty)
2. **Refero** — UI desktop / SaaS / marketing patterns haute fidélité
3. **Raylight** — inspiration visuelle / direction artistique contemporaine
4. **Apps similaires** — 2–4 concurrents ou « gold standards » du segment (Linear, Stripe, Raycast, Notion, Arc, Apple…)

### Livrable

3–7 captures / URLs annotées : ce qu’on **reprend** (structure, densité, hiérarchie) vs ce qu’on **refuse** (esthétique concurrente, clutter).

### Ne pas

- Copier pixel-perfect une marque concurrente
- Collecter 40 refs sans synthèse
- Sauter Refero pour une landing « parce que Mobbin suffit »

---

## Étape 3 — Définir le style

**Objectif :** une direction visuelle **nommable**, pas un collage.

### Ancres de style (choisir 1 primaire + 1 secondaire max)

| Ancre | Signaux |
|-------|---------|
| **Stripe** | Clarté marketing, typo précise, trust, motion sobre |
| **Linear** | Densité pro, contraste net, UI outil, dark élégant |
| **Raycast** | Command-first, vitesse, focus, accents marqués |
| **Arc** | Personnalité, couleur, browser-as-product |
| **Notion** | Contenu d’abord, calm UI, blocs, empty utiles |
| **Apple** | HIG, hiérarchie native, SF, spacing iOS, restraint |

### Faire

- Palette (ou tokens repo), typo (display + body), radius, elevation, motion budget
- Si DS repo existe → **mapper** le style sur les tokens existants (ne pas les remplacer)
- Activer **UI/UX Pro Max** et/ou **Frontend Design** pour formaliser la direction

### Livrable

1 paragraphe « look » + 5 tokens clés (ou référence aux tokens repo).

### Ne pas

- Mélanger Stripe landing + neumorphism + glass partout
- Purple-on-white / cream+terracotta / broadsheet par défaut (biais AI)

---

## Étape 4 — Construire les composants

**Règle absolue :** **21st.dev EN PREMIER, puis shadcn/ui — jamais l’inverse.**

### Ordre

1. Chercher sur **21st.dev** (CLI / Magic MCP / skills `21st-*`) un composant proche
2. Si match qualité + licence + adaptabilité DS → importer / adapter
3. Sinon **shadcn/ui** pour primitives (Button, Input, Dialog, Table…)
4. Sinon composant **custom** aligné tokens repo
5. **Spline** uniquement si le brief exige un hero 3D justifié (pas décoratif gratuit)

### Faire

- Adapter au design system (couleurs, radius, typo) — ne pas garder le look « démo 21st » brut
- Une composition claire par viewport (surtout landings)
- Un CTA primaire dominant

### Ne pas

- `npx shadcn add` en premier réflexe
- Empiler 8 libs UI
- Cards partout « pour structurer »

---

## Étape 5 — Audit visuel

**Objectif :** tuer le générique et les défauts craft avant polish.

### Stack d’audit (selon surface)

| Outil | Quand |
|-------|--------|
| **Magic MCP / 21st-ui-review** | Variantes composants, cohérence registry |
| **UI/UX Pro Max** | Styles, UX guidelines, a11y, stacks |
| **Frontend Design** | Identité, anti-slop, typo / motion / composition |
| **Vercel Design Guidelines** | **Obligatoire** landings / marketing |
| **Apple HIG** | iOS / native |
| **CHECKLIST_ANTI_SLOP** | Toujours |

### Livrable

Liste d’issues classées P0 / P1 / P2. Si demande « Audit Design » → protocole complet [AUDIT_DESIGN.md](AUDIT_DESIGN.md).

---

## Étape 6 — Optimiser

**Checklist d’optimisation :**

- [ ] **Hiérarchie** — un point focal par viewport / section
- [ ] **Contraste** — texte et contrôles WCAG-sensible
- [ ] **Spacing** — grille 4/8pt cohérente, respiration intentionnelle
- [ ] **Responsive** — desktop + mobile (pas « shrink and pray »)
- [ ] **Mobile** — targets, thumb zone, contenu prioritaire
- [ ] **Motion** — 2–3 motions intentionnelles max sur surfaces marketing ; respect `prefers-reduced-motion`
- [ ] **a11y** — focus, labels, sémantique, zoom, contraste

Reboucler étape 5 si des P0 restent.

---

## Matrice surface → étapes critiques

| Surface | Accent |
|---------|--------|
| Landing | 2, 3, 4 (hero budget), 5 Vercel, anti-slop |
| Dashboard | 2 Mobbin/Refero, densité Linear, empty states |
| Paywall | **0 behavior si habit/focus app**, 2 Mobbin, clarté pricing, 1 CTA |
| Auth | Friction minimale, trust, a11y forms |
| Onboarding | **0 behavior si habit/focus**, flows Mobbin, progression, skip |
| Pricing | Stripe-like clarity, 21st tables |
| Mobile / iOS | HIG + Mobbin, native patterns ; **0 behavior si productivity/focus** |
| Productivity / focus / habit | **Étape 0 obligatoire** → playbook [productivity.md](PLAYBOOKS/productivity.md) |
| Settings | Notion calm, scannabilité |
| Empty states | Action claire, pas illustration vide |

---

## Checklist de progression (copier)

```
DESIGN_OS Progress:
- [ ] 0 Behavior gate (si productivity/focus/gamification/habit/screen-time)
- [ ] 1 Besoin produit documenté
- [ ] 2 Refs Mobbin → Refero → Raylight → similaires
- [ ] 3 Style nommé (1+1) + tokens/DS
- [ ] 4 Composants 21st puis shadcn / custom
- [ ] 5 Audit (Pro Max / Frontend Design / Vercel / anti-slop)
- [ ] 6 Optimize hiérarchie / contraste / spacing / responsive / motion / a11y
```
