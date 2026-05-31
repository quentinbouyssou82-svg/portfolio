import {
  bellaVistaCode,
  novaHabitatCode,
  titanFitnessCode,
} from "./project-code-samples";

export type CaseStudy = {
  objectives: string[];
  uxUi: string[];
  technical: string[];
  expectedResult: string;
};

export type CodeToken = {
  text: string;
  type:
    | "keyword"
    | "string"
    | "tag"
    | "attr"
    | "function"
    | "comment"
    | "plain"
    | "number"
    | "type";
};

export type CodeLine = {
  number: number;
  tokens: CodeToken[];
};

export type CodeFile = {
  filename: string;
  lines: CodeLine[];
};

export type ConceptProject = {
  id: string;
  name: string;
  sector: string;
  image: string;
  description: string;
  features: string[];
  technologies: string[];
  demoPath: string;
  caseStudy: CaseStudy;
  codeFiles: CodeFile[];
  highlight: string;
};

const demoBase = process.env.NEXT_PUBLIC_DEMO_BASE_URL?.replace(/\/$/, "");

function buildDemoPath(slug: string) {
  if (demoBase) return `${demoBase}/${slug}`;
  return `/demos/${slug}`;
}

export const conceptProjects: ConceptProject[] = [
  {
    id: "bella-vista",
    name: "Bella Vista",
    sector: "Restaurant gastronomique",
    image: "/projects/bella-vista.png",
    description:
      "Expérience immersive pour un restaurant italien premium. Design luxueux, réservation en ligne et galerie visuelle pour valoriser l'art culinaire.",
    features: [
      "Réservation en ligne",
      "Galerie immersive",
      "Présentation du chef",
      "Témoignages clients",
      "Carte interactive",
      "Animations au scroll",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],
    demoPath: buildDemoPath("bella-vista"),
    highlight: "Design premium + expérience utilisateur",
    caseStudy: {
      objectives: [
        "Augmenter les réservations en ligne sans friction.",
        "Créer une image Michelin : luxe, élégance, immersion.",
        "Mettre en valeur le chef, le menu et l'ambiance du lieu.",
      ],
      uxUi: [
        "Palette noir profond, blanc cassé et touches dorées pour un positionnement haut de gamme.",
        "Hero plein écran avec CTA de réservation immédiatement visible.",
        "Typographie serif (Cormorant) + sans-serif pour un contraste élégant.",
        "Parcours one-page fluide : menu → chef → galerie → réservation.",
      ],
      technical: [
        "Architecture composants modulaires avec animations Framer Motion.",
        "Images optimisées via next/image (Unsplash, lazy loading).",
        "Formulaire de réservation avec états loading/success.",
        "Navigation sticky responsive avec menu mobile animé.",
      ],
      expectedResult:
        "Un site qui donne l'impression d'un restaurant étoilé et incite à réserver en moins de 30 secondes.",
    },
    codeFiles: bellaVistaCode,
  },
  {
    id: "titan-fitness",
    name: "Titan Fitness",
    sector: "Salle de sport premium",
    image: "/projects/titan-fitness.png",
    description:
      "Landing dynamique inspirée des startups fitness américaines. Outils interactifs de conversion pour transformer les visiteurs en abonnés.",
    features: [
      "Calculateur IMC",
      "Simulateur d'objectif sportif",
      "FAQ interactive",
      "Cartes d'abonnement",
      "Formulaire d'essai gratuit",
      "Témoignages transformations",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],
    demoPath: buildDemoPath("titan-fitness"),
    highlight: "Marketing + conversion + design moderne",
    caseStudy: {
      objectives: [
        "Convertir les visiteurs en abonnés via des CTA impactants.",
        "Démontrer une offre premium avec preuve sociale et résultats.",
        "Engager l'utilisateur avec des outils interactifs (IMC, objectifs).",
      ],
      uxUi: [
        "Design énergique dark + accent lime, inspiré des startups fitness US.",
        "Sections à fort impact visuel : hero, stats, programmes, tarifs.",
        "Cartes d'abonnement avec plan Pro mis en avant (best seller).",
        "FAQ accordion et formulaire d'essai gratuit en fin de parcours.",
      ],
      technical: [
        "Calculateur IMC et simulateur d'objectif en logique client pure.",
        "Composants réutilisables : cards, stats bar, pricing tiers.",
        "Animations scroll reveal et micro-interactions sur les CTA.",
        "Mobile-first avec navigation sticky et menu hamburger.",
      ],
      expectedResult:
        "Une vitrine qui ressemble à une startup fitness valorisée plusieurs millions, orientée conversion.",
    },
    codeFiles: titanFitnessCode,
  },
  {
    id: "nova-habitat",
    name: "Nova Habitat",
    sector: "Rénovation & travaux",
    image: "/projects/nova-habitat.png",
    description:
      "Plateforme de génération de leads pour une entreprise de rénovation. Devis avancé, estimation automatique et assistant IA simulé.",
    features: [
      "Formulaire de devis avancé",
      "Galerie avant/après",
      "Estimation automatique",
      "Chatbot IA simulé",
      "Calculateur de budget",
      "Carte zone d'intervention",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ],
    demoPath: buildDemoPath("nova-habitat"),
    highlight: "Fonctionnalités business + IA + automatisation",
    caseStudy: {
      objectives: [
        "Générer des demandes de devis qualifiées.",
        "Rassurer les prospects avec preuves sociales et transparence.",
        "Automatiser la première étape commerciale (estimation, orientation).",
      ],
      uxUi: [
        "Design professionnel clair : navy + bleu, inspiré des leaders du BTP.",
        "Galerie avant/après interactive pour prouver l'expertise.",
        "Double parcours : devis détaillé + calculateur budget rapide.",
        "Chatbot flottant pour répondre aux questions fréquentes 24/7.",
      ],
      technical: [
        "Estimation dynamique basée sur type de projet et surface (m²).",
        "Chatbot IA simulé avec matching par mots-clés (devis, délai, prix).",
        "Slider budget avec niveaux de finition (standard/premium/luxe).",
        "Formulaire multi-champs avec validation et état de succès.",
      ],
      expectedResult:
        "Un site qui positionne Nova Habitat comme leader du secteur et capture des leads qualifiés.",
    },
    codeFiles: novaHabitatCode,
  },
];
