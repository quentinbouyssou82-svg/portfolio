# Scoring Lead Finder v5.1

## Objectif
Vendre des refontes web + IA aux **PME locales** uniquement.

## Filtre obligatoire (avant scoring)
Exclus → `leads_excluded.csv` :
- Franchises / chaînes (McDo, Dessange, etc.)
- Institutions (ordre des avocats, mairie, etc.)
- Grandes marques / réseaux (FONCIA, CAFPI, etc.)
- Domaines corporate / plateformes
- \>800 avis Maps (probable enseigne)

## Score final
```
Score_Final = SP × 0.60 + SS × 0.40
Sans site (email seul) : SP × 1.10 (SS ignoré)
```

## SS (score_site)
```
SS = 100 − qualité_visuelle
```
| SS | Signification |
|----|----------------|
| 90–100 | Site très mauvais — **excellent lead** |
| 70–90 | Site mauvais |
| 40–70 | Moyen |
| 10–40 | Bon site |
| 0–10 | Site excellent — ignorer |

### Qualité visuelle (1 HTTP, pas SEO/perf)
| Axe | Poids |
|-----|-------|
| Structure UX (DOM sémantique) | 25 % |
| Design (couleurs, typo, CSS) | 35 % |
| Hiérarchie UX (H1, CTA) | 20 % |
| Modernité (shadows, flex, etc.) | 15 % |
| Mobile | 5 % |
| − Pénalité site daté | jusqu'à −35 pts |

## SP (score_prospection)
| Critère | Poids |
|---------|-------|
| Secteur | 28 % |
| Taille | 20 % |
| Digital | 12 % |
| Activité | 12 % |
| Décideur | 8 % |
| site_vente | 20 % |

site_vente : pas de site=72, très mauvais=60, moyen=50, bon=38, excellent=28.

## Commandes
```bash
python lead_scorer.py leads_input.csv leads_ranked.csv
python notion_sync.py
```
