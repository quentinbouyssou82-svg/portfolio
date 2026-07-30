# Navigation — HIG iOS/iPadOS

> Sources : [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) · [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars) · [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) · [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)

## Règles dures

- **Tab bar** = navigation entre **sections top-level**, jamais des actions.
- Tab bar **reste visible** en naviguant dans une section (sauf modal qui la couvre temporairement).
- **Ne pas** désactiver / masquer un onglet : expliquer pourquoi le contenu est indisponible.
- Éviter l’onglet **More** / overflow : contenu caché = plus dur à découvrir.
- Labels d’onglets : **mots clairs** (idéalement un seul mot) + icônes (SF Symbols préférés).
- Badges tab : **avec parcimonie**, info critique / nouveau seulement.

## Choisir le pattern

| Besoin | Pattern |
|--------|---------|
| 3–5 destinations plates peer | Tab bar |
| Hiérarchie / collections profondes | Sidebar / NavigationSplitView |
| iPad + fenêtre redimensionnable | `sidebarAdaptable` (tab ↔ sidebar) |
| Compact / iPhone modal | Sheet / full-screen cover plutôt que popover |
| Large (iPad regular) | Popover OK ; split view pour hiérarchie |

## iPadOS

- Préférer layouts **plein écran** le plus longtemps possible avant de basculer compact.
- Tester halves / thirds / quadrants.
- Tab bar convertible (`sidebarAdaptable`) : choix initial sidebar **ou** tab ; bouton pour basculer ; adaptation auto à la largeur.

## Sheets & modals

- Compact : préférer sheet / full-screen pour du contenu qui aurait été un popover en wide.
- Ne pas empiler des modals sans raison ; une tâche = un niveau modal clair.

## Hiérarchie visuelle (layout)

- Importance ≈ ordre de lecture (haut → bas, leading → trailing ; respecter RTL).
- Aligner ; grouper le lié (espace négatif, séparateurs, materials).
- Contenu scrollable jusqu’aux bords ; contrôles flottent au-dessus (Liquid Glass / scroll edge).

## Do / Don’t

**Do**
- SF Symbols pour onglets
- Nombre d’onglets gérable (pas trop) ; sidebar si structure complexe
- Garder la sélection d’onglet stable quand on navigue en profondeur

**Don’t**
- Mettre « Settings », « Share », « Search submit » comme *action* dans la tab bar (Settings peut être une *section* si top-level)
- Changer l’ordre des tabs de façon imprévisible
- Cacher la tab bar pour « gagner de la place » hors immersion média/jeu justifiée
