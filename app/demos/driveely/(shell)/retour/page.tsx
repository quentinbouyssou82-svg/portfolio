import { RetourHubPage } from "@/components/margeo/retour/retour-hub-page";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Retour — ${PRODUCT_NAME}`,
  description:
    "Envoie tes retours et réponds au questionnaire produit Driveely.",
  robots: { index: false, follow: false },
};

export default function RetourPage() {
  return <RetourHubPage />;
}
