import { LegalPlaceholderPage } from "@/components/margeo/legal-placeholder-page";
import { UBERLY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter l'équipe Uberly pour le support ou une demande RGPD.",
  robots: { index: false, follow: false },
};

export default function ContactPage() {
  return (
    <LegalPlaceholderPage
      title="Contact"
      description={`Pour toute question, demande RGPD ou suppression de compte, écris-nous à ${UBERLY_CONTACT_EMAIL}.`}
    />
  );
}
