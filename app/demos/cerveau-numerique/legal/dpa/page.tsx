import {
  LegalShell,
  LegalSection,
} from "../../_components/legal/legal-shell";

const CN = "/demos/cerveau-numerique";

export default function DpaPage() {
  return (
    <LegalShell
      title="DPA — Accord de traitement des données"
      meta="Version initiale — 22 mai 2026"
      currentHref={`${CN}/legal/dpa`}
    >
      <LegalSection n={1} title="Objet">
        <p>
          Le présent DPA encadre le traitement des données personnelles effectué
          pour le compte des clients utilisateurs de Mon Cerveau Numérique.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Instructions du client">
        <p>
          Les traitements sont réalisés uniquement sur instruction documentée du
          client, dans les limites des fonctionnalités activées dans
          l'application.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Sécurité">
        <p>
          Mesures techniques et organisationnelles raisonnables : authentification,
          chiffrement en transit, contrôles d'accès, journalisation et principe du
          moindre privilège.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Sous-traitants ultérieurs">
        <p>
          Sous-traitants utilisés : Supabase, Vercel, Stripe, Resend, OpenRouter,
          Google APIs. La liste est mise à jour selon l'évolution du service.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Assistance RGPD">
        <p>
          Le fournisseur assiste le client pour les demandes de droits, la
          sécurité, les notifications d'incident et la documentation de conformité
          raisonnablement requise.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Restitution et suppression">
        <p>
          À la fin du contrat, les données sont restituées ou supprimées selon les
          mécanismes disponibles et les obligations légales de conservation.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
