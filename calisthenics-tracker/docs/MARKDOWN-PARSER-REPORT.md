# Rapport — Parser Markdown déterministe

**Date :** 26 juin 2026  
**Objectif :** Supprimer le LLM du parsing d'import de séance ; conserver Ollama uniquement pour l'analyse post-séance, les conseils et le Q&A.

---

## Résumé

| Métrique | Avant (LLM) | Après (Markdown) |
|----------|-------------|------------------|
| Temps moyen de parsing | ~15–120 s (Ollama CPU) | **~0,004 ms** (benchmark 500 runs) |
| Dépendance réseau / Ollama à l'import | Obligatoire | Aucune |
| Déterminisme | Non (hallucinations possibles) | Oui (même entrée → même JSON) |
| Tests automatiques types de blocs | Partiels (ai-engine) | **12 tests** couvrant les 9 formats |

Le parser Markdown est le **mode par défaut**. Le mode LLM reste disponible via `WORKOUT_PARSE_MODE=llm` ou `parseMode: "llm"`.

---

## Fichiers créés

### Package `@cali/workout-parser`

```
packages/workout-parser/
  package.json
  tsconfig.json
  src/
    index.ts           — export public
    errors.ts          — ParseMarkdownError
    format.ts          — BLOCK_TYPE_TO_FORMAT, OFFICIAL_FORMAT_EXAMPLE
    parse.ts           — parseWorkoutMarkdown() (logique principale)
    parse.test.ts      — 12 tests + benchmark <100 ms
```

### Backend

| Fichier | Rôle |
|---------|------|
| `apps/backend/src/services/parse-workout.ts` | Orchestration unifiée : `resolveParseMode()`, `parseWorkout()` (markdown \| llm) |

### Documentation

| Fichier | Rôle |
|---------|------|
| `docs/MARKDOWN-PARSER-REPORT.md` | Ce rapport |

---

## Fichiers modifiés (câblage)

| Fichier | Changement |
|---------|------------|
| `apps/backend/src/routes/workouts.ts` | `parseMode` body/query ; markdown par défaut |
| `apps/backend/package.json` | Dépendance `@cali/workout-parser` |
| `apps/mobile-web/src/lib/parse-workout.ts` | `POST /api/workouts/parse` (markdown) par défaut |
| `apps/mobile-web/src/lib/parse-workout-stream.ts` | SSE conservé pour `parseMode: "llm"` |
| `apps/mobile-web/src/pages/import-page.tsx` | Template officiel, UI sans étapes IA |
| `apps/mobile-web/src/pages/home-page.tsx` | Texte d'accueil mis à jour |
| `.env.example` | `WORKOUT_PARSE_MODE=markdown` |
| `package.json` (racine) | build/test incluent `@cali/workout-parser` |

---

## Fichiers supprimés

**Aucun.** Le mode LLM est conservé derrière un feature flag :

- `packages/ai-engine/` — toujours utilisé pour `parseMode: "llm"`
- `packages/prompts/` — prompts Ollama
- `apps/backend/src/services/ollama.ts` — génération JSON locale (chemin compat)

Cela permet une migration progressive sans casser les imports existants basés sur du texte libre + IA.

---

## Format Markdown officiel

Source de vérité : `OFFICIAL_FORMAT_EXAMPLE` dans `packages/workout-parser/src/format.ts`.

```text
# Workout
Name: Pull Strength
Goal: Force
EstimatedDuration: 70
---
## Block
Type: StraightSets
Exercise: Pull-Up
Sets: 5
Reps: 5
Rest: 180
RIR: 2
---
## Block
Type: EMOM
Duration: 10
Exercise: Push-Up
RepsPerMinute: 10
```

### Mapping des types

| Type Markdown | Format moteur (`WorkoutFormatType`) |
|---------------|-----------------------------------|
| StraightSets | `classic` |
| EMOM | `emom` |
| Pyramid | `pyramid` |
| Ladder | `ladder` |
| Superset | `superset` |
| Circuit | `circuit` |
| Hold | `hold` |
| Weighted | `weighted` |
| Bodyweight | `bodyweight` |

Le parser produit un objet validé par Zod (`parsedWorkoutSchema` de `@cali/types`), compatible avec `WorkoutSession`.

---

## Performance

### Benchmark automatisé (vitest)

Test `temps moyen < 100ms sur 200 parses` — **PASS**.

### Benchmark manuel (500 runs, 3 échantillons)

```json
{
  "runs": 500,
  "avgMs": "0.004",
  "minMs": 0,
  "maxMs": 2,
  "p95Ms": 0
}
```

**Objectif < 100 ms : largement atteint** (gain ~10⁴–10⁵× vs Ollama).

---

## Tests automatiques

`npm test -w @cali/workout-parser` — **12/12 PASS** :

1. Exemple officiel complet
2. StraightSets
3. EMOM
4. Pyramid
5. Ladder
6. Superset (multi-exercices)
7. Circuit
8. Hold
9. Weighted
10. Bodyweight
11. Rejet document sans blocs
12. Benchmark 200 parses < 100 ms

Suite complète monorepo : `npm test` — **PASS**.

---

## Compatibilité

### Anciennes séances (texte libre)

| Scénario | Comportement |
|----------|--------------|
| Import texte libre (ChatGPT non structuré) | **Échec** en mode markdown (erreur explicite) → utiliser `parseMode: "llm"` ou `WORKOUT_PARSE_MODE=llm` |
| Séances déjà en base (JSON `WorkoutSession`) | **Inchangées** — pas de re-parse |
| Analyse post-séance / PDF / coaching | **Inchangé** — Ollama toujours utilisé |

### Activer le mode LLM (compatibilité)

```bash
# .env
WORKOUT_PARSE_MODE=llm
```

ou côté API / frontend :

```json
{ "rawText": "...", "parseMode": "llm" }
```

Alias acceptés : `ai`, `md`.

---

## Améliorations obtenues

1. **Import instantané** — plus de blocage « Création… » pendant 15–120 s d'attente Ollama.
2. **Fiabilité** — parsing déterministe, validation Zod stricte, erreurs localisées (`ParseMarkdownError` avec ligne/champ).
3. **Séparation des responsabilités** — LLM réservé à la valeur ajoutée (analyse, conseils, Q&A).
4. **Testabilité** — couverture unitaire par type de bloc, benchmark intégré.
5. **Coût opérationnel** — aucune dépendance GPU/CPU lourde à l'import ; Ollama optionnel hors import.
6. **UX** — page Import avec template officiel pré-rempli ; messages d'étape adaptés (pas d'« IA » à l'import).

---

## Commandes utiles

```bash
cd calisthenics-tracker

# Tests parser
npm test -w @cali/workout-parser

# Build complet
npm run build

# Dev
npm run dev
```

Variables d'environnement clés :

```env
WORKOUT_PARSE_MODE=markdown   # défaut
OLLAMA_MODEL=mistral:latest   # analyse post-séance uniquement
```
