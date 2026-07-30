# UI/UX Pro Max — Documentation agents

Documentation interne pour les agents Cursor. Elle résume le skill installé **UI/UX Pro Max** et indique quand / comment l’utiliser.

**Chemin :** `/Users/quentinbouyssou/portfolio/skills/uiux-pro-max/`

**Instruction unique :** avant toute création d’interface, consulter [RULES.md](./RULES.md) + [CHECKLIST.md](./CHECKLIST.md).

---

## Quand les agents DOIVENT consulter ce dossier

| Situation | Obligatoire |
|-----------|-------------|
| Nouvelle page (landing, dashboard, SaaS, mobile, admin) | Oui |
| Création / refactor de composants UI (bouton, modal, form, table, chart…) | Oui |
| Choix couleurs, typo, spacing, layout | Oui |
| Review UX / accessibilité / cohérence visuelle | Oui |
| Navigation, animations, responsive | Oui |
| Backend / API / DevOps sans impact UI | Non |

**Critère :** si le travail change comment une feature *looks, feels, moves, or is interacted with* → consulter.

---

## Fichiers

| Fichier | Contenu |
|---------|---------|
| [SKILL.md](./SKILL.md) | Pointer Cursor (frontmatter) — lit RULES + CHECKLIST d’abord |
| [SUMMARY.md](./SUMMARY.md) | Résumé complet : structure, capacités, styles, palettes, fonts, stacks |
| [RULES.md](./RULES.md) | Règles dures prioritaires (a11y → charts) |
| [CHECKLIST.md](./CHECKLIST.md) | Checklist design avant et après création |
| [EXAMPLES.md](./EXAMPLES.md) | Exemples CLI, prompts, do/don’t |

---

## Source (ground truth)

Skill installé (ne pas recopier les CSV ici) :

```
/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/
├── SKILL.md
├── scripts/          # search.py, design_system.py, core.py (BM25)
└── data/             # styles, colors, typography, products, ux, charts, stacks…
```

---

## Relation Driveely / frontend-ai-studio

| Couche | Rôle |
|--------|------|
| **Design system du repo** (tokens CSS, composants, patterns Driveely) | Source de vérité visuelle du produit |
| **frontend-ai-studio** | Studio frontend minimal SaaS (Stripe/Linear) — appliqué automatiquement sur le UI web |
| **UI/UX Pro Max** | Couche de **guidance** : styles, palettes, UX, a11y, stacks, CLI `--design-system` |

**Règle d’arbitrage :** Pro Max ne remplace pas le DS existant. Sur Driveely / portfolio, réutiliser tokens et composants du projet ; utiliser Pro Max pour valider UX, a11y, responsive, et pour générer des recommandations quand il n’y a pas encore de DS.

---

## Workflow agent (rapide)

1. Lire **RULES.md** + **CHECKLIST.md** (pré).
2. Si nouveau produit / page sans DS : lancer `--design-system` via le CLI du skill source.
3. Compléter avec `--domain` / `--stack` si besoin.
4. Implémenter en respectant le DS repo s’il existe.
5. Repasser **CHECKLIST.md** (post) avant livraison.
