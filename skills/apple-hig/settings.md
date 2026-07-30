# Settings — HIG iOS/iPadOS

> Source : [Settings](https://developer.apple.com/design/human-interface-guidelines/settings)

## Règles dures

- **Defaults sensés** : la majorité ne devrait pas avoir à configurer.
- **Minimiser** le nombre de réglages.
- Ne pas dupliquer / **contredire** les préférences système (apparence, accessibilité, etc.) — s’y brancher.
- Détecter automatiquement device / environnement quand possible.

## Où placer quoi

| Type | Emplacement |
|------|-------------|
| Options liées à une **tâche** | Dans l’UI de la tâche (rester dans le flow) |
| Préférences **peu changées** (compte, config persistante) | Zone Settings **in-app** dédiée |
| Options **très rarement** touchées / globales | Page app dans l’app **Settings** système ; bouton in-app qui ouvre cette section |

Accéder aux settings in-app = suspendre l’activité → réserver aux changements peu fréquents.

## Bonnes pratiques

- Exposer les settings via conventions plateforme (ex. raccourcis clavier iPad si pertinent).
- iPad menu bar : item **Settings** = ouvrir la page **système** de l’app ; préférences internes = item séparé dans le même groupe.

## Do / Don’t

**Do**
- Peu d’options, labels clairs, regroupement logique
- Deep link vers Settings système pour permissions
- Valeurs par défaut excellentes

**Don’t**
- Settings fourre-tout pour tout tweak UI
- Forcer un thème custom qui ignore Appearance système sans besoin produit fort
- Exiger un parcours settings pour une action quotidienne
