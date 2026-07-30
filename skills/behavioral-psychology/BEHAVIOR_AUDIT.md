# Behavior Audit — Protocole

Commande : **Behavior Audit** (ou « audit comportemental », « audit engagement/rétention »).

Livrer un rapport structuré. **Pas de dark patterns** dans les recommandations → [ANTI_DARK_PATTERNS.md](ANTI_DARK_PATTERNS.md).

---

## Étapes

### 1. Cadrer

- Feature / flow / écran audité
- Comportement cible (verbe + contexte + fréquence désirée)
- Utilisateur (nouveau / actif / churn-risk)
- Contrainte éthique du produit (ex. anti-addiction, focus, courier Driveely)

### 2. Cartographier les boucles

Pour chaque étape du flow, noter :

| Élément | Questions |
|---------|-----------|
| **Trigger** | Externe ? Interne ? Honnête ? Timing OK ? |
| **Motivation** | Intrinsèque / extrinsèque ? Autonomie OK ? |
| **Ability / friction** | Combien de taps / charge cognitive ? |
| **Récompense** | Immédiate ? Différée ? Variable ? Honnête ? |
| **Investment** | Données, progrès, identité — ou lock-in abusif ? |
| **Retention hook** | Raison de revenir demain ? |

Frameworks : [frameworks/hooked-loop.md](frameworks/hooked-loop.md) · [habit-loop.md](frameworks/habit-loop.md) · [motivation-map.md](frameworks/motivation-map.md)

### 3. Scorer (dual /100)

Deux scores indépendants, puis note synthétique optionnelle.

#### A. Potentiel d’engagement `/100`

| Critère | Max | Guide |
|---------|-----|-------|
| Clarté du job / CTA | 20 | L’user sait quoi faire en <3 s |
| Friction à l’action | 20 | Moins d’étapes = plus haut (sans sacrifier le consentement) |
| Trigger qualité | 15 | Pertinent, non spam, consent |
| Feedback / reward immédiat | 15 | Feedback honnête et utile |
| Motivation alignée (SDT) | 15 | Autonomie + compétence visibles |
| Delight / craft (sans clutter) | 15 | Presence, pas noise |

**Bandes :** 80–100 fort · 60–79 correct · 40–59 faible · <40 critique

#### B. Potentiel de rétention `/100`

| Critère | Max | Guide |
|---------|-----|-------|
| Raison de revenir (hook) | 20 | Valeur différée claire |
| Progression / identité | 20 | Progrès visible, non fake |
| Habit fit (cue quotidien) | 15 | Ancré dans routine réelle |
| Loss of progress éthique | 15 | Streak soft / recovery > punition toxique |
| Variable reward dosé | 15 | Curiosité sans addiction |
| Churn frictions (positif) | 15 | Easy leave + easy re-entry |

**Bandes :** mêmes seuils que engagement.

#### Note synthétique (optionnelle)

`(Engagement + Rétention) / 2` — indiquer si asymétrie (ex. engagement haut / rétention basse = « one-shot dopamine »).

### 4. Détecter frictions & risques

Lister :

- **Frictions P0/P1/P2** (blocage activation, confusion, dead-ends)
- **Risques dark pattern** (même latents) → score risque 0–5
- **Surcharge dopamine** (trop de stimuli / notifs / confetti)
- **Gaps motivation** (tout extrinsèque, zéro autonomie)

### 5. Proposer améliorations

Pour chaque fix :

1. **Pourquoi** (concept cité : Clear / Eyal / SDT / BE…)
2. **Quoi** (changement concret UI/flow/copy)
3. **Éthique** (pourquoi ce n’est pas manip)
4. **Impact attendu** (engagement vs rétention)
5. **Priorité** P0 / P1 / P2

Max **7** recommandations. Pas de wishlist.

---

## Template de sortie

```markdown
# Behavior Audit — [Feature]

## Cible comportementale
…

## Scores
| Dimension | Score | Bande |
|-----------|------:|-------|
| Engagement | xx/100 | … |
| Rétention | xx/100 | … |
| Synthèse | xx/100 | … |

## Boucle actuelle (résumé)
Trigger → Action → Reward → Investment …

## Frictions
- P0 …
- P1 …

## Risques éthiques
- …

## Recommandations (priorisées)
1. …
2. …

## Ne pas faire
- …
```

---

## Règles d’audit

- Citer auteurs/concepts ; **ne pas inventer d’études**.
- Si donnée manquante → le dire, scorer avec intervalle de confiance (haut/bas).
- Regrind / concurrents = **principes**, pas copie ([research/regrind-analysis.md](research/regrind-analysis.md)).
- Après audit behavior → DESIGN_OS pour UX si l’user demande l’implémentation UI.
