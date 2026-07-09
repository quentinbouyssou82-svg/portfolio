# Graph Report - calisthenics-tracker  (2026-06-26)

## Corpus Check
- 123 files · ~23,991 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 816 nodes · 1194 edges · 44 communities (42 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90502b03`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 25 edges
2. `TimerEngine` - 22 edges
3. `WorkoutEngine` - 20 edges
4. `getExercise()` - 18 edges
5. `compilerOptions` - 15 edges
6. `compilerOptions` - 14 edges
7. `getSet()` - 14 edges
8. `getControllerForExercise()` - 13 edges
9. `scripts` - 11 edges
10. `transition()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `parseWorkoutWithAi()` --calls--> `log()`  [INFERRED]
  packages/ai-engine/src/parse.ts → apps/backend/src/lib/logger.ts
- `willAdvanceToNextExercise()` --calls--> `getControllerForExercise()`  [INFERRED]
  apps/mobile-web/src/hooks/use-workout-session.ts → packages/workout-engine/src/controllers/registry.ts
- `requireAuth()` --calls--> `isSessionExpired()`  [INFERRED]
  apps/backend/src/middleware/session.ts → packages/utils/src/session-shared.ts
- `parseWorkout()` --calls--> `enrichParsedWorkout()`  [INFERRED]
  apps/backend/src/services/parse-workout.ts → packages/workout-parser/src/enrich.ts
- `parseWorkout()` --calls--> `normalizeWorkoutInputDetailed()`  [INFERRED]
  apps/backend/src/services/parse-workout.ts → packages/workout-parser/src/normalize.ts

## Import Cycles
- None detected.

## Communities (44 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (44): AppShell(), ErrorBoundary, Props, State, ErrorCard(), ErrorCardProps, FallbackRedirect(), GuestRoute() (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (36): completedSetsCount(), estimateRepsSeconds(), getBarSetupSeconds(), getExercise(), getSet(), groupIndices(), linearNextPosition(), totalSetsInWorkout() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (47): log(), logger, LogLevel, requireAuth(), authRouter, loginSchema, bodySchema, debugRouter (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (39): enrichParsedWorkout(), isWarmupExercise(), baseWorkout, withDefinition(), withWarmupRest(), ParseMarkdownError, BLOCK_TYPE_TO_FORMAT, countBlocks() (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (32): AppContainer(), AppContainerProps, BottomSheet(), BottomSheetProps, Button, ButtonProps, buttonVariants, Card() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): dependencies, @cali/stats-engine, @cali/timer-engine, @cali/types, @cali/ui, @cali/utils, @cali/workout-engine, framer-motion (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (27): dependencies, @cali/ai-engine, @cali/database, @cali/prompts, @cali/types, @cali/utils, @cali/workout-parser, cors (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (5): TimerEngine, TimerListener, TimerMode, TimerSnapshot, TimerStatus

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (25): ControllerContext, EngineEvent, EnginePhase, EngineSnapshot, EngineStatus, EngineView, ExerciseController, PerformedSetLog (+17 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (18): persistEngineState(), useWorkoutSession(), UseWorkoutSessionOptions, willAdvanceToNextExercise(), formatHoldLogComments(), FRONT_LEVER_FORMS, FrontLeverForm, HOLD_FORMATS (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (21): dependencies, @cali/types, devDependencies, typescript, vitest, exports, ./session, import (+13 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (13): loadStoredSession(), generateSessionToken(), hashPin(), verifyPin(), clamp(), estimateWarmupRestSeconds(), EXERCISE_CATALOG, ExerciseCatalogEntry (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (20): devDependencies, concurrently, typescript, engines, node, name, private, scripts (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (19): dependencies, @prisma/client, devDependencies, prisma, typescript, exports, import, main (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (17): dependencies, @cali/prompts, @cali/types, devDependencies, typescript, vitest, exports, import (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (17): dependencies, @cali/types, devDependencies, typescript, vitest, exports, import, main (+9 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (17): dependencies, @cali/types, @cali/utils, devDependencies, typescript, vitest, exports, import (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (16): compilerOptions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (9): extractJsonPayload(), parseJsonSafe(), repairJsonText(), OllamaJsonClient, ParseProgressEvent, ParseWorkoutError, ParseWorkoutResult, parseWorkoutWithAi() (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (16): dependencies, @cali/types, devDependencies, typescript, vitest, exports, import, main (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority, clsx, framer-motion, tailwind-merge, exports, ./globals.css, main (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+7 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (15): dependencies, zod, devDependencies, typescript, exports, import, main, name (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (14): dependencies, @cali/types, devDependencies, typescript, exports, import, main, name (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (14): devDependencies, typescript, vitest, exports, import, main, name, private (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (13): devDependencies, typescript, exports, import, main, name, private, scripts (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (8): exerciseBlockSchema, loadUnitSchema, ParsedWorkoutInput, ParsedWorkoutOutput, parsedWorkoutSchema, setSpecSchema, tempoSpecSchema, workoutFormatSchema

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 30 - "Community 30"
Cohesion: 0.60
Nodes (4): computeLiveStats(), LiveStats, StatsInput, sumReps()

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

## Knowledge Gaps
- **367 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+362 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `isSessionExpired()` connect `Community 11` to `Community 2`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `requireAuth()` connect `Community 2` to `Community 11`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `loadStoredSession()` connect `Community 11` to `Community 0`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getExercise()` (e.g. with `.getBaseWorkDurationSeconds()` and `.getRestDurationSeconds()`) actually correct?**
  _`getExercise()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _367 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05285592497868713 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08077260755048288 - nodes in this community are weakly interconnected._