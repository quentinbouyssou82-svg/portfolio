# Regrind — analyse (principes transferables)

**But :** comprendre pourquoi les apps focus/habit type Regrind **fonctionnent**, extraire des principes, **ne pas copier** le produit ni sa marque.

Contexte interne possible : référence produit sous `Developer/ios-app/Docs/PRODUCT_REFERENCE.md` — utiliser seulement pour **exactitude conceptuelle**, pas comme brief de clone.

Cadre éthique : [ANTI_DARK_PATTERNS.md](../ANTI_DARK_PATTERNS.md).

---

## Modèle mental (général)

Métaphore forte : **attention = monnaie**. L’utilisateur *gagne* du temps d’écran via focus, puis *dépense* pour débloquer.

Boucle typique :

1. Bloquer distractions (commitment device)
2. Session focus (effort)
3. Crédits / reward (delayed gratification style Lembke)
4. Withdraw / unlock (choix conscient)
5. Score = discipline (garder > dépenser) + streak / social

---

## Forces (pourquoi ça marche)

| Force | Mécanisme | Auteurs / concepts |
|-------|-----------|-------------------|
| Métaphore claire | Endowment + identité (« wallet / card ») | BE endowment ; Clear identity |
| Effort → reward | Dopamine après travail, pas avant | Lembke delayed reward ; Hooked investment |
| Loss aversion honnête* | Dépenser ↓ score ; strikes coûtent | Prospect theory (*si règles transparentes) |
| Commitment device | Apps bloquées via OS | Commitment ; Fogg ability constraint |
| Scarcity réelle (free tier) | Limite N apps | Scarcity éthique si vraie |
| Progression multi-couches | Score %, streak, rankings | Competence SDT ; gamification |
| Shock → hope framing | Stats scroll → temps « récupérable » | Framing + anchoring (si calcul transparent) |
| Split ritual / daily UX | Onboarding sombre vs usage clair | Peak-end ; mode contexte |

\*« Honnête » = règles visibles, pas punition opaque.

---

## Faiblesses / risques

| Risque | Pourquoi | Mitigation éthique |
|--------|----------|-------------------|
| Over-gamification | Score/leaderboard écrase l’intrinsèque | Mode soft, opt-out social |
| Shame streaks | Rate un jour → abandon | Never miss twice ; freeze |
| Paywall après pledge | Commitment trop proche de l’achat | Séparer pledge / pricing ; clarté prix |
| Scarcity + premium gates | Peut glisser vers frustration paywall | Valeur free réelle ; pas fake urgency |
| Metaphor lock-in | Wallet complexe pour certains users | Onboarding progressive disclosure |
| Social rankings | Comparaison toxique | Amis only ; hide rank |
| Dependency on OS APIs | Screen Time / permissions friction | Timing permission (Clear easy) |

---

## Limites (ne pas sur-généraliser)

- Fonctionne mieux si l’user **veut** déjà moins scroller (motivation préexistante)
- Moins adapté si le problème est burnout / clinique (hors scope app lifestyle)
- Métaphore fintech ≠ universelle (autres cultures / âges)
- Leaderboards mondiaux souvent vanity ; la rétention vient du **loop quotidien**
- Copier UI Regrind ≠ reproduire le fit marché

---

## Opportunités d’amélioration (génériques)

1. **Autonomy+** : intensité / règles éditables (SDT)
2. **Recovery UX** : après échec, chemin clair sans humiliation (Clear)
3. **Intrinsic layer** : journal « pourquoi je focus » au-delà des points
4. **Dopamine budget** : célébrations rares ; stats calm
5. **Transparent math** : formules score / crédits explicables
6. **Export / pause** : anti roach-motel
7. **Habit stacking** : ancrer session après routine existante
8. **Variable reward dosé** : découverte de tips / scénarios ≠ casino

---

## Principes transferables (checklist)

- [ ] Une **métaphore** qui explique la boucle en une phrase
- [ ] Reward **après** effort (pas doomscroll reward)
- [ ] Commitment device OS / environnement
- [ ] Loss aversion sur ressource **choisie**, règles claires
- [ ] Progression identité (carte, nom, maîtrise) sans fake
- [ ] Social **opt-in**
- [ ] Paywall : valeur claire, pas piège
- [ ] Ne **jamais** cloner branding / flows concurrent pixel-perfect

---

## Usage agent

Quand l’user cite Regrind / « earn screen time » :

1. Extraire 2–4 principes ci-dessus adaptés au brief
2. Adapter à la marque / JTBD du projet
3. Behavior Audit si feature engagement-critique
4. DESIGN_OS ensuite pour UX — **après** ce skill
