/**
 * FAQ landing — source unique pour UI + JSON-LD FAQPage.
 * Copie UX-first ; mots-clés métier intégrés sans bourrage.
 */
export type DriveelyFaqItem = {
  question: string;
  answer: string;
};

export const DRIVEELY_FAQ_ITEMS: readonly DriveelyFaqItem[] = [
  {
    question: "Comment Driveely lit ma capture ?",
    answer:
      "L'IA estime le gain, la distance, le temps et les adresses à partir de ton image. Tu déposes la capture, le verdict arrive en quelques secondes. Aucune saisie. L'IA peut se tromper : vérifie toujours les chiffres clés.",
  },
  {
    question: "Quelles captures sont prises en charge ?",
    answer:
      "Les captures des apps de livraison courantes (Uber Eats, Deliveroo, Stuart, Amazon Flex). D'autres apps (Just Eat, Glovo…) sont sur la feuille de route selon la demande bêta. Driveely n'est affilié à aucune de ces plateformes.",
  },
  {
    question: "Comment le gain net est estimé ?",
    answer:
      "Driveely déduit tes coûts au km (carburant, usure, assurance) sur la distance totale — retour à vide inclus — plus le temps immobilisé. Le résultat est une estimation indicative, pas un compte comptable.",
  },
  {
    question: "Driveely aide-t-il à la rentabilité Uber Eats / Deliveroo ?",
    answer:
      "Oui : l'outil estime le gain net et le €/h avant d'accepter une proposition. L'idée est de filtrer les courses peu rentables (Uber Eats, Deliveroo, Stuart…) selon tes propres coûts — pas de conseil financier personnalisé.",
  },
  {
    question: "Ça marche pendant le compte à rebours ?",
    answer:
      "Oui. L'analyse prend en général quelques secondes. Tu décides avant l'expiration de la proposition.",
  },
  {
    question: "Mes données sont partagées avec les plateformes ?",
    answer:
      "Non. Tes captures et tes stats restent privées. Driveely est indépendant et n'est affilié à aucune plateforme de livraison.",
  },
  {
    question: "C'est gratuit ?",
    answer:
      "Oui pendant la bêta et sur le plan Découverte (2 analyses/jour). Pro (4,99 €/mois) et Elite débloquent davantage — sans prélèvement tant que le paiement Stripe n'est pas activé.",
  },
] as const;
