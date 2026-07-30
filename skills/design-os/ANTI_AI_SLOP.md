# ANTI_AI_SLOP — DESIGN_OS

Barre : si ça pourrait être la landing d’**n’importe quelle** SaaS AI générique, c’est du slop. À éliminer avant ship.

Companion : [CHECKLIST_ANTI_SLOP.md](CHECKLIST_ANTI_SLOP.md)

---

## Patterns interdits

| Pattern | Pourquoi c’est du slop |
|---------|-------------------------|
| **Cards génériques partout** | Structure paresseuse ; border+shadow+radius sans job d’interaction |
| **Gradients inutiles** | Atmosphère fake ; purple→indigo / orbs flous sans brand |
| **Glassmorphism excessif** | Bruit, contraste faible, mode 2021 recyclé |
| **Sections interminables** | Landing « scroll of death » sans hiérarchie |
| **15 CTAs différents** | Aucune conversion claire ; fatigue décisionnelle |
| **Dashboard vide** | Grilles de placeholders / charts fake sans empty state utile |
| **Illustrations AI génériques** | Robots, cerveaux néon, « people smiling at laptop » stock-AI |
| **Landing texte+texte+texte** | Hero sans ancre visuelle produit ; murs de features |
| **Pill clusters / stat strips** | Décor métrique non sourcé (« 10x faster », « 99.9% ») |
| **Badges flottants sur hero** | Stickers « New » / « AI-powered » détachés du média |
| **Multi-shadow / glow** | Profondeur artificielle, look template |
| **Emoji UI** | Remplace iconographie réelle |
| **Purple-on-white par défaut** | Biais modèle ; pas une direction de marque |
| **Cream + serif + terracotta** | Cluster esthétique AI récurrent |
| **Broadsheet hairlines** | Layout journal faux-premium sans contenu éditorial réel |

---

## Signes de détection automatique (agent)

Si **≥ 2** signes → marquer **SLOP RISK** et corriger avant de continuer.

### Structure

- [ ] Premier viewport = dashboard marketing (stats + logos + 3 cards + 2 CTAs)
- [ ] Plus de **1 CTA primaire** visible above the fold
- [ ] Plus de **3 sections** sans changement de job (toujours « features »)
- [ ] Hero = titre + sous-titre + **pas** d’image produit / contexte réel
- [ ] Cards utilisées là où une liste / table / texte suffirait

### Visuel

- [ ] Gradient ou glow sans rôle (séparation, brand, focus)
- [ ] Glass / blur sur >30 % des surfaces
- [ ] >3 radius différents non tokenisés
- [ ] >3 familles de shadow
- [ ] Illustration sans lien avec le produit réel
- [ ] Palette « AI default » (violet, indigo, cyan neon)

### Contenu

- [ ] Copy interchangeable avec un concurrent (remplacer le nom de marque → indiscernable)
- [ ] Features en tricolon vague (« Fast. Secure. Smart. »)
- [ ] Social proof sans noms / logos réels
- [ ] Empty state = illustration seule, sans action

### Produit

- [ ] Dashboard sans données ni empty state actionnable
- [ ] Paywall avec >1 highlight plan ambigu
- [ ] Settings en cards décoratives au lieu de groupes scannables

---

## Remplacements recommandés

| Slop | Remplacer par |
|------|----------------|
| Card grid features | Une section, un message, preuve visuelle produit |
| Gradient orbs | Image full-bleed / texture brand / fond tokenisé |
| Glass panels | Surfaces plates + bordure token / elevation rare |
| 5 CTAs | 1 primaire + 1 secondaire texte |
| Chart fake | Empty state + CTA « Connect source » / sample réel |
| AI illustration | Screenshot produit, photo contexte, 3D Spline **seulement** si justifié |
| Texte+texte | Brand + 1 headline + 1 phrase + CTA + ancre visuelle |

---

## Règle d’or

> Si retirer bordure, ombre, fond ou radius **n’enlève ni l’interaction ni la compréhension**, ce n’est pas un conteneur utile — c’est du slop.
