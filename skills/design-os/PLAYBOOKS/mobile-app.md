# Playbook — Mobile app (web / RN / cross)

Barre : patterns **Mobbin** + produit réel ; thumb-first.

**Cross-link behavior :** si app **productivity / focus / habit / gamification / screen-time** → **Étape 0** `behavioral-psychology` avant UX. Voir aussi [productivity.md](productivity.md).

---

## Étapes

### 0. Behavior (si applicable)
- Charger `/Users/quentinbouyssou/.cursor/skills/behavioral-psychology/`
- Boucle engagement / rétention définie avant pixels

### 1. Besoin produit
- Plateforme (RN / PWA / responsive web)
- Tab IA / navigation primaire
- Offline / empty / paywall hooks

### 2. Références
1. **Mobbin** — **priorité #1**
2. **Refero** — si aussi desktop companion
3. **Raylight** — brand mobile
4. Gold : top apps catégorie (**principes**, pas clone)

### 3. Style
- Targets ≥ 44pt ; bottom nav claire
- Densité adaptée mobile (pas desktop shrink)
- Ancre style : Notion calm / Linear tool / Apple-like

### 4. Composants
1. **21st** — blocs adaptés mobile
2. **shadcn** — Sheet, Drawer, Drawer-like patterns web
3. Éviter Spline lourd sur mobile

### 5. Audit
- Anti-slop mobile
- Pro Max mobile guidelines
- Si iOS wrapper → croiser playbook ios-native
- Anti dark patterns si behavior app

### 6. Optimize
- Safe areas, clavier, perf images, gestures

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| Actions principales thumb zone | FAB + 4 CTAs concurrents |
| Empty utiles | Dashboard vide miniaturisé |
| Nav prévisible | Hamburger pour 3 destinations |
| Behavior → UX si focus/habit | Copier un concurrent pixel-perfect |
