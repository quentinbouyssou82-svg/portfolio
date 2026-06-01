# Lead Finder

Collecte et enrichissement de prospects locaux via Google Maps.

## Pourquoi le terminal reste bloqué sur « wait for shell » ?

| Cause | Script | Durée typique |
|-------|--------|----------------|
| **Boucle enrichissement** (1 goto par commerce) | `enrich_maps.py` | 5 fiches × ~25 s ≈ **2 min** ; 30 fiches × ~25 s ≈ **12+ min** |
| `page.goto` timeout 60 s (ancienne version) | enrich | jusqu’à 1 min **par** fiche en échec |
| Prints Python non flushés | tous | aucune sortie visible pendant longtemps |
| Lancement Chromium / Playwright | tous | 10–30 s au 1er run |
| Scroll résultats | `scrape_maps.py` | ~30 s max (pas infini) |

**Déblocage immédiat :**

```bash
cd lead-finder
source .venv/bin/activate

# Sans navigateur, instantané :
SAFE_MODE=1 PYTHONUNBUFFERED=1 python enrich_maps.py

# Scrape liste seule (5 résultats, debug) :
DEBUG=1 MAX_ROWS=5 PYTHONUNBUFFERED=1 python scrape_maps.py

# Enrichissement réel sur 5 fiches seulement :
DEBUG=1 MAX_ROWS=5 PYTHONUNBUFFERED=1 python enrich_maps.py
```

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Mode TURBO (~10 min pour 200 leads avec emails)

Google Maps limite le parallélisme (au-delà de 3 onglets → fiches vides). Le goulot est **l’enrichissement Maps**, pas la recherche d’emails.

| Étape | Durée indicative (200 leads) |
|-------|------------------------------|
| Scrape liste | ~2–4 min |
| Enrich Maps (3 onglets, 8 s/fiche max) | ~8–10 min |
| Emails HTTP (32 workers, 3 s/req) | **~1–2 min** |
| Scoring + Notion | ~2–3 min |

```bash
# Pipeline automatisé (scrape une fois, puis turbo)
TURBO_MODE=1 MAX_ROWS=200 DEBUG=0 python run_pipeline.py --turbo

# Ou si data.csv existe déjà :
TURBO_MODE=1 DEBUG=0 python enrich_maps.py
TURBO_MODE=1 python find_emails.py
```

**Important :** vous n’aurez pas 200 *emails* en 10 min — beaucoup de coiffeurs sont sur Planity/Booksy sans email public. TURBO skip ces plateformes. Comptez ~15–40 % d’emails selon le secteur.

## Mode haute performance (1000+ leads)

```bash
cd lead-finder && source .venv/bin/activate

# 1. Liste Maps
DEBUG=0 MAX_ROWS=1000 PYTHONUNBUFFERED=1 python scrape_maps.py

# 2. Sites + téléphones (parallèle async, cache domaine)
FAST_MODE=1 WORKERS=12 DEBUG=0 PYTHONUNBUFFERED=1 python enrich_maps.py

# 3. Emails HTTP parallèle (homepage / contact / mentions, stop au 1er email)
FAST_MODE=1 WORKERS=12 DEBUG=0 PYTHONUNBUFFERED=1 python find_emails.py

# 4. Scoring + Notion
python lead_scorer.py leads_input.csv leads_ranked.csv
python notion_sync.py
```

| Variable | Défaut | Effet |
|----------|--------|--------|
| `FAST_MODE` | `false` | Timeouts courts, pas de pages profondes, headless |
| `WORKERS` | `min(16, cpu×2)` | Parallélisme HTTP (`find_emails`) |
| `PLAYWRIGHT_CONCURRENCY` | `6` si FAST | Pages Maps simultanées (`enrich_maps`) |
| `HTTP_TIMEOUT_S` | `6` si FAST | Timeout par requête site |
| `HTTP_RETRIES` | `1` si FAST | Retries réseau |
| Cache | `cache/domain_cache.json` | Clé = domaine, pas de re-scrape |

Logs `[PERF]` : sites/s, ETA, ms par site.

## Variables d'environnement

| Variable | Défaut | Effet |
|----------|--------|--------|
| `DEBUG` | `false` | Limite lignes (`MAX_ROWS=100`) |
| `MAX_ROWS` | `999999` | Nombre max de lignes traitées |
| `SAFE_MODE` | `false` | Pas de visite fiche par fiche |
| `HEADLESS` | `true` | Navigateur invisible |
| `NAVIGATION_TIMEOUT_MS` | `8s` si FAST | Timeout goto |
| `ACTION_TIMEOUT_MS` | `5s` si FAST | Timeout clics / sélecteurs |
| `PAGE_DELAY_MS` | `0` si FAST | Pause entre fiches (enrich) |

## Pipeline

### 1. `scrape_maps.py` — liste depuis la page de recherche

```bash
PYTHONUNBUFFERED=1 python scrape_maps.py
```

→ `data.csv` (name, maps_link, address)

**SAFE_MODE** (name + maps_link seulement, peu de scroll) :

```bash
SAFE_MODE=1 PYTHONUNBUFFERED=1 python scrape_maps.py
```

→ `data_safe.csv` + `data.csv`

### 2. `enrich_maps.py` — site + téléphone (optionnel)

```bash
PYTHONUNBUFFERED=1 python enrich_maps.py
```

→ `data_enriched.csv`

**SAFE_MODE** (copie sans ouvrir Maps) :

```bash
SAFE_MODE=1 PYTHONUNBUFFERED=1 python enrich_maps.py
```

### 3. `score_leads.py` — priorisation

```bash
python score_leads.py
```

Lit `data_enriched.csv` → `data_scored.csv` (score + HIGH / MEDIUM / LOW), trié par score décroissant.

| Points | Condition |
|--------|-----------|
| +30 | Site web renseigné |
| +20 | Téléphone renseigné |
| +20 | Nom d’entreprise (heuristique) |
| +10 | Adresse complète |
| −20 | Ni site ni téléphone |

## Fichiers

| Fichier | Rôle |
|---------|------|
| `pipeline_core.py` | Workers, cache, HTTP, PERF, Playwright fast |
| `email_utils.py` | Extraction / validation emails |
| `maps_common.py` | CSV Maps, helpers async/sync |
| `scrape_maps.py` | Étape 1 — page de résultats |
| `enrich_maps.py` | Étape 2 — fiches détaillées (async parallèle) |
| `find_emails.py` | Étape 3 — emails HTTP parallèle |
| `score_leads.py` | Étape 3 — scoring & priorité |
| `export_notif.py` | Étape 4 — export vers Notion |

### 4. Export Notion

```bash
pip install -r requirements.txt
python export_notif.py
```

Configuration détaillée : **[NOTION.md](./NOTION.md)**

### 5. Classement leads web — `lead_scorer.py`

CSV d'entrée (`name`, `website`, `email`) — **email obligatoire** :

```bash
python lead_scorer.py leads_input.csv leads_ranked.csv
```

### Emails automatiques — `find_emails.py`

**Tu n'as pas à remplir `leads_input.csv` à la main.**

```bash
# Après enrich_maps (recommandé)
FAST_MODE=1 WORKERS=12 DEBUG=0 python find_emails.py
```

Lit `data_enriched.csv`, scanne les sites en parallèle (HTTP, pas Maps) → `leads_input.csv` (écriture progressive).

Puis :

```bash
python lead_scorer.py leads_input.csv leads_ranked.csv
python notion_sync.py
```

Analyse heuristique HTTP (stdlib, parallèle) → scores PC / PS / final. Voir `leads_input.example.csv`.

### 6. Sync Notion ranking — `notion_sync.py`

```bash
python notion_sync.py leads_ranked.csv
```

Upsert vers **Lead Ranking IA** (email = clé, PC/PS séparés, score_final en %). Voir **[NOTION.md](./NOTION.md)** section Lead Ranking IA.
