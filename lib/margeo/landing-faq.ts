/**
 * FAQ landing — source unique pour UI + JSON-LD FAQPage.
 * Alignée produit réel (capture → net estimé → verdict) + pricing actuel.
 */
export type DriveelyFaqItem = {
  question: string;
  answer: string;
};

export const DRIVEELY_FAQ_ITEMS: readonly DriveelyFaqItem[] = [
  {
    question: "C’est quoi Driveely ?",
    answer:
      "Driveely est le comptable intelligent du livreur : vous capturez une offre, l’app estime ce qu’il vous reste après vos coûts, et vous donne un verdict clair (accepter, vérifier ou refuser).",
  },
  {
    question: "Comment Driveely lit ma capture ?",
    answer:
      "L’IA extrait gain, distance, temps et adresses à partir de votre image. Vous déposez la capture, le verdict arrive en quelques secondes. L’IA peut se tromper : vérifiez toujours les chiffres clés.",
  },
  {
    question: "Comment le gain net est estimé ?",
    answer:
      "Driveely croise l’offre avec vos coûts au km (carburant, usure, etc.), le retour à vide et votre objectif €/h. Le résultat est une estimation indicative — pas un compte comptable officiel.",
  },
  {
    question: "En quoi c’est différent des plateformes ?",
    answer:
      "Les plateformes montrent surtout ce qu’elles vous paient. Driveely estime ce que la course vous rapporte vraiment après vos coûts, puis interprète le résultat avec un verdict.",
  },
  {
    question: "Ça marche pendant le compte à rebours ?",
    answer:
      "Oui. L’analyse prend en général quelques secondes. Vous décidez avant l’expiration de la proposition.",
  },
  {
    question: "Mes données sont partagées avec les plateformes ?",
    answer:
      "Non. Vos captures et vos stats restent privées. Driveely est indépendant et n’est affilié à aucune plateforme de livraison.",
  },
  {
    question: "C’est gratuit ?",
    answer:
      "Oui : 2 analyses par jour gratuitement. Driveely Premium (12,99 €/mois ou 99,99 €/an) débloque les analyses illimitées, avec 14 jours d’essai.",
  },
] as const;
