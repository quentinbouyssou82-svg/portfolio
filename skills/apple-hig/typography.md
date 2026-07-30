# Typography — HIG iOS/iPadOS

> Sources : [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) · [Accessibility / Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography)

## Règles dures

- Préférer **text styles** système (Title, Headline, Body, Callout, Caption…) — pas des pt hardcodés seuls.
- **Dynamic Type** obligatoire : le layout doit tenir de xSmall → AX5.
- Polices système : **SF Pro** (UI) ; **New York** (serif complémentaire) ; SF Symbols pour glyphes.
- Contraste texte / fond **maximisé** ; tester light, dark, increased contrast.
- Custom fonts : OK avec parcimonie **si** branchés sur text styles / Dynamic Type et lisibles en AX.

## Text styles

- Chaque style = weight + size + leading prévus pour hiérarchie et scale.
- Emphasized weights (medium / semibold / bold / heavy selon style) via traits symboliques — mis à jour HIG déc. 2025.
- Ne pas rasteriser le texte (widgets, images) → casse scale + VoiceOver.

## Dynamic Type — checklist agent

- [ ] Styles sémantiques (`.font(.body)` etc.) ou `UIFontMetrics`
- [ ] Layouts flexibles / scroll quand le texte grossit (pas de clip)
- [ ] Icônes / SF Symbols qui scale avec le texte si adjacents
- [ ] Test Settings → Accessibility → Display & Text Size → Larger Accessibility Sizes
- [ ] Previews Xcode multi Dynamic Type

## Widgets (si applicable)

- Préférer système + text styles ; éviter tailles &lt; ~11 pt
- Dynamic Type widgets : Large → AX5 (selon HIG widgets)

## Do / Don’t

**Do**
- Hiérarchie claire (1 titre fort, body lisible, captions secondaires)
- Leading / tracking système sauf raison forte
- Vérifier troncature vs wrap selon le contexte

**Don’t**
- Fixer une seule taille pour tout l’écran
- Texte décoratif illisible en accessibilité
- Assumer que « Large » suffit — tester AX
