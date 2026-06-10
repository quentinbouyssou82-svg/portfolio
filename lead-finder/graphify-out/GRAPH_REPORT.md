# Graph Report - lead-finder  (2026-06-03)

## Corpus Check
- 17 files · ~13,079 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 412 nodes · 1195 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

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
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `SiteSnapshot` - 28 edges
2. `DomainCache` - 27 edges
3. `str` - 26 edges
4. `CacheEntry` - 26 edges
5. `PerfTracker` - 26 edges
6. `LeadContext` - 26 edges
7. `float` - 25 edges
8. `EnrichedBusiness` - 19 edges
9. `str` - 19 edges
10. `clamp()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `bool` --uses--> `LeadContext`  [INFERRED]
  business_qualification.py → scoring_engine.py
- `LeadContext` --uses--> `LeadContext`  [INFERRED]
  business_qualification.py → scoring_engine.py
- `LeadContext` --uses--> `SiteAnalysis`  [INFERRED]
  scoring_engine.py → site_analyzers.py
- `ScoreBreakdown` --uses--> `SiteAnalysis`  [INFERRED]
  scoring_engine.py → site_analyzers.py
- `float` --uses--> `SiteAnalysis`  [INFERRED]
  scoring_engine.py → site_analyzers.py

## Import Cycles
- None detected.

## Communities (17 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (12): analyze_site_html(), _clamp(), count_font_families(), count_hex_colors(), max_dom_depth(), float, int, str (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): _quality_base(), 40% — design global perçu (élevé = daté / cheap)., 40% — design global perçu (élevé = daté / cheap)., 25% — clarté du parcours (élevé = confus)., 40% — design global perçu (élevé = daté / cheap)., Probabilité de vendre une refonte (20 % du SP).     Courbe asymétrique : site mo, Point de départ avant sous-scores (100 = très moche)., Point de départ avant sous-scores (100 = très moche). (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (17): parse_review_count(), int, Extrait un nombre d'avis depuis la ligne Maps si présent., Estime la taille / maturité du business (0–100)., Estime la taille / maturité du business (0–100)., Extrait un nombre d'avis depuis la ligne Maps si présent., Extrait un nombre d'avis depuis la ligne Maps si présent., Estime la taille / maturité du business (0–100). (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.26
Nodes (12): classify_business_type(), _normalize_text(), notion_select_options(), pc_bonus_for_type(), float, str, Classification métier (business_type) + bonus score prospection (PC)., Legacy — utiliser sector_prospection_score. (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (35): build_properties(), create_database_and_data_source(), ensure_data_source_schema(), extract_email_from_page(), extract_website_from_page(), fetch_existing_pages(), find_title_column(), get_database_id_env() (+27 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (10): analyze_perceived_ux(), _finalize_visual_profile(), Estime l'impression visuelle en 3 secondes via signaux DOM visibles.     Ne scor, Estime l'impression visuelle en 3 secondes via signaux DOM visibles.     Ne scor, Estime l'impression visuelle en 3 secondes via signaux DOM visibles.     Ne scor, Estime l'impression visuelle en 3 secondes via signaux DOM visibles.     Ne scor, Estime l'impression visuelle en 3 secondes via signaux DOM visibles.     Ne scor, SS interne : 0 = site beau/moderne, 100 = site moche.     « Moderne » seulement (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (21): build_page_properties(), create_lead_page(), export_to_notion(), get_notion_client(), get_or_create_database(), is_valid_url(), load_scored_csv(), log() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (16): compute_score(), has_value(), is_company_name(), is_complete_address(), load_enriched(), main(), priority_from_score(), bool (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (39): _contains_any(), _norm(), parse_review_count(), bool, int, LeadContext, str, qualify_lead() (+31 more)

### Community 9 - "Community 9"
Cohesion: 0.53
Nodes (5): apply_turbo_env(), main(), int, str, run_step()

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (22): analyze_html(), analyze_site(), compute_sp(), fetch_html(), has_scorable_website(), is_email_only_lead(), normalize_url(), bool (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (59): AsyncPage, Browser, BrowserContext, Business, extract_category_from_maps_line(), Extrait la catégorie depuis une ligne Maps du type :     « Salon de coiffure · 4, prime_cookies(), accept_cookies_if_present() (+51 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (66): CacheEntry, build_output_rows(), enrich_on_page(), enrich_with_budget(), EnrichJob, main(), needs_enrich(), page_worker() (+58 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (17): 10% — style contemporain (élevé = années 2005)., 10% — style contemporain (élevé = années 2005)., 10% — expérience mobile perçue., 25% — 100 = navigation confuse., 10% — style contemporain (élevé = années 2005)., 10% — 100 = look années 2005 / template générique., 10% — style contemporain (élevé = années 2005)., 10% — 100 = look années 2005 / template générique. (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.43
Nodes (6): extract_emails_from_html(), is_valid_email(), pick_best_email(), bool, str, Extraction d'emails depuis HTML (stdlib).

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (15): clamp(), compute_ss(), compute_ss_from_analysis(), niveau_from_final(), parse_rating(), priorite_from_final(), float, Moteur de scoring Lead Finder v5.1  Score_Final = SP × 0.60 + SS × 0.40  |  sans (+7 more)

## Knowledge Gaps
- **12 isolated node(s):** `int`, `bool`, `Path`, `bool`, `Playwright` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `domain_key()` connect `Community 12` to `Community 8`, `Community 4`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `maps_place_key()` connect `Community 11` to `Community 8`, `Community 12`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `LeadContext` connect `Community 8` to `Community 10`, `Community 2`, `Community 20`, `Community 5`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `DomainCache` (e.g. with `CacheEntry` and `EnrichJob`) actually correct?**
  _`DomainCache` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `CacheEntry` (e.g. with `CacheEntry` and `EnrichJob`) actually correct?**
  _`CacheEntry` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `PerfTracker` (e.g. with `CacheEntry` and `EnrichJob`) actually correct?**
  _`PerfTracker` has 17 INFERRED edges - model-reasoned connections that need verification._
- **What connects `int`, `Filtre business v5.1 — ne garder que les PME / indépendants locaux vendables.`, `Retourne (True, "") si PME locale qualifiée.     Retourne (False, raison) si exc` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._