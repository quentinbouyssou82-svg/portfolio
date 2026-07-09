# SPRINT 1 — Rapport de stabilisation

Date : 26 juin 2026  
Statut : **Terminé** — aucune nouvelle fonctionnalité ajoutée.

---

## Bugs corrigés

| Bug | Cause | Correction |
|-----|-------|------------|
| Interface étirée pleine largeur desktop | Pas de conteneur max-width, pages en `min-h-dvh` sans layout global | `AppContainer` (max 480px, centré, safe areas) + `AppShell` sur toutes les routes |
| Écran PIN — boutons mal alignés | Grille 3 colonnes sur toute la largeur | Grille `max-w-xs` centrée, taille `pin` dédiée (carrés 5.5rem) |
| Cartes pleine largeur « page web » | Classes ad-hoc `glass-card`, padding incohérent | Design system `@cali/ui` : `Card`, `Screen`, `Header`, `Section` |
| Parsing IA — « La génération a dépassé le délai » | Pas de pre-flight Ollama ; timeout mal diagnostiqué ; `stream: false` lent | Pre-check Ollama + modèle ; timeout 120s configurable ; **streaming** Ollama |
| Crash possible sur JSON invalide | `JSON.parse` direct sans réparation | `parseJsonSafe` + `repairJsonText` dans `@cali/ai-engine` |
| Erreurs parsing peu claires | Messages génériques | Codes d'erreur (`OLLAMA_NOT_RUNNING`, `MODEL_NOT_FOUND`, `TIMEOUT`, `VALIDATION_FAILED`) |
| UI bloquée pendant analyse | Pas de feedback progression | Endpoint SSE `POST /api/workouts/parse/stream` + barre de progression |
| Risque écran blanc React | Pas d'Error Boundary | `ErrorBoundary` + `ErrorCard` (Réessayer / Retour / Copier logs) |
| Backend pouvait propager des 500 non gérés | `throw e` sur routes workouts GET | try/catch + réponses JSON structurées |

---

## Fichiers modifiés / créés

### Design system (`packages/ui`)
- `app-container.tsx`, `screen.tsx`, `card.tsx`, `text.tsx`, `input.tsx`, `header.tsx`, `section.tsx`, `progress-bar.tsx`, `bottom-sheet.tsx`
- `globals.css` — tokens 8px, `--width-cali-app-max`
- `button.tsx` — taille `pin`, largeurs cohérentes

### Frontend (`apps/mobile-web`)
- `components/app-shell.tsx`, `error-boundary.tsx`, `error-card.tsx`
- `lib/logger.ts`, `lib/parse-workout.ts` (client SSE)
- Refactor : `lock-screen`, `home-page`, `import-page`, `workout-live-page`, `set-log-sheet`, `live-stats-bar`, `protected-route`, `App.tsx`, `main.tsx`, `index.css`

### Backend (`apps/backend`)
- `services/ollama.ts` — réécriture complète (health, streaming, timeout)
- `services/ollama.test.ts`
- `routes/workouts.ts` — SSE parse, gestion erreurs robuste
- `routes/ollama.ts` — `GET /api/ollama/status`
- `lib/logger.ts`

### AI engine (`packages/ai-engine`)
- `json-repair.ts`, `json-repair.test.ts`
- `parse.ts` — `ParseWorkoutError`, logs détaillés, réparation JSON

### Types (`packages/types`)
- `engine.ts` — signature `estimateWorkSeconds` avec ctx optionnel

### Documentation
- `docs/SPRINT1-REPORT.md` (ce fichier)

---

## Améliorations d'architecture

1. **Séparation parsing / transport** : Ollama retourne du texte brut → `ai-engine` parse + répare + valide Zod.
2. **SSE pour l'analyse** : le frontend reçoit des événements `progress` / `complete` / `error` sans bloquer l'UI.
3. **Pre-flight Ollama** : `ensureOllamaReady()` avant toute génération — message explicite si Ollama arrêté ou modèle absent (liste des modèles disponibles).
4. **Design system centralisé** : toutes les pages passent par les mêmes primitives UI.
5. **Journalisation structurée** : JSON logs backend + ring buffer frontend exportable.

---

## Tests automatiques

| Package | Tests | Statut |
|---------|-------|--------|
| `@cali/utils` | auth, formatDuration | ✅ |
| `@cali/ai-engine` | json-repair (fence, trailing comma, invalid) | ✅ |
| `@cali/workout-engine` | state machine transitions | ✅ |
| `@cali/timer-engine` | countdown, pause, skip | ✅ |
| `@cali/backend` | ollama health, model missing, error codes | ✅ |

Commande : `npm test`

---

## Points à surveiller

1. **Performance Qwen** — sur machine lente, 120s peuvent encore être insuffisants ; augmenter `OLLAMA_TIMEOUT_MS` dans `.env`.
2. **Modèle recommandé** — `qwen2.5-coder` ou `qwen2.5` ; vérifier via `GET /api/ollama/status`.
3. **JSON complexe** — séances très longues peuvent produire du JSON partiel ; la réparation automatique a des limites.
4. **SSE + proxy** — en dev Vite proxy doit laisser passer `text/event-stream` (OK par défaut).
5. **Workout live** — reprise après refresh dépend du `localStorage` ; sync API `engine-state` est best-effort.
6. **Tests E2E** — pas encore de Playwright ; workflow PIN → fin à valider manuellement sur téléphone.

---

## Validation workflow (checklist manuelle)

- [ ] PIN `0610` → accueil
- [ ] Import → coller séance → Analyser (Ollama lancé)
- [ ] Progression visible pendant l'analyse
- [ ] Redirection écran live workout
- [ ] Démarrer → Terminé → bottom sheet → repos → série suivante
- [ ] Tester avec Ollama arrêté → message « Ollama n'est pas lancé »
- [ ] Tester avec mauvais modèle → liste des modèles disponibles

---

## Prochaines étapes (après validation)

Étapes **10** (analyse IA fin de séance) et **11** (PDF) restent **gelées** jusqu'à validation de cette phase.
