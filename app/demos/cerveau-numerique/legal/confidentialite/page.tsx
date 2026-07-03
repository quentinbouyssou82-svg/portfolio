import {
  LegalShell,
  LegalSection,
  LegalList,
  LegalTable,
} from "../../_components/legal/legal-shell";

const CN = "/demos/cerveau-numerique";

export default function ConfidentialitePage() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      meta="Dernière mise à jour : 27 mai 2026 · Version 1.0"
      currentHref={`${CN}/legal/confidentialite`}
      intro="Conforme au Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la loi Informatique et Libertés modifiée."
    >
      <LegalSection n={1} title="Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées dans
          le cadre du Service Mon Cerveau Numérique est l'éditeur du service.
        </p>
        <p>
          Contact délégué à la protection des données (DPO) :
          privacy@moncerveaunumerique.com
        </p>
      </LegalSection>

      <LegalSection n={2} title="Données collectées">
        <h3 className="font-medium text-[var(--cn-fg)]">2.1 Données de compte</h3>
        <LegalList
          items={[
            "Nom, prénom, adresse email (fournis lors de l'inscription ou via Google OAuth)",
            "Identifiant de session et tokens d'authentification",
            "Heure de récapitulatif, langue, préférences d'interface",
          ]}
        />
        <h3 className="font-medium text-[var(--cn-fg)]">
          2.2 Données fonctionnelles
        </h3>
        <LegalList
          items={[
            "Tâches, sous-tâches, dates d'échéance et priorités",
            "Métadonnées de documents uploadés (nom, type, date, résultat d'analyse IA)",
            "Résultats d'analyse IA des documents (montants, dates, fournisseurs extraits)",
            "Préférences Gmail : catégories actives, règles d'archivage, vues personnalisées",
            "Événements de calendrier créés ou synchronisés depuis Google Calendar",
            "Suggestions proactives générées et leur statut (active, ignorée, réalisée)",
          ]}
        />
        <h3 className="font-medium text-[var(--cn-fg)]">
          2.3 Données Gmail (traitement transitoire)
        </h3>
        <p>
          Avec votre autorisation explicite, le Service accède à votre boîte Gmail
          en lecture. Les emails sont analysés en mémoire vive uniquement pour
          classification et suggestions. Le contenu des emails n'est jamais stocké
          de façon persistante dans notre base de données — seuls les identifiants
          techniques (message_id), les métadonnées (expéditeur, objet, date) et
          les résultats de classification sont conservés.
        </p>
        <h3 className="font-medium text-[var(--cn-fg)]">
          2.4 Données de santé (catégorie spéciale — Art. 9 RGPD)
        </h3>
        <p>
          Si vous uploadez des documents médicaux ou autorisez l'analyse d'emails
          relatifs à votre santé, ces données constituent des données sensibles au
          sens de l'Art. 9 RGPD. Leur traitement repose sur votre consentement
          explicite, recueilli lors de l'onboarding ou au moment de l'import. Vous
          pouvez retirer ce consentement à tout moment depuis les Paramètres →
          Confidentialité.
        </p>
        <h3 className="font-medium text-[var(--cn-fg)]">
          2.5 Données de facturation
        </h3>
        <p>
          Les données de paiement sont traitées directement par Stripe et ne
          transitent pas par nos serveurs. Nous conservons uniquement le statut de
          l'abonnement, le plan souscrit et la date de renouvellement.
        </p>
        <h3 className="font-medium text-[var(--cn-fg)]">2.6 Données techniques</h3>
        <LegalList
          items={[
            "Journaux d'accès techniques nécessaires à la sécurité et au débogage",
            "Tokens de notification push (endpoint navigateur)",
            "Vecteurs sémantiques (embeddings) de vos documents pour la recherche — sans texte source",
          ]}
        />
      </LegalSection>

      <LegalSection n={3} title="Finalités et bases légales (Art. 6 RGPD)">
        <LegalTable
          head={["Finalité", "Base légale"]}
          rows={[
            ["Fourniture du service (tâches, documents, agenda)", "Exécution du contrat (Art. 6.1.b)"],
            ["Analyse IA des documents et emails", "Exécution du contrat (Art. 6.1.b)"],
            ["Traitement données de santé", "Consentement explicite (Art. 9.2.a)"],
            ["Facturation et gestion abonnement", "Exécution du contrat + obligation légale (Art. 6.1.b et 6.1.c)"],
            ["Notifications et récapitulatif matinal", "Consentement (Art. 6.1.a) — révocable dans les Paramètres"],
            ["Amélioration du service et débogage", "Intérêt légitime (Art. 6.1.f)"],
            ["Conservation journaux de sécurité", "Obligation légale (Art. 6.1.c)"],
          ]}
        />
      </LegalSection>

      <LegalSection n={4} title="Sous-traitants et destinataires">
        <p>
          Vos données sont partagées avec les sous-traitants suivants, dans la
          stricte limite des finalités décrites :
        </p>
        <LegalTable
          head={["Sous-traitant", "Rôle", "Localisation"]}
          rows={[
            ["Supabase", "Base de données, authentification, stockage", "UE (AWS eu-west-3)"],
            ["Vercel", "Hébergement applicatif, CDN", "UE + USA (DPA disponible)"],
            ["Stripe", "Paiement et facturation", "USA (clauses contractuelles types)"],
            ["Resend", "Envoi d'emails transactionnels", "USA (clauses contractuelles types)"],
            ["OpenRouter / modèles IA", "Analyse IA documents et emails (traitement transitoire)", "USA (clauses contractuelles types)"],
            ["Jina AI", "Génération d'embeddings sémantiques", "Allemagne (UE)"],
            ["Google APIs", "OAuth, Gmail, Calendar (intégrations autorisées)", "USA/UE (clauses contractuelles types)"],
          ]}
        />
        <p>
          Le détail des accords de traitement des données (DPA) avec chaque
          sous-traitant est disponible à /legal/dpa.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Transferts hors UE">
        <p>
          Certains sous-traitants (Stripe, Resend, OpenRouter, Google) sont
          établis aux États-Unis. Ces transferts sont encadrés par les Clauses
          Contractuelles Types (CCT) de la Commission européenne conformément à
          l'Art. 46 RGPD, et pour Google par le DPF EU-US (Data Privacy Framework)
          en vigueur depuis juillet 2023.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Durée de conservation">
        <LegalList
          items={[
            "Données de compte actif : conservées pendant toute la durée de l'abonnement.",
            "Après résiliation ou fin de trial : données conservées 30 jours, puis suppression automatique, sauf obligation légale contraire.",
            "Données de facturation : conservées 10 ans conformément aux obligations comptables françaises.",
            "Journaux de sécurité : conservés 12 mois maximum.",
            "Embeddings sémantiques : supprimés avec le compte — aucune reconstruction de texte source possible.",
            "Données de santé : supprimées dès retrait du consentement ou clôture du compte.",
          ]}
        />
      </LegalSection>

      <LegalSection n={7} title="Vos droits (Art. 15 à 22 RGPD)">
        <p>Vous disposez des droits suivants sur vos données personnelles :</p>
        <LegalList
          items={[
            "Droit d'accès (Art. 15) : obtenir une copie de vos données.",
            "Droit de rectification (Art. 16) : corriger des données inexactes ou incomplètes.",
            "Droit à l'effacement (Art. 17) : supprimer votre compte et toutes vos données depuis les Paramètres → Compte.",
            "Droit à la portabilité (Art. 20) : exporter vos données dans un format structuré (JSON/CSV) depuis les Paramètres.",
            "Droit d'opposition (Art. 21) : vous opposer à un traitement basé sur l'intérêt légitime.",
            "Droit à la limitation (Art. 18) : geler le traitement de vos données sans les supprimer.",
            "Retrait du consentement : révoquer tout consentement accordé (notifications, données santé) sans que cela remette en cause la licéité des traitements antérieurs.",
          ]}
        />
        <p>
          Pour exercer vos droits, contactez : privacy@moncerveaunumerique.com.
          Réponse sous 30 jours.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Droit de réclamation auprès de la CNIL">
        <p>
          Si vous estimez que le traitement de vos données ne respecte pas la
          réglementation, vous disposez du droit d'introduire une réclamation
          auprès de la Commission Nationale de l'Informatique et des Libertés
          (CNIL) : www.cnil.fr/fr/plaintes
        </p>
      </LegalSection>

      <LegalSection n={9} title="Sécurité des données">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles
          appropriées pour protéger vos données :
        </p>
        <LegalList
          items={[
            "Chiffrement en transit (HTTPS/TLS obligatoire)",
            "Chiffrement au repos des données sensibles via Supabase (AES-256)",
            "Authentification forte (OAuth 2.0, tokens JWT à durée limitée)",
            "Isolation des données par utilisateur (Row Level Security Supabase)",
            "Accès administrateur restreint et journalisé",
            "Aucune clé API ou credential stocké en clair dans le code (variables d'environnement)",
          ]}
        />
        <p>
          En cas de violation de données susceptible d'engendrer un risque pour
          vos droits et libertés, nous vous en informerons dans les 72 heures
          conformément à l'Art. 33 RGPD.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Cookies et traceurs">
        <p>
          Le Service utilise uniquement des cookies strictement nécessaires au
          fonctionnement : cookie de session d'authentification (NextAuth) et
          préférences de consentement. Aucun cookie publicitaire ou de tracking
          tiers n'est déposé.
        </p>
        <p>
          La durée de vie du cookie de session est de 30 jours maximum. Vous
          pouvez supprimer les cookies depuis les paramètres de votre navigateur,
          ce qui entraînera votre déconnexion.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Décisions automatisées">
        <p>
          Le Service utilise l'intelligence artificielle pour analyser vos
          documents, classer vos emails et générer des suggestions. Ces
          traitements automatisés n'ont pas d'effet juridique sur vous et
          nécessitent toujours une validation explicite avant toute action.
          Conformément à l'Art. 22 RGPD, aucune décision à effet juridique
          significatif n'est prise de façon entièrement automatisée.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Modifications de la politique">
        <p>
          Nous pouvons modifier la présente politique pour refléter l'évolution du
          Service ou des obligations légales. Toute modification substantielle
          sera notifiée par email avec un préavis de 15 jours. La date de dernière
          mise à jour est indiquée en en-tête.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
