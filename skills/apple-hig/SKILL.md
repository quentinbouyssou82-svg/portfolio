---
name: apple-hig
description: >-
  Condensed Apple Human Interface Guidelines for iOS/iPadOS native UI.
  Use when: iOS, SwiftUI, UIKit, Apple HIG, Human Interface Guidelines,
  onboarding, paywall, subscription, In-App Purchase, settings, notifications,
  navigation, tab bar, spacing, layout, typography, Dynamic Type, Liquid Glass,
  or any UI that should feel native Apple. Consult before designing or reviewing
  iOS app screens.
---

# Apple HIG — skill agent (iOS / iPadOS)

**Consulter ce skill avant toute UI iOS/SwiftUI qui doit paraître native Apple.**

Sources officielles (autorité) :
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [In-App Purchase (HIG)](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase)
- [Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

Ne **pas** inventer de règles Apple. Si une règle n’est pas documentée ici ou dans les URLs ci-dessus, vérifier la page HIG / Review Guidelines avant d’affirmer.

## Quand activer

- Écrans / composants iOS, iPadOS, SwiftUI, UIKit
- Mentions HIG, onboarding, paywall, abonnement, IAP, settings, notifications
- Navigation (tab bar, sidebar, sheets), spacing, typography, Dynamic Type
- Review / audit UI « native Apple »

## Workflow

1. Lire [SUMMARY.md](SUMMARY.md) pour le cadre global.
2. Ouvrir le guide ciblé selon la tâche (table ci-dessous).
3. Avant ship / review : cocher [CHECKLIST.md](CHECKLIST.md) (items applicables).
4. En cas de doute : renvoyer vers l’URL Apple du fichier concerné — pas d’invention.

## Fichiers

| Fichier | Quand l’ouvrir |
|---------|----------------|
| [SUMMARY.md](SUMMARY.md) | Vue d’ensemble condensée |
| [navigation.md](navigation.md) | Tab bar, sidebar, hiérarchie, sheets |
| [spacing.md](spacing.md) | Layout, margins, safe areas, cibles |
| [typography.md](typography.md) | Text styles, Dynamic Type, SF |
| [onboarding.md](onboarding.md) | Premier lancement, permissions, splash |
| [paywalls.md](paywalls.md) | IAP, abonnements, clarté prix, restore |
| [settings.md](settings.md) | Réglages app vs Settings système |
| [notifications.md](notifications.md) | Permission, contenu, badges |
| [CHECKLIST.md](CHECKLIST.md) | Audit rapide pré-ship |
| [README.md](README.md) | Index |

## Priorité

1. **Design system / patterns du repo** — d’abord.
2. **Ce skill (HIG Apple)** — native feel, a11y plateforme, conformité IAP.
3. Autres skills UI (frontend-ai-studio, etc.) : ne pas contredire HIG sur navigation système, Dynamic Type, IAP/subscriptions.

## Scope

- **Primaire** : iOS / iPadOS.
- Mac / watch / vision : seulement si critique (noté dans les guides).
- Paywalls : HIG In-App Purchase + page Subscriptions App Store + Review Guidelines 3.1 — le dire explicitement (pas inventer de « dark pattern HIG » hors sources).
