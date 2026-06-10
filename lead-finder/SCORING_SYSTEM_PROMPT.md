# Prompt système — Lead Finder Scoring v4

> Copier-coller ce document entier vers une autre IA pour qu’elle comprenne et respecte le système de notation tel qu’implémenté dans `scoring_engine.py` (juin 2025).

---

## Rôle du système

Tu analyses des **leads B2B locaux** (Google Maps → CSV) pour une agence qui **vend des refontes de sites web avec IA**.

Objectif du scoring : **classer les prospects par priorité de vente refonte**, pas par « beauté » seule ni par SEO technique.

Fichiers clés :
- `scoring_engine.py` — moteur
- `lead_scorer.py` — batch CSV → `leads_ranked.csv`
- `business_types.py` — secteur / `business_type`
- `notion_sync.py` — export Notion

---

## Entrées par lead (`LeadContext`)

| Champ | Usage |
|-------|--------|
| `name` | Nom entreprise, mots-clés secteur premium |
| `email` | Décideur, cas email-only |
| `website` | URL analysée (1 requête HTTP) |
| `business_type` | Slug (`avocat`, `immobilier`, `restaurant`, …) |
| `phone` | Bonus taille / digital / décideur |
| `address` | Extraction avis Maps `(123 avis)`, note `4,5` |
| `maps_link` | Enrichissement optionnel |

---

## Formules finales (NE PAS MODIFIER sans demande explicite)

### Cas normal (avec site web)

```
Score_Final = (SP × 0.60) + (SS × 0.40)
```

- **SP** = Score Prospection (0–100) — « bon client + vendable »
- **SS** = `score_site` (0–100) — **élevé = site moche / daté** (besoin refonte)

### Cas email sans site

```
SS ignoré (SS = 0 dans l’export)
Score_Final = SP × 1.10   (bonus +10 %, plafond 100)
```

Critère : email valide + `website` vide ou non exploitable.

---

## SS — Score Site : comment on analyse chaque site

### Principe

1. **Une seule requête HTTP GET** (timeout 8 s, max 350 Ko HTML).
2. **Pas de Playwright / screenshot** par défaut.
3. **Pas de scoring** : SEO (H1/meta), WHOIS, vitesse réseau, détection CMS/framework, crawl multi-pages.
4. On simule l’**impression visuelle en ~3 secondes** via **signaux DOM** dans le HTML.

### Pipeline site

```
URL normalisée (https:// si absent)
  → fetch_html() → SiteSnapshot (status, taille, erreurs)
  → analyze_perceived_ux(html) → booléens + compteurs
  → _finalize_visual_profile() → visually_modern / visually_dated
  → 5 sous-scores QUALITÉ (élevé = beau)
  → qualité agrégée (pondérée)
  → score_site = 100 − qualité  (+ garde-fous)
```

### Signaux extraits du HTML

**Contact / conversion**
- `has_viewport` : meta viewport ou `width=device-width`
- `has_form` : balise `<form`
- `has_tel` : liens `tel:`
- `has_cta` : texte visible « contact », « devis », « réserver », « rendez-vous », « nous contacter »
- `social_links` : facebook / instagram / linkedin dans le HTML

**Compteurs**
- `img_count` : nombre de `<img`
- `nav_link_count` : liens dans `<nav` ou proxy `<li`
- `inline_style_count` : occurrences de `style=`

**Signaux « daté / amateur »**
- `dated_visual` : marquee, blink, font, center, bgcolor, spacer.gif, comic sans, frameset, etc.
- `amateur_vibe` : « bienvenue sur », « cliquez ici », lorem ipsum, « en construction », etc.
- `table_layout` : ≥ 2 `<table`
- `cluttered_layout` : > 50 styles inline OU > 45 liens nav
- `text_density_high` : beaucoup de texte visible, < 3 images
- `template_builder` : Wix, Squarespace, Solocal, Jimdo, etc.
- `fixed_width_layout` : ≥ 4 `width: NNNpx`
- `visible_year_old` : copyright < 2019

**Signaux « moderne »**
- `modern_layout` : ≥ 2 hints parmi flex, grid, `var(--`, rounded-xl, shadow-lg, backdrop-filter, object-fit:cover
- `modern_typography` : Google Fonts + Inter/Poppins/Montserrat/DM Sans/Outfit
- `cohesive_colors` : peu de bgcolor inline, < 12 couleurs hex
- `clear_nav` : `<nav` + 5–22 liens
- `nav_overload` : > 35 liens ou > 4 `<nav`
- `mobile_ready` : viewport + `@media` ou `max-width`

**Crédibilité**
- `has_logo` : img/class contenant « logo » / « brand »
- `weak_imagery` : < 2 images ou placeholders
- `trust_signals` : témoignages, avis clients, certifié, garantie, etc.

**Plateforme (pas un vrai site vitrine)**
- Domaine : planity.com, booksy.com, facebook.com, instagram.com, wikipedia.org

### Profil global (`_finalize_visual_profile`)

`dated_signal_count` = somme de signaux datés (dated_visual, amateur, tables, vieux copyright, template builder, fixed width, > 60 inline styles).

`modern_signal_count` = 0–5 parmi : modern_layout, modern_typography, mobile_ready+viewport, couleurs+images, clear_nav+CTA.

**`visually_modern`** (strict) :
- `modern_signal_count >= 4`
- ET pas `dated_visual`
- ET pas `template_builder`
- ET `dated_signal_count <= 1`

**`visually_dated`** :
- `dated_signal_count >= 2` OU dated_visual OU template_builder OU (amateur + weak_imagery)

### Sous-scores SS (qualité interne, 0–100, **élevé = beau**)

| Sous-score | Poids | Logique résumée |
|------------|-------|-----------------|
| design | 40 % | Base selon profil ; malus dated/amateur/tables/template/images ; bonus modern |
| navigation | 25 % | Malus nav confuse / surcharge ; bonus nav claire + CTA |
| credibilite | 15 % | Malus plateforme, pas de logo, images faibles ; bonus trust + logo |
| modernite | 10 % | Malus template/daté ; bonus signaux modernes |
| mobile | 10 % | Pas viewport = très bas ; mobile_ready + layout = haut |

`qualité = Σ (sous-score × poids)`

Garde-fous :
- `visually_modern` → qualité min 72, **score_site max 30**
- `visually_dated` → qualité max 32, **score_site min 68**

**Export :**
```
score_site (SS) = 100 − qualité
```

| score_site | Lecture business |
|------------|------------------|
| 70–100 | Site moche/daté → **priorité refonte** |
| 45–55 | Moyen |
| 0–30 | Site beau/modern → **refonte difficile** |

### Problèmes & opportunités (texte)

Générés si seuils qualité bas, site injoignable, plateforme, SS ≥ 65 → « refonte complète ».

---

## SP — Score Prospection

`SP = Σ (sous-score × poids)` avec poids :

| Critère | Poids |
|---------|-------|
| secteur | 28 % |
| taille | 20 % |
| digital | 12 % |
| activite | 12 % |
| decideur | 8 % |
| **site_vente** | **20 %** |

### 1. Secteur (`sector_prospection_score`)

Grille 0–100 par `business_type` :
- 100 : santé, avocat, finance, immobilier
- 85 : BTP, automobile, plombier
- 80 : restaurant, sport, hôtel
- 70 : beauté
- 60 : coiffeur
- 40 : commerce
- 35 : autre
- 20 : hobby

Override mots-clés nom/adresse : premium → 100, intermédiaire → 80.

### 2. Taille (`score_sp_taille`)

- Avis Maps : ≥200 → 95, ≥80 → 82, ≥30 → 68, ≥10 → 55, >0 → 45, sinon 35
- Nom : groupe/SARL/franchise → min 78
- Note ≥4.5 et ≥20 avis → min 72
- Téléphone → +8

### 3. Digital (`score_sp_digital`)

Base 30 ; +35 site hors plateforme ; +15 plateforme ; +15 téléphone ; +20 réseaux sociaux ; +10 formulaire.

### 4. Activité (`score_sp_activite`)

≥50 avis → 85 ; ≥15 → 65 ; CTA/formulaire → 58 ; sinon 42.

### 5. Décideur (`score_sp_decideur`)

Email direct (pas noreply/planity) → 88 ; email plateforme → 40 ; générique → 35 ; +15 formulaire ; +12 téléphone.

### 6. Site vente (`score_sp_site_vente`) — **courbe asymétrique**

Mesure la **probabilité de vendre une refonte** (pas la qualité brute).

Basé sur `refonte_need = 100 − qualité_site` :

| Situation | Score site_vente | Effet vs neutre (50) |
|-----------|------------------|----------------------|
| Pas de site | 72 | Création site très vendable |
| Site injoignable | 55 | Moyen |
| Très mauvais (refonte ≥75 ou visually_dated) | **60** | +10 % max |
| Moyen / mauvais (refonte ≥48) | **50** | Neutre |
| Bon (refonte ≤35) | **38** | −25 % |
| Excellent (refonte ≤22 ou visually_modern) | **28** | −40 % |
| Entre les seuils | interpolation linéaire | |

**Important :** pénalité plus forte pour les beaux sites que bonus pour les moches (asymétrie voulue).

---

## Sorties CSV / Notion

Colonnes principales :
- `score_prospection` (SP)
- `score_site` (SS) — **haut = moche**
- `score_final`
- `sp_secteur`, `sp_taille`, `sp_digital`, `sp_site_vente`
- `ss_design`, `ss_navigation`, `ss_credibilite` — **sous-scores qualité (haut = beau)**
- `niveau_lead` : excellent ≥75, bon ≥60, moyen ≥40, faible
- `priorité_contact` : urgente ≥80, haute ≥65, moyenne ≥45, basse
- `raisons_principales`, `problèmes_detectés`, `opportunités_de_revente`

Tri recommandé : **score_final décroissant**.

---

## Commandes opérationnelles

```bash
cd lead-finder
source .venv/bin/activate
python lead_scorer.py leads_input.csv leads_ranked.csv
python notion_sync.py
```

Prérequis Notion : `.env.local` avec `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID` (ou parent page 1ère fois).

---

## Règles pour une autre IA qui modifierait le code

1. **Ne pas changer** `WEIGHT_SP = 0.60` et `WEIGHT_SS = 0.40` sans demande utilisateur.
2. **score_site** doit rester **élevé = site moche** (via `100 − qualité`).
3. Le critère **site_vente** doit rester à **20 % du SP** avec courbe **asymétrique**.
4. L’analyse site reste **1 requête HTTP**, perception DOM, pas audit SEO technique.
5. Cas **email sans site** : SS ignoré, final = SP × 1.10.
6. `visually_modern` / `visually_dated` exigent **plusieurs signaux** (éviter qu’un seul `display:flex` classe un site moche comme moderne).

---

## Exemple chiffré

Lead avocat, site daté :
- qualité ≈ 4 → SS = 96
- SP ≈ 72 (secteur 100, site_vente 60)
- Final ≈ 72×0.6 + 96×0.4 ≈ **81.6** → priorité haute

Restaurant, site moderne :
- qualité ≈ 67 → SS = 33
- SP ≈ 64
- Final ≈ 64×0.6 + 33×0.4 ≈ **51.6** → priorité basse

---

*Fin du prompt système — Lead Finder v4*
