import { LegalPlaceholderPage } from "@/components/margeo/legal-placeholder-page";
import { DRIVEELY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter l'équipe Driveely pour le support ou une demande RGPD.",
  robots: { index: false, follow: false },
};

export default function ContactPage() {
  return (
    <LegalPlaceholderPage
      title="Contact"
      description={`Pour toute question, demande RGPD ou suppression de compte, écris-nous à ${DRIVEELY_CONTACT_EMAIL}.`}
    />
  );
}
