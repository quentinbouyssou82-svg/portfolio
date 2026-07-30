# Paywalls & abonnements — guidance Apple

> **Note agents** : le HIG « Patterns » général est mince sur les paywalls.  
> Sources **autoritaires** ici :
> - [HIG — In-App Purchase](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase)
> - [App Store — Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/)
> - [App Store Review Guidelines §3.1](https://developer.apple.com/app-store/review/guidelines/)
>
> Ne pas inventer de règles « anti-dark-pattern » hors de ces textes ; s’appuyer sur clarté, restore, cancel, et interdictions Review (scam / bait-and-switch / prix trompeur).

## Écran d’inscription / paywall — must have

Sur l’écran de signup abonnement (HIG IAP + page Subscriptions) :

1. **Nom** de l’abonnement + **durée**
2. **Contenu / services** fournis pendant la période
3. **Prix de renouvellement complet**, clair et **promient**, localisé
4. Moyen pour abonnés existants de **se connecter** ou **restaurer les achats**
5. Liens **Terms of Use** + **Privacy Policy** (app + metadata App Store)

## Clarté des prix (anti-tromperie)

- Afficher le **montant total facturé** pour chaque offre (tous types IAP).
- Prix total (ex. annuel) = élément pricing **le plus proéminent**.
- Équivalent mensuel / « économies » : **subordonnés** (taille/position) — ne pas induire en erreur ([Subscriptions — Clearly describing](https://developer.apple.com/app-store/subscriptions/)).
- Free trial : durée du trial **et** prix après trial, explicites.
- Offres intro : nom auto-explicatif + prix standard après l’offre.

## Restore & entitlements

- UI de restore pour non-consumables / auto-renewable (et pratiques StoreKit).
- StoreKit 2 : vérifier entitlements de façon proactive ; garder un bouton **Restore** pour cas limites (`AppStore.sync` sur action utilisateur).
- Compte app : restore via login possible, mais ne pas bloquer l’accès payé par tâches extra (posts sociaux, etc.) — Review 3.1.2(a).

## Gestion & annulation

- Rendre **facile** d’annuler / gérer l’abo (HIG : si manage est profond ou peu reconnaissable → sensation de dissuasion).
- Préférer UI système (`showManageSubscriptions`) + statut in-app (upgrade / downgrade / crossgrade).
- Retention offers / exit survey : OK **après** intention de cancel — ne pas cacher le chemin système de cancel.

## Review Guidelines — garde-fous

- Digital features / subscriptions → **IAP** (3.1.1), sauf entitlements régionaux documentés.
- Décrire clairement ce que l’utilisateur obtient **avant** subscribe (3.1.2(c)).
- Interdit : tromper pour faire acheter, bait-and-switch, scam (3.1.2(a)) — retrait App Store possible.
- Metadata / screenshots : indiquer si contenu featured nécessite achat (2.3.2).
- Valeur continue pour auto-renewable ; période ≥ 7 jours ; dispo sur appareils utilisateur.

## UX flow

- Flow d’achat **simple** ; seulement infos nécessaires.
- Messaging cohérent ; terms clairs ; valeur reconnaissable.
- Un seul subscription group dans la plupart des apps (évite multi-abos accidentels).

## Do / Don’t

**Do**
- Prix total dominant ; restore visible ; ToS / Privacy ; manage/cancel évidents
- Localiser devises ; StoreKit pour l’achat
- Indiquer clairement trial → prix payant

**Don’t**
- Mettre le prix réel en petit / grisé sous un « $0 » trompeur
- Cacher Restore
- Rendre l’annulation un labyrinthe
- Débloquer du digital hors IAP (hors exceptions légales/entitlements)
- Forcer actions non liées pour « obtenir ce qui est payé »
