# SPRINT 2 — Rapport refonte UX/UI

Date : 26 juin 2026  
Périmètre : **design uniquement** — aucune modification backend, moteurs ou logique métier.

---

## Audit initial — défauts identifiés

| Écran | Problèmes |
|-------|-----------|
| **PIN** | Grille flottante, touches tailles incohérentes, points PIN minuscules, pas de haptic, animation d'entrée faible |
| **Accueil** | Header générique, carte CTA plate, pas de hiérarchie, badge IA trop petit |
| **Import** | Textarea brute, pas de compteur, loading minimal, pas d'étapes visuelles |
| **Workout** | Timer texte seul, stats plates, boutons footer basiques, pas de timer circulaire, pas de carte « suivant » |
| **Global** | Couleurs Sprint 1 non alignées spec, glassmorphism faible, pas de transitions pages, boutons sans états loading/success |

---

## Design system — composants refondus

### Tokens (`packages/ui/src/globals.css`)
- Fond `#09090B`, cartes `#111827`, warning `#F59E0B`
- Grille 8px, rayons carte 20px
- Ombres `shadow-cali-sm/md/lg/glow`
- Classes typo : `cali-text-display`, `hero`, `title`, `subtitle`, `body`, `caption`, `label`
- Utility `.cali-glass` : blur 20px, bordure 8% blanc, ombre douce

### Nouveaux composants
| Composant | Rôle |
|-----------|------|
| `Button` | Framer Motion `whileTap`, `loading`, `success`, ombres colorées, tailles `pin` / `fab` |
| `Card` | Glass premium, `interactive` avec scale |
| `CircularTimer` | Anneau SVG animé, label central |
| `PinDots` | Points PIN animés spring + glow |
| `Skeleton` / `SkeletonCard` | Chargement workout |
| `ProgressBar` | Gradient animé motion |

### Layout
- `AppContainer` : gradient radial accent en fond, max 480px centré
- Transitions pages : fade + slide 280ms dans `App.tsx`

---

## Écrans refondus

### PIN
- Logo dans carte 72×72 avec spring entrance
- Grille 3×4 fixe : touches **72×72px**, gap **16px**, delete aligné
- `PinDots` animés à chaque chiffre
- Haptic light / medium / error via `navigator.vibrate`
- Shake sur erreur

### Accueil
- Header éditorial (label accent + titre)
- CTA carte interactive avec chevron, ombre, bouton intégré
- Liste fonctionnalités avec puces accent
- Stagger animation entrée

### Import
- Zone de collage avec header + **compteur de caractères**
- Animation scale au paste
- Panneau analyse avec icône IA animée
- 4 étapes visuelles : Lecture → Compréhension → Création → Validation
- Bouton premium avec glow bleu
- `ErrorCard` intégré au design system

### Workout
- Barre progression épaisse en haut
- Stats en 4 mini-cartes glass
- **Nom exercice display**, reps en **hero size**
- **Timer circulaire** (repos = vert, pause = orange)
- Carte « Suivant »
- **Dock flottant** glass : Terminé + Pause + Skip
- Écran fin avec check animé spring
- Skeleton au chargement

### Bottom sheet logging
- Glass refond, inputs 56px, haptic à la validation

---

## Animations ajoutées

| Animation | Durée | Où |
|-----------|-------|-----|
| Page transition fade+slide | 280ms | Toutes les routes |
| Button scale press | spring 500/30 | Tous les boutons |
| PIN dot spring | spring 500/28 | Lock screen |
| Card stagger | 80ms delay | Accueil |
| Exercise card enter | 300ms ease | Workout |
| Progress bar width | 350ms | Import, workout |
| Circular timer stroke | 400ms | Workout |
| Bottom sheet spring | damping 32 | Set log |
| Analysis step pulse | 1.2s loop | Import loading |
| Finish check scale | spring | Workout end |

---

## Fichiers modifiés

```
packages/ui/src/
  globals.css, button.tsx, card.tsx, text.tsx, input.tsx
  app-container.tsx, bottom-sheet.tsx, progress-bar.tsx
  circular-timer.tsx, pin-dots.tsx, skeleton.tsx, index.ts

apps/mobile-web/src/
  App.tsx, index.css, main.tsx (inchangé logique)
  lib/haptic.ts (nouveau)
  pages/lock-screen.tsx, home-page.tsx, import-page.tsx, workout-live-page.tsx
  components/error-card.tsx, app-shell.tsx
  components/workout/set-log-sheet.tsx, live-stats-bar.tsx
```

**Non modifiés** : backend, workout-engine, timer-engine, stats-engine, ai-engine, hooks métier.

---

## Responsive

- `AppContainer` : `max-w-[min(100%,30rem)]` — jamais étiré sur desktop/ultrawide
- Padding safe areas iPhone conservé
- Grille PIN fixe en px pour cohérence SE → Pro Max
- Dock workout wrap sur petits écrans

---

## Captures avant/après

Les captures ne sont pas générées automatiquement dans ce rapport. Pour valider visuellement :

```bash
cd calisthenics-tracker && npm run dev
```

Ouvrir `http://localhost:3000` — comparer avec le build Sprint 1 (`git stash` / branche précédente).

**Avant** : layout pleine largeur, boutons hétérogènes, timer texte, import minimal.  
**Après** : app centrée type iOS, glass cards, timer circulaire, dock flottant, analyse par étapes.

---

## Points à surveiller

1. **Haptic** — fonctionne sur iOS Safari / Android Chrome, pas sur desktop
2. **CircularTimer** — `phaseTotal` estimé côté UI uniquement (pas de changement moteur)
3. **Home CTA** — carte entière cliquable avec `pointer-events-none` sur le bouton interne (pattern Link wrapper)
4. Tester sur iPhone SE (hauteur dock + clavier PIN)

---

## Prochaine étape

Validation visuelle utilisateur → puis reprise étapes 10–11 (IA analyse + PDF) si approuvé.
