# Politique de sécurité des données

**Dernière mise à jour : [DATE À COMPLÉTER]**

## 1. Objet

Conformément à l'article 32 du RGPD, Driveely met en œuvre des mesures techniques et organisationnelles appropriées afin de garantir un niveau de sécurité adapté au risque, en tenant compte de l'état des connaissances, des coûts de mise en œuvre et de la nature des données traitées. La présente politique décrit ces mesures.

## 2. Chiffrement et transport des données

- L'ensemble des échanges entre l'Utilisateur et le Service transite exclusivement en **HTTPS**, garantissant le chiffrement des données en transit.
- Les mots de passe des Utilisateurs ne sont jamais stockés en clair : ils sont gérés par **Supabase Auth**, qui applique un hachage sécurisé des mots de passe.

## 3. Authentification et gestion des accès

- L'authentification des Utilisateurs repose sur **Supabase Auth**.
- L'accès aux données et aux ressources est contrôlé par des **jetons JWT** (JSON Web Tokens), vérifiés à chaque requête.
- Des **politiques d'accès** (policies) sont définies afin de restreindre l'accès aux données au strict nécessaire, selon le principe du moindre privilège.

## 4. Cloisonnement des données — Row Level Security

La base de données Supabase PostgreSQL utilisée par Driveely applique le mécanisme de **Row Level Security (RLS)**, garantissant qu'un Utilisateur ne peut techniquement accéder qu'aux données qui lui appartiennent (son profil, son historique d'analyses, ses captures d'écran), à l'exclusion des données des autres Utilisateurs.

## 5. Stockage des captures d'écran

Les captures d'écran importées par les Utilisateurs sont stockées dans un **bucket privé** Supabase Storage, non accessible publiquement, et soumis aux mêmes politiques d'accès restrictives que le reste des données. Elles sont automatiquement supprimées après 30 jours, conformément à la [Politique de suppression des données](./09-politique-suppression-donnees.md).

## 6. Sécurité du traitement par intelligence artificielle

Le modèle d'intelligence artificielle utilisé pour l'analyse des captures d'écran (API Vision **Mistral AI**) est sollicité en tant que sous-traitant technique. Les images sont transmises de manière sécurisée (HTTPS) aux fins exclusives de l'analyse demandée par l'Utilisateur.

## 7. Sécurité des paiements

Aucune donnée bancaire n'est collectée ni stockée par Driveely. Le traitement des paiements est intégralement délégué à **Stripe**, prestataire certifié conforme à la norme de sécurité **PCI-DSS**.

## 8. Hébergement

- Le frontend du Service est hébergé chez **Vercel**.
- Le backend (authentification, base de données, stockage) est hébergé chez **Supabase**.

Ces prestataires appliquent leurs propres mesures de sécurité physiques et logiques, dans le cadre des accords de sous-traitance conclus avec Driveely.

## 9. Gestion des incidents de sécurité

En cas de violation de données personnelles susceptible d'engendrer un risque pour les droits et libertés des personnes concernées, Driveely s'engage à :

- notifier la CNIL dans un délai de 72 heures à compter de la connaissance de la violation, conformément à l'article 33 du RGPD, sauf si la violation n'est pas susceptible d'engendrer un risque ;
- informer les Utilisateurs concernés dans les meilleurs délais lorsque la violation est susceptible d'engendrer un risque élevé pour leurs droits et libertés, conformément à l'article 34 du RGPD ;
- documenter tout incident dans un registre interne des violations.

## 10. Amélioration continue

Driveely s'engage à faire évoluer ses mesures de sécurité en fonction de l'évolution du Service, du volume de données traitées et de l'état de l'art en matière de cybersécurité.

## 11. Contact

Pour signaler une faille de sécurité ou toute question relative à la sécurité des données : [contact@driveely.app](mailto:contact@driveely.app)
