# Onboarding — HIG iOS/iPadOS

> Source : [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) · lié : [Launching](https://developer.apple.com/design/human-interface-guidelines/launching) · [Privacy / permissions](https://developer.apple.com/design/human-interface-guidelines/privacy) · [Branding](https://developer.apple.com/design/human-interface-guidelines/branding)

## Règles dures

- Idéal : l’app se comprend **en l’utilisant** ; onboarding seulement si nécessaire.
- Onboarding = **après** le launch, pas pendant.
- Doit être **rapide, agréable, optionnel** quand possible.
- **Enseigner par l’interaction**, pas par longs slides de lecture.
- Contenu centré sur **votre** expérience — pas un tutoriel iOS/système.
- Ne pas forcer à mémoriser beaucoup d’info.

## Skip & reprise

- Si tutoriel séparable : **skip** au premier lancement.
- Ne **pas** le re-présenter aux launches suivants.
- Le rendre retrouvable (Help / Account / Settings).

## Splash

- Splash branding : seulement si besoin ; graphic succincte ; **assez courte** pour être absorbée d’un coup d’œil, sans sensation de délai.
- Ne pas utiliser le **launch screen** système comme branding prolongé (disparaît trop vite) — welcome/onboarding pour le message marque.
- Placer splash en début d’onboarding ou juste après launch (pas bloquer le launch).

## Permissions

- Si accès privé **requis pour fonctionner** : intégrer la demande **dans** l’onboarding avec **pourquoi** + bénéfice.
- Sinon : demander **au moment** où l’utilisateur accède à la feature (pas au cold launch par défaut).
- Privacy HIG : request only when clearly needed ; purpose string claire.

## Contenu & perf

- Assez de contenu local pour commencer **sans attendre** de gros downloads.
- Pas de multi-écrans verbeux ; focus features qui comptent.

## Abonnements (croisement)

- La page App Store Subscriptions autorise à présenter la valeur abo en onboarding : **bref**, engageant, CTA succinct, **terms clairs** — voir `paywalls.md`. Ce n’est pas une excuse pour un funnel trompeur.

## Do / Don’t

**Do**
- Flow court ; interactive coaching tips ; skip
- Expliquer permissions avant l’alert système
- Restaurer l’état app au relaunch (Launching HIG)

**Don’t**
- 8+ écrans de carousel marketing non skippable
- Demander notifs / tracking / contacts dès l’ouverture sans contexte
- Relancer l’onboarding à chaque ouverture
- Logo partout « pour rappeler quelle app » (Branding HIG)
