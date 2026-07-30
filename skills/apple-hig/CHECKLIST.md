# CHECKLIST — audit UI native Apple (iOS/iPadOS)

> Cocher les items **applicables**. Sources : fichiers du skill + [HIG](https://developer.apple.com/design/human-interface-guidelines/).  
> Paywalls : aussi [IAP HIG](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase) · [Subscriptions](https://developer.apple.com/app-store/subscriptions/) · [Review 3.1](https://developer.apple.com/app-store/review/guidelines/).

## Layout & spacing

- [ ] Safe areas respectées (Dynamic Island, home indicator, barres)
- [ ] Marges système ; pas de boutons collés full-bleed aux bords
- [ ] Backgrounds / scroll full-bleed ; contrôles distincts du contenu
- [ ] Cibles ~44×44 pt ; espacement suffisant entre contrôles
- [ ] Layout OK orientation / tailles / iPad resize (si supporté)
- [ ] Dynamic Type : pas de clip aux tailles AX

## Typography & color

- [ ] Text styles / Dynamic Type (pas seulement pt fixes)
- [ ] Contraste texte/fond OK light + dark (+ increased contrast si custom)
- [ ] Couleurs sémantiques système ou variantes light/dark fournies

## Navigation

- [ ] Tab bar = sections top-level, pas d’actions
- [ ] Tabs visibles ; pas d’onglets disabled/cachés sans explication
- [ ] Labels + SF Symbols clairs ; badges sparingly
- [ ] iPad : sidebar / `sidebarAdaptable` si hiérarchie le justifie
- [ ] Sheets/modals appropriés à la size class

## Onboarding

- [ ] Court ; skip si non prérequis
- [ ] Pas rejoué à chaque launch ; accessible plus tard
- [ ] Interactif / focus produit (pas tutoriel système)
- [ ] Permissions au bon moment (+ pourquoi)
- [ ] Splash non bloquant / non interminable

## Settings

- [ ] Defaults sensés ; peu d’options
- [ ] Options fréquentes dans le flow de tâche
- [ ] Pas de conflit avec Settings système
- [ ] Lien vers Settings système pour permissions si besoin

## Notifications

- [ ] Pas de prompt froid sans valeur
- [ ] Permission avant envoi ; marketing = opt-in explicite
- [ ] Contenu utile ; badges à jour ; pas de faux badges

## Paywalls / IAP / abonnements

- [ ] Nom + durée + ce qui est inclus
- [ ] **Prix total** de renouvellement proéminent et localisé
- [ ] Équivalents / savings subordonnés (pas trompeurs)
- [ ] Trial : durée + prix ensuite
- [ ] Restore / sign-in abonnés visibles
- [ ] Liens Terms + Privacy
- [ ] Manage / cancel faciles (UI système ou équivalent clair)
- [ ] Digital unlock via IAP (sauf exception Review documentée)
- [ ] Pas de bait-and-switch / pretenses trompeurs

## Feedback (rapide)

- [ ] Loading : indicateur si &gt; un instant (déterminé vs indéterminé)
- [ ] Erreurs / confirmations compréhensibles ; pas d’alerts abusives

## Verdict

| Zone | PASS / FAIL / N/A | Notes |
|------|-------------------|-------|
| Layout | | |
| Typo/Color | | |
| Navigation | | |
| Onboarding | | |
| Settings | | |
| Notifications | | |
| Paywalls | | |

**Bloquants typiques** : Dynamic Type cassé, safe area ignorée, paywall prix trompeur, restore absent, permission spam, cancel abo caché.
