export type BillingMode = "monthly" | "project";

export type PricingPlan = {
  id: "starter" | "pro" | "premium";
  name: string;
  tagline: string;
  monthlyPrice: number;
  projectPrice: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  featuredNote?: string;
  ctaLabel?: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline:
      "Pour les indépendants et petites activités qui veulent une présence professionnelle en ligne.",
    monthlyPrice: 19,
    projectPrice: 690,
    ctaLabel: "Démarrer avec Starter",
    features: [
      "Site vitrine jusqu'à 3 pages",
      "Design moderne et responsive",
      "Optimisation mobile",
      "Formulaire de contact",
      "Hébergement et maintenance inclus",
      "Optimisation des performances",
      "Intégration Google Maps et réseaux sociaux",
      "1 série de révisions",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline:
      "Pour les entreprises qui veulent transformer leurs visiteurs en prospects.",
    monthlyPrice: 39,
    projectPrice: 1490,
    highlighted: true,
    badge: "Most Popular",
    featuredNote:
      "Recommandé pour la plupart des entreprises — le meilleur équilibre entre budget, design et conversion.",
    ctaLabel: "Choisir Pro",
    features: [
      "Tout ce qui est inclus dans Starter",
      "Site complet jusqu'à 8 pages",
      "Design premium personnalisé",
      "Animations modernes et micro-interactions",
      "SEO complet de base",
      "Optimisation de conversion (CTA, parcours utilisateur)",
      "Google Analytics et suivi des leads",
      "Fonctionnalités business (devis, réservation, prise de rendez-vous)",
      "Optimisation avancée des performances",
      "3 séries de révisions",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline:
      "Pour les entreprises qui veulent automatiser et se différencier.",
    monthlyPrice: 49,
    projectPrice: 2490,
    ctaLabel: "Opter pour Premium",
    features: [
      "Tout ce qui est inclus dans Pro",
      "Intégration IA (chatbot, FAQ intelligente, assistant client)",
      "Automatisations IA simples avec outils gratuits",
      "Génération de leads assistée par IA",
      "Optimisation du contenu avec IA",
      "Audit UX approfondi",
      "Priorité sur les demandes d'évolution",
      "Révisions illimitées pendant la phase de création",
    ],
  },
];

export const comparisonRows = [
  {
    label: "Pages",
    starter: "Jusqu'à 3",
    pro: "Jusqu'à 8",
    premium: "Jusqu'à 8",
  },
  {
    label: "Design",
    starter: "Moderne & responsive",
    pro: "Premium personnalisé",
    premium: "Premium + IA",
  },
  {
    label: "Animations",
    starter: false,
    pro: true,
    premium: true,
  },
  {
    label: "SEO",
    starter: "Essentiel",
    pro: "Complet (base)",
    premium: "Contenu optimisé IA",
  },
  {
    label: "Conversion",
    starter: "Formulaire contact",
    pro: "CTA & parcours optimisés",
    premium: "Leads assistés IA",
  },
  {
    label: "Analytics & leads",
    starter: false,
    pro: true,
    premium: true,
  },
  {
    label: "Fonctionnalités business",
    starter: false,
    pro: true,
    premium: true,
  },
  {
    label: "Intégration IA",
    starter: false,
    pro: false,
    premium: true,
  },
  {
    label: "Révisions",
    starter: "1 série",
    pro: "3 séries",
    premium: "Illimitées (création)",
  },
] as const;

export const pricingFaqs = [
  {
    question: "Quelle différence entre abonnement mensuel et projet unique ?",
    answer:
      "L'abonnement mensuel inclut l'hébergement, la maintenance et les mises à jour courantes. L'achat correspond à un paiement unique pour la création du site — idéal si vous préférez éviter un abonnement.",
  },
  {
    question: "Puis-je changer d'offre plus tard ?",
    answer:
      "Oui. Vous pouvez faire évoluer votre site vers une offre supérieure à tout moment. Nous adaptons le devis en fonction des fonctionnalités à ajouter.",
  },
  {
    question: "Que couvrent les révisions incluses ?",
    answer:
      "Les révisions portent sur le contenu, la mise en page et les ajustements visuels durant la phase de création. Les ajouts majeurs de fonctionnalités font l'objet d'un devis complémentaire transparent.",
  },
  {
    question: "Proposez-vous un accompagnement après la livraison ?",
    answer:
      "Oui. Avec l'abonnement mensuel, la maintenance et le support sont inclus. En projet unique, un forfait de suivi optionnel peut être mis en place selon vos besoins.",
  },
  {
    question: "Comment se déroule le premier échange ?",
    answer:
      "Un appel ou échange par message pour comprendre votre activité, vos objectifs et votre budget. Vous recevez ensuite une proposition claire avant tout engagement.",
  },
];
