# PROMPTS — DESIGN_OS

Prompts prêts à coller. Adapter `[…]`. Toujours préfixer mentalement : *« Suis DESIGN_OS workflow 1–6 »*.

---

## Par outil

### 21st.dev / Magic MCP

```
Cherche sur 21st un composant [pricing table | hero | navbar | bento | command palette]
style [Linear|Stripe|Raycast], dense, sans cards décoratives, Tailwind adaptable
à nos tokens. Propose 3 options + recommandation unique + raisons.
```

```
Via Magic MCP : search "[query]" limit 5. Filtre : dark, product UI, pas glassmorphism.
Importe la meilleure et mappe aux CSS variables du repo.
```

### shadcn/ui

```
Après échec de match 21st : ajoute shadcn [Button|Dialog|Table|Form],
thème = tokens repo uniquement, pas de style démo shadcn par défaut.
```

### UI/UX Pro Max

```
Utilise UI/UX Pro Max (search design-system) pour [SaaS dashboard|paywall|landing]
produit "[Nom]", style ancre [Linear], contraintes anti-slop DESIGN_OS.
Donne palette, fonts, UX must/avoid.
```

### Frontend Design

```
Pass 1 plan design : sujet […], ancre [Stripe/Linear], anti AI-slop strict,
hero budget (brand + 1 headline + 1 phrase + CTA + 1 ancre visuelle).
Puis Pass 2 implémentation alignée DS repo.
```

### Frontend AI Studio

```
Applique frontend-ai-studio + DESIGN_OS : aesthetic minimal SaaS,
8pt grid, hiérarchie typo stricte, zéro noise. DS repo prioritaire.
```

### Vercel Design Guidelines

```
Audite cette landing contre portfolio/skills/vercel-design/CHECKLIST.md.
Table PASS/FAIL/N/A + findings fichier:ligne + correctifs P0.
```

### Apple HIG

```
Review écran iOS [nom] vs HIG : navigation, hit targets, typography,
sheets, Reduce Motion. Liste écarts + fixes SwiftUI.
```

### Mobbin → Refero → Raylight

```
Étape refs DESIGN_OS :
1) Synthèse Mobbin : 3 flows [onboarding|paywall|settings] — structure écrans + CTA
2) Refero : 3 UI desktop/SaaS similaires — densité, sidebar, empty
3) Raylight : 2 directions mood exploitables (typo/couleur) sans glass/glow
Livrable : ce qu’on reprend / refuse.
```

### Spline

```
Uniquement si justifié : scene Spline minimale pour expliquer [objet produit],
loop lent, fallback image, prefers-reduced-motion. Sinon : full-bleed photo/screenshot.
```

---

## Par playbook

### Landing

```
Playbook landing-page DESIGN_OS. JTBD […]. Style [Stripe].
Refs Mobbin/Refero/Raylight puis composants 21st→shadcn.
Hero budget strict + anti-slop + audit Vercel avant ship.
```

### Dashboard SaaS

```
Playbook dashboard-saas. Densité Linear. Pas de cards inutiles.
Empty states actionnables. Données réelles ou skeleton honnête.
21st pour blocs complexes, shadcn pour table/dialog.
```

### Paywall

```
Playbook paywall. 1 offre highlight, pricing clair, trust marks sobres.
Refs Mobbin paywalls top apps. Zéro 15 CTAs. Mobile-first si iOS.
```

### Auth

```
Playbook auth. Friction minimale, a11y forms, trust, erreurs claires.
Primitives shadcn/21st login ; pas d’illustration AI.
```

### Onboarding

```
Playbook onboarding. Flow Mobbin 3–5 steps max, skip, progression visible.
Une question / un job par écran.
```

### Pricing

```
Playbook pricing. Clarté Stripe, table 21st d’abord, highlight 1 plan,
FAQ courte, CTA unique par plan.
```

### Mobile app

```
Playbook mobile-app. Mobbin first, thumb zone, tab bar claire,
empty + paywall patterns. Anti-slop mobile.
```

### iOS native

```
Playbook ios-native + Apple HIG. SwiftUI patterns système,
pas de web-card aesthetic. Dynamic Type + Reduce Motion.
```

### Empty states

```
Playbook empty-states. Message + raison + CTA primaire.
Pas de mascotte AI. Réf Notion calm / Linear empty.
```

### Settings

```
Playbook settings. Groupes scannables type Notion/iOS Settings.
Pas de cards décoratives. Recherche si >10 items.
```

---

## Audit Design

```
Exécute AUDIT_DESIGN.md sur [surface/path].
Scan → issues → score /100 → compare Linear/Stripe/Raycast/Notion
→ plan P0/P1/P2. Applique aussi CHECKLIST_ANTI_SLOP.
```

---

## Anti-slop express

```
Passe ANTI_AI_SLOP + CHECKLIST_ANTI_SLOP sur [fichier/route].
Liste signes détectés (≥2 = SLOP RISK) + remplacements concrets.
Ne propose pas de gradients/glass/cards « pour faire joli ».
```
