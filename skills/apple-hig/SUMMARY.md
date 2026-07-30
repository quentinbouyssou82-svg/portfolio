# SUMMARY — Apple HIG (condensé agents)

> Sources : [HIG](https://developer.apple.com/design/human-interface-guidelines/) · focus iOS/iPadOS  
> Dernière synthèse : 2026-07 (Layout/Typography/Color mises à jour 2025–2026, Liquid Glass)

## Principes plateforme

- L’UI doit **sembler chez elle** : contrôles système, hiérarchie familière, adaptation (taille, orientation, Dynamic Type, RTL).
- **Contenu d’abord** : backgrounds full-bleed ; barres / tab bars **au-dessus** du contenu (pas sur le même plan).
- **Liquid Glass** (iOS/iPadOS récents) : différencier contrôles et contenu ; scroll edge effect plutôt qu’un fond opaque arbitraire sous les contrôles.
- **Accessibilité** : Dynamic Type, contraste, cibles tactiles, VoiceOver — non optionnel.

## Foundations (rappel)

| Domaine | Règles dures |
|---------|----------------|
| Layout | Safe areas + margins système ; adapter traits (taille, orientation, Dynamic Island) ; aligner ; grouper le lié |
| Typo | Text styles système + Dynamic Type ; pas de tailles hardcodées seules |
| Color | Couleurs sémantiques système ; light/dark + increased contrast ; contraste texte/fond |

## Patterns couverts par ce skill

| Pattern | Fichier | Idée clé |
|---------|---------|----------|
| Navigation | `navigation.md` | Tab bar = sections top-level ; pas d’actions dans la tab bar |
| Spacing | `spacing.md` | Marges système, 44×44 pt cibles, inset boutons |
| Typography | `typography.md` | SF + text styles ; tester AX sizes |
| Onboarding | `onboarding.md` | Rapide, optionnel, interactif ; permissions contextualisées |
| Paywalls | `paywalls.md` | Prix total clair, restore, ToS/Privacy, cancel facile (HIG IAP + App Store) |
| Settings | `settings.md` | Defaults sensés ; options fréquentes dans la tâche |
| Notifications | `notifications.md` | Permission au moment de valeur ; contenu utile |

## Technologies / monétisation

- **IAP & abonnements** : guidance UX dans [HIG In-App Purchase](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase) + [Subscriptions](https://developer.apple.com/app-store/subscriptions/) + [Review 3.1](https://developer.apple.com/app-store/review/guidelines/).
- Le HIG « Patterns » général est mince sur les paywalls : s’appuyer sur ces trois sources (le skill `paywalls.md` le documente).

## Hors scope (sauf note critique)

- macOS / watchOS / visionOS / tvOS — seulement mentions croisées si nécessaire à iOS.
- Implémentation StoreKit détaillée → docs StoreKit, pas ce skill.

## Do / Don’t globaux

**Do**
- Composants et conventions système (SwiftUI / UIKit)
- Adapter layouts (SwiftUI / Auto Layout + safe areas)
- Progressive disclosure ; essential info d’abord

**Don’t**
- Recréer des contrôles système (badges custom, faux alerts)
- Crowder l’info essentielle
- Forcer rotation / tutoriels système
- Dark patterns IAP (prix trompeur, cancel caché, faux pretenses) — Review Guidelines
