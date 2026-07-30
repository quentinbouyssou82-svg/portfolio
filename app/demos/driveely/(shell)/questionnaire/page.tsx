import { SurveyWizard } from "@/components/margeo/survey/survey-wizard";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Questionnaire — ${PRODUCT_NAME}`,
  description:
    "Questionnaire produit Driveely pour les bêta-testeurs. Tes réponses guident le développement.",
  robots: { index: false, follow: false },
};

export default function QuestionnairePage() {
  return <SurveyWizard />;
}
