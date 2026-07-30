# CHECKLIST_ANTI_SLOP

Cocher **avant ship** de toute surface UI. Tout item échoué = bloquant P0/P1 selon [ANTI_AI_SLOP.md](ANTI_AI_SLOP.md).

```
Surface : _______________
Date    : _______________
Agent   : DESIGN_OS anti-slop
```

## Viewport / composition

- [ ] Un seul job clair dans le premier viewport
- [ ] Brand / produit identifiable sans la nav
- [ ] Un headline + une phrase support max (pas un mur)
- [ ] Un groupe CTA (1 primaire, ≤1 secondaire)
- [ ] Ancre visuelle réelle (produit / contexte) — pas orbes abstraites seules
- [ ] Pas de badges / stickers flottants sur le hero
- [ ] Pas de stats / schedule / promo cluster above the fold (sauf brief explicite)

## Cards & conteneurs

- [ ] Pas de cards dans le hero
- [ ] Cards seulement si conteneur d’**interaction**
- [ ] Retirer border/shadow/radius n’améliore pas → déjà retiré
- [ ] Pas de grille de 6+ feature cards identiques

## Couleur & effets

- [ ] Pas de purple-indigo gradient par défaut
- [ ] Pas de cream+#terracotta+#serif cluster par défaut
- [ ] Gradients uniquement s’ils portent brand / hiérarchie
- [ ] Glassmorphism absent ou ≤ surface accentuelle justifiée
- [ ] Glow / multi-shadow absents ou token rare
- [ ] Contraste texte / UI suffisant

## Contenu

- [ ] Copy spécifique à la marque (test « remplacer le nom »)
- [ ] Pas de 15 CTAs / liens d’action concurrents
- [ ] Pas de tricolons vagues non prouvés
- [ ] Pas d’illustrations AI génériques
- [ ] Landing ≠ texte+texte+texte sans média

## Product UI

- [ ] Dashboard : données réelles **ou** empty state actionnable
- [ ] Empty states : message + action (pas mascotte seule)
- [ ] Paywall : offre claire, 1 highlight, friction basse
- [ ] Settings : groupes scannables, pas cards décoratives

## Motion & a11y

- [ ] ≤ 2–3 motions intentionnelles (marketing)
- [ ] `prefers-reduced-motion` respecté
- [ ] Focus visible, labels, sémantique OK
- [ ] Mobile : targets et contenu prioritaire OK

## Signature finale

- [ ] Aucun signe « ≥2 » de détection auto dans ANTI_AI_SLOP
- [ ] Landings : checklist Vercel Design aussi passée
- [ ] DS repo respecté (tokens / composants)

**Verdict :** PASS / FAIL  
**Notes :**
