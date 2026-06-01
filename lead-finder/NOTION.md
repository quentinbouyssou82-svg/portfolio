# Export Notion — Leads IA

Ce guide explique comment envoyer `data_scored.csv` dans Notion avec `export_notif.py` (API officielle Notion).

## 1. Créer une intégration Notion (token)

1. Ouvrez [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Cliquez **Nouvelle intégration**
3. Nom : par ex. `Lead Finder`
4. Type : **Interne** (workspace personnel ou équipe)
5. Copiez le **token secret** (commence par `secret_` ou `ntn_`)

```bash
export NOTION_TOKEN="secret_votre_token_ici"
```

Ne commitez jamais ce token dans Git.

## 2. Préparer une page parente dans Notion

L’intégration doit avoir accès à l’endroit où la base sera créée.

1. Créez une page Notion (ex. `Prospection Lead Finder`)
2. Menu **⋯** → **Connexions** → ajoutez votre intégration **Lead Finder**
3. Copiez l’**ID de la page** depuis l’URL :

```
https://www.notion.so/mon-workspace/Nom-de-la-page-abc123def456...
                                              └─ ID (32 caractères, avec ou sans tirets)
```

```bash
export NOTION_PARENT_PAGE_ID="abc123def4567890abcdef1234567890"
```

## 3. Créer ou réutiliser la base « Leads IA »

### Option A — Le script crée la base (recommandé la 1ère fois)

Ne définissez **pas** `NOTION_DATABASE_ID`. Le script crée une base **Leads IA** avec les colonnes :

| Colonne      | Type Notion   |
|-------------|---------------|
| name        | Titre         |
| website     | URL           |
| phone       | Téléphone     |
| address     | Texte         |
| score_total | Nombre        |
| priority    | Sélection (HIGH / MEDIUM / LOW) |

À la fin, le script affiche l’ID à enregistrer :

```bash
export NOTION_DATABASE_ID="id_affiche_par_le_script"
```

### Option B — Base déjà existante

1. Créez une base manuellement avec les mêmes noms de colonnes (en anglais, minuscules)
2. Connectez l’intégration à cette page
3. Copiez l’ID depuis l’URL de la base :

```bash
export NOTION_DATABASE_ID="votre_id_de_base"
```

## 4. Installer les dépendances

```bash
cd lead-finder
source .venv/bin/activate
pip install -r requirements.txt
```

## 5. Lancer l’export

Pipeline complet :

```bash
python scrape_maps.py
python enrich_maps.py   # ou SAFE_MODE=1 pour test
python score_leads.py
python export_notif.py
```

Export seul :

```bash
export NOTION_TOKEN="secret_..."
export NOTION_PARENT_PAGE_ID="..."   # 1ère fois seulement
python export_notif.py
```

Relances suivantes (base déjà créée) :

```bash
export NOTION_TOKEN="secret_..."
export NOTION_DATABASE_ID="..."
python export_notif.py
```

## 6. Dashboard dans Notion

Dans Notion vous pouvez ajouter :

- une vue **Table** triée par `score_total` décroissant
- des filtres par `priority` (HIGH / MEDIUM / LOW)
- des groupes par priorité pour la prospection

## Dépannage

| Erreur | Solution |
|--------|----------|
| `NOTION_TOKEN manquant` | `export NOTION_TOKEN=...` |
| `object not found` | Vérifier que l’intégration est connectée à la page / base |
| `validation_error` sur une propriété | Vérifier les noms de colonnes (`name`, `website`, etc.) |
| Limite API | Augmenter `NOTION_REQUEST_DELAY=0.5` |

## Variables utiles

| Variable | Description |
|----------|-------------|
| `NOTION_TOKEN` | Token intégration (obligatoire) |
| `NOTION_DATABASE_ID` | ID base existante |
| `NOTION_PARENT_PAGE_ID` | Page où créer la base |
| `NOTION_REQUEST_DELAY` | Pause entre requêtes (défaut `0.35` s) |

---

# Sync Notion — Lead Ranking IA (`notion_sync.py`)

Synchronise **`leads_ranked.csv`** vers la base **Lead Ranking IA** avec **upsert par email** (création ou mise à jour).

## Colonnes Notion

| Colonne | Type | Note |
|---------|------|------|
| **email** | Titre | Colonne principale business |
| name | Texte | |
| website | URL | |
| score_prospection | Nombre | PC (0–50) |
| score_site | Nombre | PS (0–50) |
| score_final | Nombre | **%** (0–100, dérivé du score brut) |
| niveau_lead | Sélection | excellent / bon / moyen / faible |
| priorité_contact | Sélection | urgente / haute / moyenne / basse |
| raisons_principales | Texte | |
| problèmes_detectés | Texte | |
| opportunités_de_revente | Texte | |
| last_updated | Date | Mise à jour auto à chaque sync |

## Lancer la sync

```bash
export NOTION_TOKEN="secret_..."
export NOTION_PARENT_PAGE_ID="..."          # 1ère fois
python lead_scorer.py leads_input.csv leads_ranked.csv
python notion_sync.py
```

Relances (base déjà créée) :

```bash
export NOTION_RANKING_DATABASE_ID="id_affiche_par_le_script"
python notion_sync.py
```

## Vue dashboard recommandée

1. Ouvrir la base **Lead Ranking IA**
2. Vue **Table** → tri **score_final** décroissant
3. Filtre optionnel : `priorité_contact` = urgente / haute
4. Masquer les colonnes secondaires si besoin

## Sync intelligente

- Index des emails déjà présents en base
- **Email existant** → `pages.update`
- **Nouvel email** → `pages.create`
- Gestion **rate limit** (429) avec retry + pause `NOTION_REQUEST_DELAY`
