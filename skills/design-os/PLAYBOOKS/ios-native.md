# Playbook — iOS native

Barre : **Apple HIG** + top App Store. Pas d’esthétique « web cards » collée dans SwiftUI.

Skill lié (si présent) : `/Users/quentinbouyssou/portfolio/skills/apple-hig/`

**Cross-link behavior :** apps **focus / screen-time / habit / productivity / gamification** → charger `behavioral-psychology` (**Étape 0**) avant UX. Voir [productivity.md](productivity.md).

---

## Étapes

### 0. Behavior (si applicable)
- `/Users/quentinbouyssou/.cursor/skills/behavioral-psychology/SKILL.md`
- Pas de clone concurrent ; principes transferables seulement

### 1. Besoin produit
- Écrans, navigation (Tab / Stack / Split)
- System features (Share, Widgets, IAP)
- Accessibilité : Dynamic Type, VoiceOver, Reduce Motion

### 2. Références
1. **Mobbin** — iOS flows catégorie
2. **Refero** — si companion web
3. Apps Apple + leaders App Store
4. Raylight seulement pour brand assets hors chrome système

### 3. Style
- SF Pro / tokens projet ; system materials avec parcimonie
- Sheets, nav bars, list styles natifs
- Ancre **Apple** (+ Linear si tool density)

### 4. Composants
1. **SwiftUI système** d’abord (`List`, `Form`, `NavigationStack`, `Toolbar`)
2. **21st / shadcn** — **non** pour chrome iOS ; OK pour inspiration visuelle web à traduire
3. Custom views alignées HIG spacing

### 5. Audit
- Apple HIG checklist
- Anti-slop (glass excessif, gradients marketing dans settings)
- Paywall : playbook paywall + StoreKit UX
- Anti dark patterns si behavior app

### 6. Optimize
- Dynamic Type, hit targets, dark mode, Reduce Transparency/Motion

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| List/Form natifs | Cards web dans Settings |
| Toolbar system | Nav custom qui casse swipe-back |
| SF Symbols | Emoji UI |
| Behavior gate si focus/habit | Copier UI Regrind / concurrent |
