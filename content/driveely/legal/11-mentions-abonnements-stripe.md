# Mentions relatives aux abonnements Stripe

**Dernière mise à jour : 21 octobre 2026**

## Application iOS

Sur l'**application iPhone Driveely**, les abonnements Premium ne sont **pas** traités par Stripe. Ils sont achetés via l'**Apple App Store** au moyen de **StoreKit**, sous forme d'abonnements à renouvellement automatique (auto-renewable subscriptions).

- Le paiement est facturé au **compte Apple ID** de l'Utilisateur.
- Driveely ne collecte ni ne stocke aucune donnée bancaire dans ce cadre.
- Le renouvellement automatique, le moyen de paiement et la **résiliation** se gèrent dans les réglages d'abonnement du compte Apple ID (Réglages iOS > identifiant Apple > Abonnements, ou chemin équivalent indiqué par Apple).
- Les conditions d'Apple relatives aux achats intégrés et aux abonnements s'appliquent en complément des [Conditions Générales de Vente](./04-cgv.md).
- Pour toute question de facturation App Store, l'Utilisateur peut contacter [contactdriveelyai@gmail.com](mailto:contactdriveelyai@gmail.com) et, le cas échéant, le support Apple.

Le reste de la présente page décrit le traitement des paiements **via Stripe sur le site web**.

---

## 1. Objet

La présente page précise les modalités de traitement des paiements relatifs à l'abonnement Premium du Service Driveely, effectués par l'intermédiaire de la plateforme **Stripe** (site web). Elle complète les [Conditions Générales de Vente](./04-cgv.md) et la [Politique de confidentialité](./02-politique-confidentialite.md).

Sur iPhone, les paiements Premium sont activés via l'Apple App Store. La section Stripe ci-dessous ne concerne que le site web, lorsqu'un paiement web est proposé.

## 2. Rôle de Stripe

Stripe est un prestataire de services de paiement tiers, indépendant d'Driveely, agissant en qualité de sous-traitant au sens du RGPD pour le traitement des données de paiement. Stripe est responsable de la sécurisation et du traitement technique des transactions.

## 3. Données transmises à Stripe

Lors de la souscription à l'offre Premium, les informations de paiement suivantes sont saisies **directement sur l'interface sécurisée de Stripe** et ne transitent à aucun moment par les serveurs d'Driveely :

- numéro de carte bancaire ;
- date d'expiration ;
- cryptogramme visuel (CVC) ;
- nom du titulaire de la carte, le cas échéant.

Driveely reçoit uniquement de Stripe les informations nécessaires à la gestion de l'abonnement (statut de l'abonnement, date de renouvellement, historique de facturation, identifiant client Stripe), à l'exclusion de toute donnée bancaire complète.

## 4. Conformité PCI-DSS

Stripe est certifié conforme à la norme **PCI-DSS (Payment Card Industry Data Security Standard)**, garantissant un haut niveau de sécurité dans le traitement des données de paiement.

## 5. Renouvellement automatique et prélèvements

L'abonnement Premium est mensuel ou annuel selon l'offre choisie et se renouvelle automatiquement. Le prélèvement correspondant est effectué automatiquement par Stripe à chaque échéance, sur le moyen de paiement enregistré par l'Utilisateur, jusqu'à résiliation de l'abonnement dans les conditions prévues à l'article 7 des [Conditions Générales de Vente](./04-cgv.md).

## 6. Modification du moyen de paiement

L'Utilisateur peut mettre à jour son moyen de paiement à tout moment depuis son compte, via le portail sécurisé fourni par Stripe.

## 7. Échecs de paiement

En cas d'échec de prélèvement (carte expirée, solde insuffisant, opposition, etc.), Driveely pourra suspendre l'accès à l'offre Premium jusqu'à régularisation du paiement, après notification de l'Utilisateur par e-mail.

## 8. Politique de confidentialité de Stripe

Le traitement des données de paiement par Stripe est également régi par la politique de confidentialité propre à Stripe, disponible sur le site de Stripe, que l'Utilisateur est invité à consulter.

## 9. Contact

Pour toute question relative à la facturation : [contactdriveelyai@gmail.com](mailto:contactdriveelyai@gmail.com)
