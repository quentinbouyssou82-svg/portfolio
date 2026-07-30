# Spacing & layout — HIG iOS/iPadOS

> Sources : [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) · [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) · [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

## Règles dures

- Respecter **safe areas** (Dynamic Island, home indicator, barres système).
- Utiliser **margins / layout guides** système — pas coller le contenu aux bords hardware.
- **Étendre** backgrounds et contenu scrollable jusqu’aux bords ; inset les *contrôles*.
- **Éviter les boutons full-width edge-to-edge** : inset selon margins ; harmoniser avec courbure écran / safe areas.
- Adapter : tailles d’écran, orientation, Dynamic Type, Display Zoom, fenêtres iPad, RTL.

## Cibles tactiles (a11y)

| Élément | Guidance Apple |
|---------|----------------|
| Contrôle par défaut | **44×44 pt** |
| Minimum | **28×28 pt** (éviter si possible) |
| Padding recommandé | ~**12 pt** autour d’éléments avec bezel ; ~**24 pt** sans bezel |

Espacer les contrôles pour qu’ils restent distincts et tappable.

## Hierarchy & grouping

- Info essentielle : **assez d’espace**, pas noyée.
- Grouper le lié (espace négatif, shapes, couleurs, materials, separators).
- Différencier **contrôles vs contenu** (Liquid Glass / materials ; scroll edge effect).
- Aligner pour scannabilité ; indentation pour hiérarchie.

## iOS specifics

- Portrait + landscape si pertinent ; landscape-only : OK gauche **et** droite, sans message « tournez l’appareil ».
- Status bar : la garder sauf immersion (jeu, média) où la cacher apporte de la valeur.
- Jeux : full-bleed OK en respectant coin radius / Dynamic Island.

## iPadOS

- Fenêtres redimensionnables → tester min → max et tailles système.
- Retarder le layout compact ; cacher colonnes tertiaires (inspectors) en premier.

## Do / Don’t

**Do**
- `safeAreaInsets` / `SafeAreaRegions` / padding système SwiftUI
- Preview sur petit + grand device, Dynamic Type max, RTL
- Scale artwork sans déformer l’aspect ratio

**Don’t**
- Placer contenu critique sous Dynamic Island / home indicator
- Crowder contrôles proches non liés
- Hardcoder des frames qui cassent avec Dynamic Type
