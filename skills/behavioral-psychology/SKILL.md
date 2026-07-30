---
name: behavioral-psychology
description: >-
  Expert behavioral psychology for digital products (engagement, retention, habits, motivation).
  NOT manipulation. Use BEFORE UX for productivity, focus, gamification, habit, education, anti-addiction,
  SaaS, iOS apps, Driveely. Triggers: /behavioral-psychology, habit, streak, retention, onboarding psychology,
  paywall psychology, gamification, focus app, screen time, Behavior Audit, Hooked, Atomic Habits.
---

# behavioral-psychology

Skill permanent de psychologie comportementale pour produits digitaux. **Améliorer engagement, rétention, motivation, habitudes, réduire le dropout — jamais manipuler abusivement.**

**Version :** [VERSION.md](VERSION.md) (`1.0.0`)

**Invocation :** `/behavioral-psychology` · `/use behavioral-psychology` · ou quand les triggers de la description matchent.

---

## Ordre de lecture (agents)

1. **Ce fichier** — cadre éthique + workflow
2. [ANTI_DARK_PATTERNS.md](ANTI_DARK_PATTERNS.md) — garde-fous (toujours)
3. Commande **Behavior Audit** → [BEHAVIOR_AUDIT.md](BEHAVIOR_AUDIT.md)
4. Framework pertinent dans [frameworks/](frameworks/)
5. Playbook surface dans [playbooks/](playbooks/)
6. Recherche ciblée dans [research/](research/) (ne pas tout charger)
7. Exemples → [examples/](examples/)

Avec DESIGN_OS : **charger ce skill AVANT toute proposition UX** pour apps productivity / focus / gamification / habit / behavior / screen-time / anti-addiction.

---

## Cadre éthique (non négociable)

| Objectif légitime | Interdit |
|-------------------|----------|
| Clarifier la valeur, réduire friction | Mensonge UX, fake urgency |
| Aider à former une habitude choisie | Addiction forcée, FOMO toxique |
| Rétention via progrès tangible | Pièges d’abonnement, hard-to-cancel |
| Motivation intrinsèque + feedback honnête | Compteurs fake, notifs trompeuses |
| Autonomy (SDT) | Dark patterns listés dans ANTI_DARK_PATTERNS |

Si un levier est efficace **et** trompeur → **rejeter**. Préférer levier honnête plus faible.

→ Détail : [ANTI_DARK_PATTERNS.md](ANTI_DARK_PATTERNS.md)

---

## Workflow agent (avant UX)

```
Brief produit (engagement / habit / focus / rétention…)
  → Lire SKILL.md + ANTI_DARK_PATTERNS.md
  → Mapper le problème : trigger ? friction ? motivation ? reward ?
  → Choisir 1–2 frameworks (Hooked / Habit Loop / Motivation / Engagement)
  → Ouvrir playbook + research ciblés
  → Si « Behavior Audit » : BEHAVIOR_AUDIT.md (scores + frictions + fixes)
  → Puis seulement DESIGN_OS / UX / UI
```

### Checklist rapide

- [ ] Comportement cible unique nommé (verbe + contexte)
- [ ] Trigger éthique (externe puis interne)
- [ ] Action à friction minimale (Clear / Fogg)
- [ ] Récompense variable **ou** progressive — honnête
- [ ] Investment / identité (pas lock-in abusif)
- [ ] Autonomie + compétence (SDT) préservées
- [ ] Aucun dark pattern (checklist anti)

---

## Synthèse des sources (citer, ne pas inventer)

| Source | Auteur / cadre | Fichier | Idée clé |
|--------|----------------|---------|----------|
| **Hooked** | Nir Eyal — Trigger → Action → Variable Reward → Investment | [research/hooked.md](research/hooked.md) | Boucle d’habitude produit |
| **Atomic Habits** | James Clear — Cue → Craving → Response → Reward | [research/atomic-habits.md](research/atomic-habits.md) | 1% , identity, 4 lois |
| **Dopamine Nation** | Anna Lembke (thèmes) — surcharge, délai, impulse | [research/dopamine-nation.md](research/dopamine-nation.md) | Retarder reward, doser stimuli |
| **Behavioral economics** | Kahneman/Tversky + classiques | [research/behavioral-economics.md](research/behavioral-economics.md) | Loss aversion, endowment, etc. |
| **Motivation (SDT-ish)** | Deci & Ryan + progression | [research/motivation-theory.md](research/motivation-theory.md) | Autonomie, compétence, relatedness |
| **Gamification** | Patterns éthiques | [research/gamification.md](research/gamification.md) | Points/badges ≠ motivation |
| **Regrind (analyse)** | Principes transferables | [research/regrind-analysis.md](research/regrind-analysis.md) | Extraire, **ne pas copier** |

Frameworks opérationnels : [frameworks/hooked-loop.md](frameworks/hooked-loop.md) · [habit-loop.md](frameworks/habit-loop.md) · [motivation-map.md](frameworks/motivation-map.md) · [engagement-retention.md](frameworks/engagement-retention.md)

---

## Playbooks

| Surface | Fichier |
|---------|---------|
| Habit building | [playbooks/habit-building.md](playbooks/habit-building.md) |
| Onboarding psy | [playbooks/onboarding.md](playbooks/onboarding.md) |
| Paywall psy | [playbooks/paywall.md](playbooks/paywall.md) |
| Retention | [playbooks/retention.md](playbooks/retention.md) |
| Streaks | [playbooks/streaks.md](playbooks/streaks.md) |
| Gamification | [playbooks/gamification.md](playbooks/gamification.md) |
| Focus app | [playbooks/focus-app.md](playbooks/focus-app.md) |
| Screen time | [playbooks/screen-time-app.md](playbooks/screen-time-app.md) |
| Productivity | [playbooks/productivity-app.md](playbooks/productivity-app.md) |

---

## Commande « Behavior Audit »

Si l’utilisateur dit **Behavior Audit** (ou équivalent) :

1. Lire [BEHAVIOR_AUDIT.md](BEHAVIOR_AUDIT.md)
2. Analyser la feature / flow
3. Scorer **engagement** + **rétention** (dual /100 ou grille)
4. Détecter frictions + dark-pattern risks
5. Proposer améliorations priorisées (éthiques)

---

## Intégration DESIGN_OS

- Canon : `/Users/quentinbouyssou/portfolio/skills/design-os/`
- Runtime : `/Users/quentinbouyssou/.cursor/skills/design-os/`

Règle : apps **productivity / focus / gamification / habit / behavior / screen-time** → `behavioral-psychology` **avant** proposition UX DESIGN_OS.

---

## Miroirs

- Portfolio : `/Users/quentinbouyssou/portfolio/skills/behavioral-psychology/`
- Cursor : `/Users/quentinbouyssou/.cursor/skills/behavioral-psychology/`

Contenu **identique** des deux côtés.
