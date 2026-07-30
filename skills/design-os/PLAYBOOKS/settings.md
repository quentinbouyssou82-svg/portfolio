# Playbook — Settings

Barre : scannabilité **iOS Settings** / **Notion** — groupes, pas cards décoratives.

---

## Étapes

### 1. Besoin produit
- Inventaire settings (compte, prefs, billing, danger zone)
- Fréquence d’usage → ordre
- Recherche si > ~10 items

### 2. Références
1. **Mobbin** — settings mobile
2. **Refero** — settings desktop SaaS
3. Gold : Apple Settings, Notion, Linear, Raycast prefs

### 3. Style
- Groupes labellisés ; rows simples
- Destructive actions isolées (logout / delete)
- Pas de glass ; pas de feature cards

### 4. Composants
1. **shadcn** — souvent idéal (Switch, Select, Separator, Sheet)
2. **21st** — seulement shells settings complexes
3. iOS : `Form` / `List` inset grouped

### 5. Audit
- Anti-slop (settings en bento cards = FAIL)
- a11y switches labels
- HIG si native
- Pro Max information architecture

### 6. Optimize
- Densité, deep links, unsaved changes, confirmation destructive

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| Groupes + chevrons | Une card par toggle |
| Labels clairs | Jargon interne |
| Danger zone séparée | Delete Account à côté de Theme |
