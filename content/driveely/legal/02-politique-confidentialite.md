# Politique de confidentialité

**Dernière mise à jour : 1 octobre 2026**

Driveely (« nous », « notre », « Driveely »), édité par Driveely, micro-entreprise 453 945 750, attache une importance particulière à la protection des données personnelles de ses utilisateurs. La présente politique de confidentialité (la « Politique ») a pour objet de vous informer, conformément au Règlement (UE) 2016/679 du 27 avril 2016 (« RGPD ») et à la loi n° 78-17 du 6 janvier 1978 modifiée (« Loi Informatique et Libertés »), sur la manière dont vos données personnelles sont collectées, utilisées, conservées et protégées dans le cadre de votre utilisation du Service (application iPhone Driveely et, le cas échéant, interface web associée).

## 1. Responsable de traitement

Le responsable du traitement des données personnelles est :

Driveely, micro-entreprise en cours d'immatriculation
1110 Avenue Henri Dunant, 82000 Montauban, France
Contact : [contactdriveelyai@gmail.com](mailto:contactdriveelyai@gmail.com)

Driveely n'a pas désigné de délégué à la protection des données (DPO) à ce stade, cette désignation n'étant pas obligatoire compte tenu de la nature et du volume des traitements actuels. Ce point sera réévalué à mesure de la croissance du Service.

## 2. Données collectées

### 2.1 Données fournies directement par l'utilisateur

- Adresse e-mail (obligatoire, pour la création de compte)
- Mot de passe (hashé par le prestataire d'authentification ; jamais stocké en clair par Driveely)
- Prénom et nom (optionnels)
- Photo de profil (optionnelle)
- Ville (optionnelle, renseignée dans le profil)
- Profil métier livreur : type de véhicule, détails véhicule / carburant le cas échéant, coût au km, objectifs (horaire / journalier), plateformes de livraison, préférences d'onboarding (ex. retours à vide, distance max, volume d'heures)
- Captures d'écran des propositions de course soumises pour analyse
- Réponses aux questionnaires d'onboarding / produit (survey) lorsque vous y répondez
- Messages de feedback produit (bug, idée, autre), avec éventuellement une capture jointe et des métadonnées techniques d'appareil (modèle, version OS, version de l'app)
- Codes d'accès bêta, lorsque vous en saisissez un

### 2.2 Données générées ou dérivées par le Service

- Identifiant de compte (UUID)
- Date de création du compte et acceptation des conditions (horodatage / version)
- Type d'abonnement et statut Premium (Free / Premium), événements d'abonnement associés (hors données bancaires)
- Nombre d'analyses effectuées / quotas d'usage
- Résultats d'analyse (score de rentabilité, verdict, explication, insights, détail de course extrait : plateforme, adresses de prise en charge / livraison, montant, distances estimées, etc.)
- Historique des analyses et retours post-course (acceptation, résultats réels saisis)
- Position GPS (latitude / longitude, précision éventuelle), uniquement si vous autorisez la géolocalisation « Lorsque l'app est utilisée » ; dernière position synchronisée sur le profil et journaux techniques de position associés
- Itinéraires / distances calculés à partir de la position et des adresses extraites (géocodage / routage), pour affiner le score
- Assertions de sécurité appareil (Apple App Attest / DeviceCheck) lorsque l'appareil le prend en charge, pour protéger les endpoints sensibles

### 2.3 Traitements temporaires (non conservés comme contenu utilisateur durable)

- Préparation technique de l'image (compression) avant analyse
- OCR on-device (sur l'iPhone) lorsque cette voie est utilisée : extraction locale des champs de l'offre, transmise au serveur pour l'analyse ; non utilisée pour entraîner des modèles tiers
- Transmission temporaire de l'image (ou du payload OCR) aux fournisseurs Vision configurés (cf. article 5), le temps de l'analyse
- Jetons de session / refresh gérés par l'authentification (Supabase Auth) et stockage local sécurisé côté app

### 2.4 Données de connexion tierces (à venir)

Lorsque les fonctionnalités de connexion via Google ou Apple seront disponibles, les données transmises par ces fournisseurs d'identité (a minima l'adresse e-mail et, le cas échéant, le nom associé au compte) pourront être collectées, avec votre consentement, dans les conditions qui seront précisées lors de la mise en place de ces fonctionnalités. **Ces connexions sociales ne sont pas proposées dans l'application iPhone actuelle.**

### 2.5 Données que nous ne collectons pas

Driveely ne collecte pas :

- de données bancaires (paiements web via Stripe ; achats iPhone via l'App Store / StoreKit — cf. article 8) ;
- de données de santé, contacts, historique de navigation web, ni d'identifiant publicitaire (IDFA) ;
- de tracking publicitaire au sens d'App Tracking Transparency (aucune demande ATT dans l'app iOS) ;
- de données sensibles au sens de l'article 9 du RGPD.

La géolocalisation n'est jamais imposée : elle n'est traitée que si vous l'autorisez explicitement.

## 3. Finalités du traitement

Vos données sont traitées pour les finalités suivantes :

| Finalité | Base légale |
|---|---|
| Création et gestion du compte utilisateur | Exécution du contrat (CGU) |
| Analyse des captures / OCR et fourniture du score de rentabilité | Exécution du contrat (CGU) |
| Affinage via géolocalisation et calcul d'itinéraires (si autorisé) | Exécution du contrat / Intérêt légitime |
| Conservation de l'historique des analyses et du profil métier | Exécution du contrat / Intérêt légitime |
| Gestion des abonnements (web Stripe / iOS App Store) | Exécution du contrat |
| Sécurité anti-abus (rate limiting, App Attest, journaux techniques) | Intérêt légitime |
| Feedback produit, support, questionnaires | Exécution du contrat / Intérêt légitime |
| Amélioration du Service (statistiques d'usage produit, le cas échéant) | Intérêt légitime / Consentement lorsque requis |
| Cookies / mécanismes techniques strictement nécessaires | Intérêt légitime / Exigence contractuelle |
| Mesure d'audience web (PostHog), uniquement si configurée | Consentement (cf. Politique de cookies) |
| Journalisation d'erreurs (Sentry), uniquement si configurée | Intérêt légitime |

## 4. Destinataires des données

Vos données sont destinées à Driveely et sont hébergées et traitées par les sous-traitants suivants, agissant pour notre compte dans le cadre d'accords de traitement des données (DPA) lorsque applicables :

- **Supabase Inc.** — authentification (Supabase Auth), base de données (PostgreSQL), stockage des fichiers (buckets captures privés ; avatars)
- **Vercel Inc.** — hébergement de l'interface web et des API, logs techniques d'infrastructure
- **Stripe** — paiements et abonnements sur le site web (cf. article 8)
- **Apple** — achats / abonnements App Store (StoreKit) ; App Attest / DeviceCheck ; services cartographiques Apple Maps utilisés côté iPhone pour certains calculs d'itinéraire locaux
- **Mistral AI** — analyse Vision des captures (extraction de l'offre), sous-traitant technique (cf. article 5)
- **Groq** — le cas échéant, analyse Vision de secours lorsque ce fournisseur est configuré
- **Google (Gemini)** — le cas échéant, analyse Vision de secours lorsque ce fournisseur est configuré
- **Mapbox** et/ou services publics de géocodage / routage (**Nominatim**, **OSRM**) — lorsque configurés / utilisés pour estimer distances et itinéraires à partir d'adresses et, le cas échéant, de coordonnées
- **Upstash** — Redis (limitation de débit, cache technique, défis de sécurité), le cas échéant lorsque configuré
- **Sentry** — journalisation d'erreurs applicatives (métadonnées techniques scrubbées ; pas de données bancaires), uniquement lorsque le DSN est configuré
- **PostHog** — mesure d'audience / analytics produit sur l'interface **web**, uniquement lorsque la clé correspondante est configurée (cf. [Politique de cookies](./05-politique-cookies.md)). **L'application iPhone actuelle n'embarque pas PostHog.**

Driveely ne vend, ne loue et ne partage vos données personnelles avec des tiers à des fins commerciales ou publicitaires.

## 5. Traitement par intelligence artificielle

Les captures d'écran que vous importez sont transmises, après préparation technique (compression), au fournisseur Vision configuré — en priorité **Mistral AI**, avec bascule éventuelle vers **Groq** puis **Google Gemini** lorsque ces clés / fournisseurs sont activés — aux seules fins de réaliser l'analyse de rentabilité demandée.

Lorsque l'OCR on-device est utilisé (sur l'iPhone), les champs extraits localement peuvent être envoyés au serveur pour calculer le score **sans** retransmettre l'image au fournisseur Vision, selon le chemin technique retenu pour la requête.

Cette transmission constitue un traitement nécessaire à l'exécution du Service. Les images et extractions ne sont utilisées à aucune autre fin (notamment pas à des fins d'entraînement de modèles tiers) sans votre consentement exprès préalable. Les conditions des fournisseurs d'IA concernés s'appliquent en complément pour le traitement effectué pour notre compte.

## 6. Durées de conservation

| Donnée | Durée de conservation |
|---|---|
| Captures d'écran (Storage) | 30 jours à compter de l'import, puis suppression automatique (cron) ; le chemin image est alors effacé côté fiche course |
| Historique des analyses (score, verdict, explication, détail de course) | Conservé tant que le compte est actif ; supprimable à tout moment par l'utilisateur (analyse unitaire ou compte) |
| Données de compte et profil (e-mail, nom, véhicule, objectifs, position dernière connue, etc.) | Conservées tant que le compte est actif, puis supprimées conformément à la [Politique de suppression des données](./09-politique-suppression-donnees.md) |
| Feedback produit / questionnaires | Conservés tant que le compte est actif, sauf suppression du compte |
| Données d'abonnement / facturation associées | Durée légale de conservation comptable et fiscale applicable (en principe 10 ans pour les documents comptables) |
| Journaux de sécurité / connexion | Durée strictement nécessaire, maximum 1 an |
| Assertions App Attest | Traitement technique de requête ; pas d'usage publicitaire |

## 7. Vos droits

Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :

- Droit d'accès
- Droit de rectification
- Droit à l'effacement (« droit à l'oubli »)
- Droit à la limitation du traitement
- Droit à la portabilité des données
- Droit d'opposition
- Droit de retirer votre consentement à tout moment, lorsque le traitement repose sur celui-ci
- Droit de définir des directives relatives au sort de vos données après votre décès
- Droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL — [www.cnil.fr](https://www.cnil.fr))

Les modalités d'exercice de ces droits sont détaillées dans notre [Politique de gestion des demandes RGPD](./08-gestion-demandes-rgpd.md). Vous pouvez adresser toute demande à [contactdriveelyai@gmail.com](mailto:contactdriveelyai@gmail.com).

Export et suppression de compte sont également proposés via les endpoints / écrans prévus par le Service (export des données, suppression de compte avec confirmation).

## 8. Paiements (Stripe et App Store)

Les informations de paiement (numéro de carte bancaire notamment) ne sont jamais collectées ni stockées par Driveely.

**Sur le site web**, elles sont saisies et traitées directement par notre prestataire de paiement, **Stripe**, dans le respect de la norme de sécurité PCI-DSS. Se reporter aux [Mentions relatives aux abonnements Stripe](./11-mentions-abonnements-stripe.md) et à la politique de confidentialité de Stripe pour plus de détails.

**Sur l'application iPhone**, les abonnements Premium sont achetés via l'**Apple App Store** (StoreKit). Le paiement et la facturation sont gérés par Apple ; Driveely ne reçoit pas vos données bancaires. Driveely peut recevoir et stocker des **preuves / identifiants de transaction** nécessaires pour activer et vérifier l'abonnement côté serveur. La gestion, le renouvellement et la résiliation de ces abonnements s'effectuent depuis les réglages d'abonnement de votre compte Apple ID. Se reporter également aux [Mentions relatives aux abonnements](./11-mentions-abonnements-stripe.md) (section Application iOS).

## 9. Sécurité des données

Driveely met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données (chiffrement en transit, authentification sécurisée, cloisonnement des accès, scrubbing des journaux, App Attest sur endpoints sensibles lorsque disponible). Le détail de ces mesures figure dans notre [Politique de sécurité des données](./10-politique-securite-donnees.md).

## 10. Transferts de données hors Union européenne

Certains de nos sous-traitants (notamment Supabase Inc., Vercel Inc., Apple, et le cas échéant des fournisseurs Vision ou analytics) peuvent être amenés à traiter des données en dehors de l'Union européenne, y compris aux États-Unis. Dans ce cas, ces transferts sont encadrés par des garanties appropriées au sens du RGPD (clauses contractuelles types de la Commission européenne, ou tout autre mécanisme équivalent proposé par le sous-traitant concerné).

## 11. Mineurs

Le Service n'est actuellement soumis à aucune restriction technique d'âge, mais s'adresse en priorité à des utilisateurs majeurs exerçant une activité de livraison indépendante. Si vous êtes mineur, l'utilisation du Service doit se faire avec l'accord de votre représentant légal. Driveely invite tout représentant légal constatant l'utilisation du Service par un mineur sans autorisation à le contacter à [contactdriveelyai@gmail.com](mailto:contactdriveelyai@gmail.com).

## 12. Modification de la présente Politique

Driveely peut être amené à modifier la présente Politique, notamment pour refléter l'évolution du Service (par exemple l'ajout de Google/Apple Login, l'activation d'un outil d'audience, ou un nouveau fournisseur Vision) ou de la réglementation applicable. Toute modification substantielle vous sera notifiée par e-mail ou via une notification dans le Service avant son entrée en vigueur.

## 13. Contact

Pour toute question relative à la présente Politique ou à vos données personnelles : [contactdriveelyai@gmail.com](mailto:contactdriveelyai@gmail.com)
