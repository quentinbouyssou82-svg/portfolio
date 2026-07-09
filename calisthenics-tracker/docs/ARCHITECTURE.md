# Architecture — Calisthenics AI Tracker

## Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│  mobile-web (React = couche d'affichage uniquement)          │
│  dispatch(EngineEvent) · subscribe(EngineView)               │
└────────────┬─────────────────────────────┬───────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌────────────────────────────┐
│  @cali/workout-engine  │    │  @cali/timer-engine        │
│  State Machine         │◄──►│  start/pause/resume/skip   │
│  ExerciseControllers   │    │  localStorage persist      │
└────────────┬───────────┘    └────────────────────────────┘
             │
             ▼
┌────────────────────────┐    ┌────────────────────────────┐
│  @cali/stats-engine    │    │  @cali/ai-engine (étape 10)│
│  LiveStats             │    │  parse + analyse           │
└────────────────────────┘    └────────────────────────────┘
             │
             ▼
┌────────────────────────┐
│  Express + SQLite      │
│  POST /workouts/parse  │
│  POST /workouts/:id/sets│
└────────────────────────┘
```

## Packages moteurs (sans React)

| Package | Rôle |
|---------|------|
| `workout-engine` | Machine à états, contrôleurs par format |
| `timer-engine` | Timer work/rest, survit au refresh |
| `stats-engine` | Reps, volume, temps actif/repos |
| `ai-engine` | Parsing Qwen + validation Zod |
| `pdf-engine` | Stub — étape 11 |

## Workout Engine

Voir `packages/workout-engine/ARCHITECTURE.md`.

**États** : IDLE → READY → EXERCISE ↔ REST → WAITING_USER_INPUT → FINISHED

**Contrôleurs** : registry par format (EMOM, pyramid, circuit, superset, hold…)

**Règle** : aucune logique métier dans les composants React.

## Flux parsing (Étape 4)

```
Texte ChatGPT
  → buildWorkoutParsePrompt()
  → Ollama / Qwen
  → parsedWorkoutSchema (Zod)
  → WorkoutSession (status: parsed)
```

Aucun regex côté backend.

## API Workouts

| Route | Description |
|-------|-------------|
| `POST /api/workouts/parse` | Analyse IA + sauvegarde |
| `GET /api/workouts/:id` | Séance + logs |
| `POST /api/workouts/:id/start` | Démarre séance |
| `PATCH /api/workouts/:id/engine-state` | Sync moteur |
| `POST /api/workouts/:id/sets` | Log immédiat série |
| `POST /api/workouts/:id/complete` | Fin séance |

## Roadmap

| Étape | Statut |
|-------|--------|
| 4 — Parsing IA | ✅ |
| 5 — Workout Engine | ✅ (base + contrôleurs) |
| 6 — Timer Engine | ✅ |
| 7 — UI Live Workout | ✅ |
| 8 — Logging bottom sheet | ✅ |
| 9 — Stats temps réel | ✅ |
| 10 — Analyse IA fin séance | 🔜 |
| 11 — PDF | 🔜 |
| 12–13 — Polish + tests E2E | 🔜 |

## Prochaines améliorations

- Contrôleurs AMRAP / For Time avec time cap global
- Bouton IA pendant séance (étape 10)
- Reprise séance après kill app (hydratation depuis API)
- Tests contrôleurs EMOM / circuit / pyramid
