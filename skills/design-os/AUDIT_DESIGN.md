# AUDIT_DESIGN — Protocole commande

Activer quand l’utilisateur dit **« Audit Design »**, « audit UI », « score cette interface », ou équivalent.

Objectif : diagnostic de directeur artistique, pas un lint cosmétique.

---

## Protocole (ordre strict)

### 1. Scanner l’UI

- Identifier surface(s) : landing, dashboard, paywall, auth, settings, mobile, iOS…
- Lire le code / captures / preview disponible
- Noter DS repo (tokens, composants) s’il existe
- Charger [ANTI_AI_SLOP.md](ANTI_AI_SLOP.md) + playbook pertinent

### 2. Lister les issues

Pour chaque issue :

| Champ | Contenu |
|-------|---------|
| ID | `A1`, `A2`… |
| Zone | Hero / nav / pricing / table… |
| Problème | Fait observable |
| Critère | Hiérarchie / contraste / slop / a11y / HIG / Vercel… |
| Sévérité | P0 bloquant · P1 fort · P2 polish |
| Fix | Action concrète |

### 3. Scorer /100

Attribuer des points (total 100), puis **soustraire** selon sévérité.

| Critère | Max |
|---------|-----|
| Hiérarchie & composition | 15 |
| Typographie | 10 |
| Couleur & contraste | 10 |
| Spacing & layout | 10 |
| Composants & cohérence DS | 10 |
| Contenu & CTA | 10 |
| Anti AI-slop | 15 |
| Responsive / mobile | 8 |
| Motion | 4 |
| Accessibilité | 8 |

**Pénalités suggérées :** P0 = −5 à −12 · P1 = −2 à −5 · P2 = −1 à −2 (par issue, plafonner pour ne pas double-compter le même défaut).

**Bandes :**

| Score | Lecture |
|-------|---------|
| 90–100 | Top App Store / YC bar |
| 75–89 | Solide, gaps ciblés |
| 60–74 | Moyen — refonte partielle |
| <60 | Sous barre — reprendre workflow DESIGN_OS étapes 2–6 |

### 4. Comparer aux benchmarks

Comparer explicitement à **Linear / Stripe / Raycast / Notion** (et Apple si iOS) :

| Benchmark | Ce qu’on mesure |
|-----------|-----------------|
| **Linear** | Densité, focus outil, contraste, absence de décor |
| **Stripe** | Clarté marketing, trust, typo, hero utile |
| **Raycast** | Vitesse perçue, command/action primacy, accents |
| **Notion** | Calm UI, contenu d’abord, empty utiles |
| **Apple** (si native) | HIG, navigation, Dynamic Type, restraint |

Pour chaque benchmark : **1 phrase** « plus proche de X sur Y ; loin de Z sur W ».

Choisir **un** benchmark primaire aligné au style étape 3 du projet — ne pas tout mélanger.

### 5. Correctifs priorisés

Livrer un plan :

1. **P0** (ship blockers) — liste ordonnée
2. **P1** — semaine
3. **P2** — polish
4. Outils à rappeler : 21st pour rebuild composant, Vercel checklist, Pro Max, etc.

---

## Template de rapport (copier)

```markdown
# Audit Design — [Nom surface]

**Score : __ / 100** · Bande : …
**Benchmark primaire :** Linear | Stripe | Raycast | Notion | Apple
**DS repo :** respecté / divergences : …

## Synthèse (3 lignes)
…

## Comparaison benchmarks
- Linear : …
- Stripe : …
- Raycast : …
- Notion : …

## Issues
| ID | Zone | Problème | Sévérité | Fix |
|----|------|----------|----------|-----|
| A1 | … | … | P0 | … |

## Plan d’action
### P0
1. …
### P1
1. …
### P2
1. …

## Prochaines commandes suggérées
- Appliquer playbook …
- Re-run Audit Design après fixes
```

---

## Outils d’appui pendant l’audit

| Surface | Outils |
|---------|--------|
| Landing | Vercel Design + Frontend Design + anti-slop |
| SaaS product | Pro Max + Refero refs + Linear benchmark |
| iOS | Apple HIG + Mobbin |
| Composants | Magic MCP / 21st-ui-review |

Ne pas remplacer ce protocole par un seul outil.
