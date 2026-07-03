import {
  LegalShell,
  LegalSection,
  LegalList,
} from "../../_components/legal/legal-shell";

const CN = "/demos/cerveau-numerique";

export default function CguPage() {
  return (
    <LegalShell
      title="Conditions Générales d'Utilisation"
      meta="Dernière mise à jour : 27 mai 2026 · Version 1.0"
      currentHref={`${CN}/legal/cgu`}
      intro="En accédant au service Mon Cerveau Numérique, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service."
    >
      <LegalSection n={1} title="Objet et éditeur">
        <p>
          Mon Cerveau Numérique (ci-après « le Service ») est une application web
          personnelle d'organisation de vie — gestion documentaire intelligente
          (GED), to-do list proactive, gestion de l'agenda, analyse de la
          messagerie Gmail et suggestions proactives basées sur l'intelligence
          artificielle.
        </p>
        <p>
          Le Service est édité et opéré à titre personnel. Contact :
          support@moncerveaunumerique.com
        </p>
      </LegalSection>

      <LegalSection n={2} title="Description du service">
        <p>Le Service comprend notamment :</p>
        <LegalList
          items={[
            "Upload, classement et recherche de documents personnels (PDF, images) via IA",
            "Gestion de tâches avec priorités dynamiques et rappels",
            "Connexion à Gmail pour catégoriser, trier et résumer les emails (lecture seule sauf actions explicites)",
            "Synchronisation avec Google Calendar pour la gestion d'événements",
            "Génération de suggestions proactives basées sur vos documents et votre profil",
            "Notifications push, email et récapitulatif matinal",
          ]}
        />
        <p>
          Le Service est accessible depuis tout navigateur web, sans
          installation. Il est optimisé pour une utilisation sur iPhone et
          ordinateur.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Accès et compte utilisateur">
        <p>
          L'accès au Service requiert la création d'un compte via Google OAuth ou
          email/mot de passe. L'utilisateur est seul responsable de la
          confidentialité de ses identifiants et de toutes les actions effectuées
          depuis son compte.
        </p>
        <p>
          Toute utilisation frauduleuse ou non autorisée du compte doit être
          signalée sans délai à support@moncerveaunumerique.com.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Abonnement, période d'essai et facturation">
        <p>
          <strong className="text-[var(--cn-fg)]">Période d'essai :</strong> tout
          nouvel utilisateur bénéficie d'un accès complet de 30 jours sans
          engagement ni carte bancaire requise à l'inscription.
        </p>
        <p>
          <strong className="text-[var(--cn-fg)]">Abonnement payant :</strong> à
          l'issue du trial, un abonnement est requis pour continuer. Les tarifs en
          vigueur sont affichés sur la page d'abonnement. Tous les prix sont
          exprimés en euros TTC. La facturation est mensuelle ou annuelle selon le
          plan choisi, via Stripe.
        </p>
        <p>
          <strong className="text-[var(--cn-fg)]">Résiliation :</strong>{" "}
          l'utilisateur peut résilier son abonnement à tout moment depuis son
          espace personnel. La résiliation prend effet à la fin de la période en
          cours, sans remboursement au prorata sauf obligation légale contraire.
        </p>
        <p>
          <strong className="text-[var(--cn-fg)]">Droit de rétractation :</strong>{" "}
          conformément à l'article L221-18 du Code de la consommation,
          l'utilisateur dispose d'un délai de 14 jours à compter de la
          souscription pour exercer son droit de rétractation, sauf renonciation
          expresse pour accès immédiat au service.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Intégrations tierces et permissions">
        <p>
          Le Service peut demander accès à des services tiers (Gmail, Google
          Calendar, Google Drive) via OAuth. Ces accès sont limités aux
          permissions strictement nécessaires et révocables à tout moment depuis
          les paramètres de votre compte Google ou depuis le Service.
        </p>
        <p>
          <strong className="text-[var(--cn-fg)]">
            Principe de confirmation :
          </strong>{" "}
          aucune action irréversible (suppression d'email, envoi de message,
          modification d'agenda) n'est effectuée sans validation explicite de
          l'utilisateur. L'IA propose, l'utilisateur décide.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Propriété intellectuelle">
        <p>
          Le Service, son code, son design et ses contenus éditoriaux sont
          protégés par le droit d'auteur. Toute reproduction, adaptation ou
          diffusion sans autorisation préalable est interdite.
        </p>
        <p>
          L'utilisateur reste propriétaire de l'intégralité des données et
          documents qu'il importe dans le Service. Il accorde uniquement une
          licence limitée, non exclusive, nécessaire au fonctionnement technique
          du Service (analyse, indexation, chiffrement).
        </p>
      </LegalSection>

      <LegalSection n={7} title="Usages interdits">
        <p>Il est interdit d'utiliser le Service pour :</p>
        <LegalList
          items={[
            "Toute activité illicite ou contraire à l'ordre public",
            "Tenter de contourner les mécanismes de sécurité ou d'authentification",
            "Introduire des virus, malwares ou tout code malveillant",
            "Tenter d'accéder aux données d'autres utilisateurs",
            "Utiliser le Service à des fins commerciales non autorisées (revente, scraping)",
            "Surcharger les infrastructures de manière abusive",
          ]}
        />
        <p>
          Tout manquement peut entraîner la suspension ou résiliation immédiate du
          compte, sans préjudice des recours légaux.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Disponibilité et maintenance">
        <p>
          Le Service est fourni avec une obligation de moyens. Des interruptions
          de service peuvent survenir pour maintenance, mise à jour ou incident
          technique. L'éditeur s'efforce de communiquer par avance les
          maintenances planifiées.
        </p>
        <p>
          En tant que service SaaS hébergé sur Vercel et Supabase, la
          disponibilité est soumise aux conditions de ces prestataires.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Limitation de responsabilité">
        <p>
          L'éditeur ne peut être tenu responsable de : pertes de données
          imputables à l'utilisateur, interruptions de services tiers, décisions
          prises par l'utilisateur sur la base des suggestions IA, ou tout dommage
          indirect lié à l'utilisation du Service.
        </p>
        <p>
          Les suggestions générées par l'IA sont indicatives et ne constituent pas
          des conseils financiers, médicaux ou juridiques. L'utilisateur reste
          seul décisionnaire.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la Politique de
          confidentialité, qui fait partie intégrante des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Modification des CGU">
        <p>
          L'éditeur se réserve le droit de modifier les présentes CGU à tout
          moment. Les modifications sont notifiées par email avec un préavis de 15
          jours pour les changements substantiels. La poursuite de l'utilisation
          du Service après ce délai vaut acceptation des nouvelles conditions.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Droit applicable et juridiction">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, les
          parties s'efforceront de trouver une solution amiable. À défaut, les
          tribunaux compétents de Paris seront seuls compétents.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Contact">
        <p>
          Pour toute question relative aux présentes CGU :
          support@moncerveaunumerique.com
        </p>
        <p className="text-[var(--cn-faint)]">
          Ces CGU ont été rédigées conformément au droit français et à la
          réglementation européenne applicable.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
