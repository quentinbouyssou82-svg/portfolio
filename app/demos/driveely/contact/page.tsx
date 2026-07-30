import { LegalPlaceholderPage } from "@/components/margeo/legal-placeholder-page";
import { DRIVEELY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildDriveelyMetadata({
  title: "Contact",
  description:
    "Contacter l'équipe Driveely pour le support, une question produit ou une demande RGPD.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPlaceholderPage
      title="Contact"
      description={`Pour toute question, demande RGPD ou suppression de compte, écris-nous à ${DRIVEELY_CONTACT_EMAIL}.`}
    />
  );
}
