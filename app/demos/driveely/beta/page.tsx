import { BetaProgramPage } from "@/components/margeo/beta/beta-program-page";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Programme Bêta ${PRODUCT_NAME}`,
  description:
    "Rejoins la bêta privée Driveely : teste l'assistant IA pour livreurs, signale les bugs, influence le produit.",
  robots: { index: false, follow: false },
};

export default function BetaPage() {
  return <BetaProgramPage />;
}
