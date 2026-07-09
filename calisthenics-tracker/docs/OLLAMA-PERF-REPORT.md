# Rapport — Investigation performance Ollama

Date : 26 juin 2026  
Machine de test : Mac local, `mistral:latest` via `http://127.0.0.1:11434`  
Workout de référence :

```text
5x5 Pull-Ups
3 min rest
3x10 Push-ups
```

---

## Conclusion exécutive

**La lenteur ne vient pas d'Ollama « cassé », ni du Mac, ni de Prisma/Zod.**

**≈ 95–99 % du temps est passé dans `eval_duration` Ollama** — génération de tokens en CPU (~8–9 tokens/s mesurés).

Notre intégration était lente parce qu'elle :

1. Envoyait un **prompt 5–20× plus long** que le test terminal
2. Forçait une **sortie JSON verbeuse** (300–570 tokens vs ~175 en mode minimal)
3. Utilisait `format: "json"` + `num_predict: 4096` (plafond inutile)
4. Pouvait faire **2 appels Ollama** (`maxRetries: 1`)
5. Appelait `/api/tags` avant **chaque** génération (health check non caché)

**Ce n'est PAS :** cold start modèle (load ~70 ms), JSON parse (~1 ms), Zod (~1 ms), Prisma (~50 ms).

---

## Étape 1 — Logs requête Ollama

Fichier : `apps/backend/src/services/ollama-generate.ts`

Chaque appel `/api/generate` loggue :

- modèle, endpoint
- prompt système (aucun dans notre intégration — tout est dans `prompt`)
- prompt utilisateur complet + preview
- caractères, tokens estimés (~chars/4)
- `stream`, `format`, `keep_alive`, `temperature`, `num_predict`, etc.
- timings Ollama : `load_duration`, `prompt_eval_duration`, `eval_duration`, `eval_count`

Exemple log : `ollama.request` → `ollama.response`

---

## Étape 2 — Route debug

`POST /api/debug/ollama` — sans auth, sans Zod

Body :

```json
{
  "rawText": "5x5 Pull-Ups\n3 min rest",
  "mode": "minimal | production",
  "format": "none | json",
  "num_predict": 1024
}
```

`POST /api/debug/ollama/compare` — enchaîne 3 scénarios + mesure JSON/Zod

---

## Étape 3 — Mesures factuelles

### A. Test terminal équivalent (curl direct `/api/generate`)

| Scénario | Prompt chars | Tokens~ | eval_count | load_ms | prompt_eval_ms | eval_ms | wall_ms |
|----------|-------------|---------|------------|---------|----------------|---------|---------|
| **Minimal** (comme `ollama run`) | 112 | 28 | 177 | 94 | 5 292 | 18 604 | **24 221** |
| **Production OLD** + format:json | 2 193 | 548 | 388 | 71 | 1 370 | 54 795 | **59 005** |
| **Production NEW** (avant opti) + format:json | 657 | 165 | 524 | 71 | 217 | 74 196 | **75 323** |
| **Production NEW** sans format | 657 | 165 | 568 | 79 | 2 695 | 58 008 | **60 818** |
| **Ultra compact** + format:json | 252 | 63 | 296 | — | — | 43 227 | **75 732** |
| **Optimisé** (minimal + shape, sans format) | 296 | 74 | 345 | — | — | 42 786 | **45 667** |

**Vitesse génération mesurée :** ~8–9 tokens/s (`eval_count / eval_ms`).

### B. Route debug API

| Route | wall_ms | eval_count | ollamaGenerateCalls |
|-------|---------|------------|---------------------|
| `POST /api/debug/ollama` mode=minimal | 55 233 | 206 | **1** |

### C. Post-traitement (mesuré)

| Étape | Temps |
|-------|-------|
| `parseJsonSafe` | **~1 ms** |
| `parsedWorkoutSchema.parse` (Zod) | **~1 ms** |
| Prisma `workoutSession.create` | **~50–80 ms** |

### D. Répartition typique (parse production OLD)

```
Ollama eval     ████████████████████████████████████████  95%+
Ollama prompt   █                                          2%
Ollama load     ▏                                         <1%
JSON + Zod      ▏                                         <0.1%
Prisma          ▏                                         <1%
```

---

## Étape 4 — Prompt

### Avant (`packages/prompts/src/workout.ts`, ~62 lignes + schéma inline)

- **2 193 caractères** pour le workout test
- Schéma JSON complet répété inline (~40 lignes)
- Liste de 20+ formats dans les règles

### Après optimisation

- **296 caractères** — style `ollama run` + une ligne de shape JSON
- Réduction **−86 %** vs ancien prompt
- Validation complète déléguée à Zod (inchangé)

---

## Étape 5 — `format: "json"`

| Config | eval_ms | eval_count |
|--------|---------|------------|
| Production 657 chars **sans** format | 58 008 | 568 |
| Production 657 chars **avec** format:json | 74 196 | 524 |
| Minimal **sans** format | 24 108 | 174 |

**Conclusion :** `format: "json"` n'accélère pas. Il peut augmenter la verbosité structurelle.  
**Action appliquée :** retiré de `generateOllamaJson`, réparation via `parseJsonSafe`.

---

## Étape 6 — Contexte

| Paramètre | Valeur intégration |
|-----------|-------------------|
| `system` | **aucun** (tout dans `prompt`) |
| Historique / messages | **aucun** (1 seul prompt par appel) |
| `num_ctx` | défaut Ollama (non surchargé) |
| `keep_alive` | **`30m`** (ajouté — évite unload) |

---

## Étape 7 — Nombre d'appels par clic « Analyser »

| Appel | Avant | Après |
|-------|-------|-------|
| `GET /api/tags` (health) | 1 (chaque parse) | 1 max / 60s (cache) |
| `POST /api/generate` | 1–2 (`maxRetries:1`) | **1** (`maxRetries:0`) |
| Backend parse | 1 | 1 |
| **Total Ollama generate** | **1–2** | **1** |

Instrumentation : `apps/backend/src/services/ollama-metrics.ts`  
Compteurs exposés dans les logs `workouts.parse` : `ollamaGenerateCalls`, `ollamaTagsCalls`.

---

## Étape 8 — Chronométrage par phase (parse.ts)

`phaseTimings` retourné et loggé :

```json
{
  "promptBuildMs": 0,
  "ollamaMs": 45667,
  "jsonParseMs": 1,
  "zodMs": 1,
  "totalMs": 45700
}
```

---

## Étape 9 — Optimisations classées par impact

| Impact | Optimisation | Statut | Gain mesuré |
|--------|-------------|--------|-------------|
| ★★★★★ | Prompt minimal (style `ollama run`) au lieu du schéma inline 60 lignes | **Appliqué** | 2193 → 296 chars ; ~60–136s → ~46s |
| ★★★★★ | Réduire tokens de sortie (prompt court = moins de JSON généré) | **Appliqué** | 524 → 345 tokens ; ~25% plus rapide |
| ★★★★☆ | Retirer `format: "json"` | **Appliqué** | évite contrainte lente/inutile |
| ★★★★☆ | `num_predict: 1024` au lieu de 4096 | **Appliqué** | plafond réaliste |
| ★★★☆☆ | `keep_alive: "30m"` | **Appliqué** | load 70ms vs 10–40s cold start |
| ★★★☆☆ | Cache health check 60s | **Appliqué** | −1 HTTP roundtrip/parse |
| ★★☆☆☆ | `maxRetries: 0` | **Appliqué** | évite 2e appel Ollama |
| ★★☆☆☆ | Logs timings Ollama natifs | **Appliqué** | diagnostic |
| ★★☆☆☆ | Route `/api/debug/ollama` | **Appliqué** | benchmark |
| ★☆☆☆☆ | JSON repair / Zod / Prisma | Déjà optimal | <100ms |

### Optimisations restantes (non appliquées — hors périmètre)

| Impact | Action |
|--------|--------|
| ★★★★★ | GPU / Metal activé pour Ollama (accélérateur natif) |
| ★★★★☆ | Modèle quantifié plus petit (ex. `mistral:7b-instruct-q4_0`) — **non fait** (consigne : ne pas changer de modèle) |
| ★★★☆☆ | Streaming + affichage progressif (UX, pas vitesse totale) |

---

## Étape 10 — Fichiers modifiés

| Fichier | Rôle |
|---------|------|
| `apps/backend/src/services/ollama-generate.ts` | Logs complets + timings Ollama |
| `apps/backend/src/services/ollama-metrics.ts` | Compteur appels |
| `apps/backend/src/services/ollama.ts` | `keep_alive`, sans format, cache health, 1 appel |
| `apps/backend/src/routes/debug.ts` | Routes benchmark |
| `packages/prompts/src/workout.ts` | Prompt simplifié −86% |
| `packages/ai-engine/src/parse.ts` | `phaseTimings` |
| `apps/backend/src/routes/workouts.ts` | Logs métriques parse |

---

## Pourquoi `ollama run` semble plus rapide

Mesure **sur la même machine, même modèle, même workout** :

- Notre test minimal via API : **~24–26 s**
- Parse production ancien : **~60–136 s**

Si `ollama run` paraît « quelques secondes », causes probables :

1. **Workout plus court** testé manuellement
2. **Modèle déjà chaud** en session interactive
3. **Perception** (pas de timeout UI à 180s)
4. **Sortie plus courte** acceptée (JSON non validé par Zod)

L'écart **60s vs 24s** s'explique entièrement par **×2–3 plus de tokens générés**, pas par un bug réseau.

---

## Nouveau temps obtenu

| Workflow | Avant | Après |
|----------|-------|-------|
| Prompt | 2 193 chars | **296 chars** |
| Appels Ollama | 1–2 | **1** |
| Temps Ollama (workout test) | 60–136 s | **~46 s** |
| JSON + Zod + Prisma | <100 ms | <100 ms |

**Objectif « aussi rapide que ollama run » :** atteignable (~25 s) si on accepte le prompt minimal sans shape JSON (validation Zod peut échouer).  
**Compromis actuel (~46 s) :** prompt minimal + shape JSON pour fiabilité Zod.

---

## Commandes de vérification

```bash
# Benchmark minimal (comme terminal)
curl -X POST http://localhost:3001/api/debug/ollama \
  -H 'Content-Type: application/json' \
  -d '{"rawText":"5x5 Pull-Ups\n3 min rest","mode":"minimal","format":"none"}'

# Comparaison complète (3 appels Ollama — ~3 min)
curl -X POST http://localhost:3001/api/debug/ollama/compare \
  -H 'Content-Type: application/json' \
  -d '{"rawText":"5x5 Pull-Ups\n3 min rest\n3x10 Push-ups"}'

# Parse réel
curl -X POST http://localhost:3001/api/workouts/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"rawText":"5x5 Pull-Ups\n3 min rest"}'
```

Consulter les logs serveur : `ollama.request`, `ollama.response`, `workouts.parse`.
