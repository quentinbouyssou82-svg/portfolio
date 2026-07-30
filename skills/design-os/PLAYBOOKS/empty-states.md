# Playbook — Empty states

Barre : **Notion** calm + **Linear** action — jamais illustration AI seule.

---

## Étapes

### 1. Besoin produit
- Pourquoi c’est vide (jamais utilisé / filtré / erreur / permissions)
- Action de sortie (créer, connecter, clear filters, upgrade)

### 2. Références
1. **Mobbin** — empty states product
2. **Refero** — empty desktop SaaS
3. Gold : Notion, Linear, Stripe Dashboard

### 3. Style
- Structure : **titre** + **1 phrase** + **CTA primaire** (+ secondaire texte)
- Visuel optionnel : screenshot produit / icône système — pas mascotte AI
- Même densité que le reste de l’app

### 4. Composants
1. **21st** — empty state blocks si adaptables
2. **shadcn** — Button, Alert
3. iOS : `ContentUnavailableView` patterns

### 5. Audit
- Anti-slop (illustration générique = FAIL)
- a11y focus sur CTA
- Cohérence copy

### 6. Optimize
- Variantes : first-run vs filtered-zero vs error
- Ne pas recycler le même empty partout

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| CTA clair | « Nothing here » sans action |
| Expliquer le pourquoi | Blâmer l’utilisateur |
| Visuel produit | Robot / cerveau néon |
