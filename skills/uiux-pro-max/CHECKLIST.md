# UI/UX Pro Max — Checklist design

Utiliser **avant** de démarrer et **après** avant livraison.  
Sur Driveely / portfolio : cocher aussi la conformité au **design system du repo**.

---

## A. Avant création (plan)

### Contexte

- [ ] Type de produit / audience / ton définis
- [ ] Stack du projet identifiée (`nextjs`, `shadcn`, `swiftui`, etc.)
- [ ] Design system repo existant ? → **le lire d’abord** (tokens, composants)
- [ ] Si pas de DS : `--design-system` lancé avec keywords multi-dimensionnels
- [ ] Anti-patterns du design system notés (à éviter explicitement)

### Décisions design

- [ ] Style choisi et cohérent avec le produit (pas un mix aléatoire)
- [ ] Palette sémantique (primary, surface, destructive, muted…) — ou tokens repo
- [ ] Pairing typo heading/body (ou tokens typo repo)
- [ ] Pattern landing / layout (hero, bento, dashboard…) si applicable
- [ ] Une CTA primaire par écran prévue
- [ ] Famille d’icônes unique (SVG) — zéro emoji structurel
- [ ] Light + dark prévus ensemble (si le produit a un thème)

### UX / a11y anticipés

- [ ] Contrastes cibles WCAG AA (≥4.5:1 body)
- [ ] Cibles tactiles ≥44pt / 48dp
- [ ] Labels formulaire visibles
- [ ] États : default / hover / press / focus / disabled / loading / error / empty
- [ ] Reduced-motion + Dynamic Type pris en compte
- [ ] Safe areas (mobile) / pas de zoom désactivé (web)

---

## B. Pendant l’implémentation

- [ ] Spacing 4/8pt ; pas de valeurs aléatoires
- [ ] Tokens / CSS variables — pas de hex ad hoc dans les composants
- [ ] Animations transform/opacity 150–300ms
- [ ] Images : dimensions / aspect-ratio réservés ; lazy hors hero
- [ ] Listes longues virtualisées si ≥50
- [ ] Navigation : back prévisible ; deep links si écrans clés
- [ ] Erreurs près du champ + chemin de recovery
- [ ] Guidelines `--stack` du framework respectées si consultées

---

## C. Après création — livraison

Scope skill « Pre-Delivery » (surtout App ; adapter au web).

### Qualité visuelle

- [ ] Aucun emoji comme icône
- [ ] Une famille / style d’icônes cohérent
- [ ] Assets brand officiels (proportions, clear space)
- [ ] Press states sans jitter / shift de layout
- [ ] Tokens sémantiques cohérents (pas de couleurs one-off)

### Interaction

- [ ] Feedback press clair sur tout élément tappable
- [ ] Touch targets ≥44×44pt (iOS) / ≥48×48dp (Android) — ou équivalent web confortable
- [ ] Micro-interactions 150–300ms
- [ ] Disabled clairement non interactif
- [ ] Focus order SR = ordre visuel ; labels descriptifs
- [ ] Pas de conflits de gestes imbriqués

### Light / Dark

- [ ] Texte primaire ≥4.5:1 dans les deux thèmes
- [ ] Texte secondaire ≥3:1
- [ ] Borders / dividers / états visibles dans les deux
- [ ] Scrim modal suffisant (~40–60% noir)
- [ ] Les deux thèmes **testés**, pas déduits

### Layout

- [ ] Safe areas respectées (headers, tabs, CTA bottom)
- [ ] Contenu scroll non masqué par barres fixes
- [ ] Testé ~375px, grand téléphone, tablette (portrait + landscape si pertinent)
- [ ] Gutters adaptés à la largeur
- [ ] Rythme 4/8dp maintenu
- [ ] Texte long lisible (pas edge-to-edge sur large écran)

### Accessibilité

- [ ] Labels a11y sur images/icônes significatives
- [ ] Forms : labels, hints, erreurs claires
- [ ] Info non portée par la couleur seule
- [ ] Reduced motion + text size large sans casse layout
- [ ] Roles / states (selected, disabled, expanded) annoncés

### Validation Pro Max (optionnel mais recommandé)

- [ ] Pass UX : `--domain ux "animation accessibility z-index loading"`
- [ ] Quick Reference skill §§1–3 (CRITICAL + HIGH) relues
- [ ] Reduced-motion + Dynamic Type max vérifiés
- [ ] Dark mode contrast re-vérifié indépendamment

---

## D. Arbitrage repo (Driveely / frontend-ai-studio)

- [ ] Composants / tokens existants réutilisés (pas de parallèle « Pro Max only »)
- [ ] Esthétique minimale SaaS du studio respectée **si** c’est le brief du projet
- [ ] Pro Max n’a pas imposé un style contradictoire (glass / neo-brutal / etc.) sans demande explicite
- [ ] Checklist produit / docs Driveely consultée si applicable

---

## Décision go / no-go

**Livrer seulement si** A (contexte + décisions) + C (visuel, interaction, thèmes, layout, a11y) sont verts.  
Les items B non faits = dette à corriger avant merge UI.
