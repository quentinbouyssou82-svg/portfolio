# Playbook — Dashboard SaaS

Barre : densité **Linear**, calm **Notion** pour empty, zéro décor.

---

## Étapes

### 1. Besoin produit
- Job principal de l’écran (monitor / decide / act)
- Entités clés + actions fréquentes
- États : loading, empty, error, populated

### 2. Références
1. **Mobbin** — dashboards mobile / responsive
2. **Refero** — SaaS desktop dense (sidebar, tables)
3. **Raylight** — seulement si brand expression nécessaire
4. Gold : **Linear** (+ Raycast si command-heavy)

### 3. Style
- Dense, contraste net, peu d’ornement
- Navigation claire (sidebar / top) ; contenu = roi
- Pas de glass ; cards seulement pour widgets interactifs

### 4. Composants
1. **21st** — command palette, data-heavy widgets, charts shells
2. **shadcn** — Table, Dropdown, Dialog, Sheet, Tabs, Toast
3. Charts : données réelles ou empty — **jamais** fake vanity charts en prod

### 5. Audit
- Anti-slop (dashboard vide = FAIL)
- UI/UX Pro Max (UX density, a11y)
- Frontend Design si polish branding
- Comparer Linear sur densité

### 6. Optimize
- Scanabilité, alignements, sticky headers utiles, responsive collapse, keyboard

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| Empty actionnable | Grille de placeholders |
| 1 action primaire par vue | 8 boutons équivalents |
| Table/list native | Cards pour chaque row |
