# Workout Engine — Architecture

## Principe

Le Workout Engine est une **machine à états** pure TypeScript, sans dépendance React.
L'UI ne fait qu'afficher `EngineView` et envoyer des `EngineEvent`.

```
React UI  →  dispatch(event)  →  transition()  →  EngineSnapshot
                ↑                      ↓
           subscribe(view)      ExerciseController
```

## États

| État | Description |
|------|-------------|
| `IDLE` | Aucune séance chargée |
| `READY` | Séance parsée, prête |
| `EXERCISE` | Phase de travail |
| `REST` | Repos entre séries |
| `PAUSED` | Pause utilisateur |
| `WAITING_USER_INPUT` | Bottom sheet logging |
| `FINISHED` | Séance terminée |

## Transitions centralisées

Toute logique de transition vit dans `transitions.ts`.
Les composants React **ne doivent jamais** modifier position/status directement.

## Contrôleurs par format

Chaque format d'entraînement a son propre contrôleur :

- `straightSetsController` — classic, weighted, bodyweight, tempo, dropset, cluster…
- `emomController` — intervalles 60s, rounds automatiques
- `pyramidController` / `ladderController` — reps dynamiques
- `supersetController` / `circuitController` — navigation par groupId
- `holdController` — isométrie, temps
- `distanceController` — distance

Registry : `getControllerForExercise(format)` — pas de switch géant.

## Persistance

- `localStorage` : `cali_engine_{sessionId}`
- API : `PATCH /api/workouts/:id/engine-state` (sync optionnelle)

## Tests

`transitions.test.ts` couvre le flux critique :
READY → EXERCISE → WAITING → REST → EXERCISE → FINISHED
