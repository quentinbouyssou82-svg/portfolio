# Notifications — HIG iOS/iPadOS

> Sources : [Managing notifications](https://developer.apple.com/design/human-interface-guidelines/managing-notifications) · [Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications) · [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy)

## Règles dures

- **Permission obligatoire** avant d’envoyer toute notification.
- L’utilisateur peut changer d’avis dans Settings (silence possible).
- Demander la permission **quand la valeur est claire** — idéalement à l’usage de la feature, pas au cold launch (sauf si essentiel au core).
- Marketing / promo : **opt-in explicite** avec description des types d’infos + moyen easy opt-out ([Managing notifications](https://developer.apple.com/design/human-interface-guidelines/managing-notifications)).

## Contenu

- Utile, actionnable, lié au contexte utilisateur.
- Éviter le purement promotionnel (surtout App Clips / patterns limités).
- Previews / texte : clairs et descriptifs.

## Badges

- Garder le compteur **à jour** ; mettre à jour dès que l’utilisateur a vu le contenu.
- Badge → 0 retire aussi les notifs associées du Notification Center (comportement système à respecter).
- **Ne pas** imiter les badges système avec des composants custom (frustration si notifs désactivées).

## Timing de la demande

1. Expliquer le bénéfice (pré-permission UI si besoin).
2. Déclencher l’alert système.
3. Si refusé : ne pas harceler ; offrir un chemin Settings plus tard quand pertinent.

## Do / Don’t

**Do**
- Permission contextualisée ; catégories utiles ; respect Focus / réglages user
- Badges honnêtes et synchronisés

**Don’t**
- Prompt notifs à la 1ère frame sans raison
- Spammer ; notifs marketing sans consentement explicite
- Faux badges rouges « décoratifs »
