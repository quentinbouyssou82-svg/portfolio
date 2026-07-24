# Documents juridiques Driveely — Récapitulatif

Ce dossier contient les 13 documents juridiques nécessaires au lancement de la bêta privée puis de la commercialisation d'Driveely en France, cohérents entre eux et fondés sur la structure retenue : **micro-entreprise française** exploitant l'enseigne Driveely, **dirigée par le tuteur légal** de Leandro Machado (son père). Leandro Machado est le **porteur du projet** (développement / opérationnel) mais **n'est pas le représentant légal** de la micro-entreprise.

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
| 11 | Mentions relatives aux abonnements Stripe | `11-mentions-abonnements-stripe.md` |
| 12 | Politique de propriété intellectuelle | `12-politique-propriete-intellectuelle.md` |
| 13 | Charte d'utilisation acceptable | `13-charte-utilisation-acceptable.md` |

## ⚠️ Point juridique prioritaire — organisation de l'activité

Ces documents sont rédigés sur la base de l'option **micro-entreprise dirigée par le tuteur légal**. Concrètement, avant toute publication :

1. **Créer / immatriculer la micro-entreprise** au nom du tuteur légal (père de Leandro Machado), qui en sera le responsable légal.
2. **Obtenir SIREN / SIRET** et renseigner l'adresse professionnelle.
3. **Clarifier en interne** le rôle de Leandro Machado (porteur du projet / contribution opérationnelle) sans confusion avec la représentation légale.
4. Vérifier auprès d'un professionnel du droit (avocat ou expert-comptable) la rédaction des documents et la conformité fiscale / sociale de la micro-entreprise.

**Ces documents constituent une base rédactionnelle avancée mais ne remplacent pas la vérification par un avocat inscrit au barreau avant publication.**

## Placeholders à compléter avant publication

**Source unique** : `lib/margeo/legal/entity.ts` (+ variables d'env optionnelles).

Les fichiers markdown conservent des marqueurs `[…]`. Au chargement, `applyLegalEntityPlaceholders()` les remplace.

| Marqueur / env | Usage |
|---|---|
| `DRIVEELY_LEGAL_SIREN` | SIREN |
| `DRIVEELY_LEGAL_SIRET` | SIRET |
| `DRIVEELY_LEGAL_ADDRESS` | Adresse professionnelle |
| `DRIVEELY_LEGAL_DIRECTOR` | Nom du tuteur / responsable légal |
| `DRIVEELY_LEGAL_VAT` | TVA (optionnel) |
| `DRIVEELY_LEGAL_UPDATED_AT` | Date de mise à jour des docs |

Adresses Vercel / Supabase : déjà renseignées (adresses publiques des hébergeurs).

Recherche encore `[À COMPLÉTER]` / `EN COURS D'IMMATRICULATION` dans les .md tant que les env ne sont pas posées.

## Cohérence entre les documents

Les documents se renvoient mutuellement. Si tu renommes un fichier, mets à jour les liens correspondants.

## Évolutions prévues à anticiper

Ces documents contiennent déjà des clauses "à venir" pour :
- Google Login / Apple Login
- Google Analytics
- Activation des paiements Stripe (fin de gratuité de la bêta)

Il faudra les activer/compléter (et non les réécrire entièrement) au moment du déploiement de ces fonctionnalités.
