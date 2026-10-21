# Documents juridiques Driveely — Récapitulatif

Ce dossier contient les 13 documents juridiques nécessaires au lancement de la bêta privée puis de la commercialisation d'Driveely en France. Ils sont cohérents entre eux et fondés sur l'identité d'édition confirmée : **Driveely**, édité sous la responsabilité de **Quentin Bouyssou**, contact **contactdriveelyai@gmail.com**.

## Liste des documents

| # | Document | Fichier |
|---|---|---|
| 1 | Mentions légales | `01-mentions-legales.md` |
| 2 | Politique de confidentialité (RGPD) | `02-politique-confidentialite.md` |
| 3 | Conditions Générales d'Utilisation | `03-cgu.md` |
| 4 | Conditions Générales de Vente | `04-cgv.md` |
| 5 | Politique de cookies | `05-politique-cookies.md` |
| 6 | Conditions de participation à la bêta privée | `06-conditions-beta-privee.md` |
| 7 | Politique de remboursement | `07-politique-remboursement.md` |
| 8 | Gestion des demandes RGPD | `08-gestion-demandes-rgpd.md` |
| 9 | Politique de suppression des données | `09-politique-suppression-donnees.md` |
| 10 | Politique de sécurité des données | `10-politique-securite-donnees.md` |
| 11 | Mentions relatives aux abonnements (Stripe / App Store) | `11-mentions-abonnements-stripe.md` |
| 12 | Politique de propriété intellectuelle | `12-politique-propriete-intellectuelle.md` |
| 13 | Charte d'utilisation acceptable | `13-charte-utilisation-acceptable.md` |

## Organisation de l'activité (état au 21 octobre 2026)

1. **Responsable / éditeur / directeur de la publication** : Quentin Bouyssou.
2. **Contact officiel** : contactdriveelyai@gmail.com.
3. **Site** : `https://www.driveely.app` (apex `driveely.app` redirige vers www).
4. **Privacy URL ASC** : `https://www.driveely.app/confidentialite`.
5. **Support URL ASC** : `https://www.driveely.app/contact`.
6. **Immatriculation (SIREN / SIRET / adresse / TVA)** : à confirmer et publier par Quentin avant commercialisation — ne pas republier d'anciennes identités (ex. Mikael Florindo Machado / SIRET Montauban) sans validation.
7. Vérifier auprès d'un professionnel du droit (avocat ou expert-comptable) la rédaction des documents et la conformité fiscale / sociale.

**Ces documents constituent une base rédactionnelle avancée mais ne remplacent pas la vérification par un avocat inscrit au barreau avant publication.**

## Placeholders / source unique

**Source unique runtime web** : `lib/margeo/legal/entity.ts` (+ variables d'env optionnelles).

| Marqueur / env | Usage | État |
|---|---|---|
| `DRIVEELY_LEGAL_DIRECTOR` | Responsable / éditeur | Quentin Bouyssou |
| `DRIVEELY_LEGAL_UPDATED_AT` | Date de mise à jour | 21 octobre 2026 |
| `DRIVEELY_LEGAL_SIREN` | SIREN | À confirmer (env ou publication) |
| `DRIVEELY_LEGAL_SIRET` | SIRET | À confirmer |
| `DRIVEELY_LEGAL_ADDRESS` | Adresse professionnelle | À confirmer |
| `DRIVEELY_LEGAL_VAT` | TVA (optionnel) | À confirmer |

Adresses Vercel / Supabase : renseignées (adresses publiques des hébergeurs).

## Cohérence entre les documents

Les documents se renvoient mutuellement. Si tu renommes un fichier, mets à jour les liens correspondants. Une copie miroir existe côté iOS : `driveely-ios/Driveely/Resources/Legal/`.

## Offre produit reflétée (octobre 2026)

- Free : 2 analyses/jour, partage, historique limité, pas Back Tap / Centre de contrôle
- Premium : illimité, partage, Back Tap, Centre de contrôle, historique complet — **12,99 €/mois** ou **99,99 €/an**, essai **14 jours**
- Canaux : App Store / StoreKit (iPhone) ; Stripe (web, lorsque activé)

## Prestataires techniques (à conserver dans les docs)

Apple, Supabase, Vercel, Stripe, Mistral, Groq, Gemini, Mapbox / Nominatim / OSRM, Upstash, Sentry, PostHog (web si configuré).

## Évolutions prévues à anticiper

Ces documents contiennent déjà des clauses conditionnelles pour :
- Google Login / Apple Login
- PostHog / Google Analytics (mesure d'audience)
- Activation des paiements Stripe web (fin de gratuité de la bêta côté web)

Il faudra les activer/compléter (et non les réécrire entièrement) au moment du déploiement de ces fonctionnalités.
