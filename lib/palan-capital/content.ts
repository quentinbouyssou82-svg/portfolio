import { PALAN_BASE } from "./constants";

export const homeContent = {
  hero: {
    eyebrow: "Cabinet d'ingénierie financière indépendant",
    title: ["Créer du levier.", "Révéler la valeur."],
    subtitle: [
      "Financement d'actifs · LLD · dette privée",
      "Fiducie-sûreté · structuration patrimoniale · levée de fonds",
      "France · Luxembourg · Émirats Arabes Unis",
    ],
    ctas: [
      { href: `${PALAN_BASE}/dirigeants`, label: "Dirigeants & cédants", variant: "gold" as const },
      { href: `${PALAN_BASE}/investisseurs`, label: "Investisseurs", variant: "outline" as const },
    ],
  },
  jurisdictions: [
    {
      label: "Juridiction principale",
      name: "France",
      detail: "Courtage · IOBSP · CIF\nConseil & exécution opérationnelle",
    },
    {
      label: "Véhicules d'investissement",
      name: "Luxembourg",
      detail: "Fonds réservés · holdings\nStructuration de véhicules",
    },
    {
      label: "Structuration internationale",
      name: "Émirats",
      detail: "Holdings · résidence fiscale\nArchitecture cross-border",
    },
  ],
  expertises: {
    tag: "Nos expertises",
    title: ["Quatre pôles,", "un capital maîtrisé."],
    intro:
      "Nous intervenons à chaque strate de la structure financière — de la trésorerie dormante aux actifs tangibles, de la dette privée à la levée de fonds. Une approche intégrée et sur mesure.",
    items: [
      {
        num: "01",
        title: "Financement & LLD",
        en: "Debt Solutions",
        desc: "Refinancement d'actifs tangibles et solutions de location longue durée. Vos actifs mobilisés, votre trésorerie préservée.",
        tags: ["Immobilier pro", "Véhicules", "Yachts & Jets", "LLD · LOA"],
      },
      {
        num: "02",
        title: "Dette privée",
        en: "Private Yield",
        desc: "Accès à des produits de dette privée sélectionnés. Transformer la trésorerie en levier de marge, sans impact sur l'exploitation.",
        tags: ["Obligations structurées", "Dette mezzanine", "Durées maîtrisées", "Sûretés négociées"],
      },
      {
        num: "03",
        title: "Structuration patrimoniale",
        en: "Wealth Engineering",
        desc: "Architecture juridique multi-juridictionnelle. Holdings, fiducie-sûreté, refinancement de participations, transmission.",
        tags: ["Fiducie-sûreté", "Holdings patrimoniales", "Transmission", "Cross-border"],
      },
      {
        num: "04",
        title: "Levée de fonds",
        en: "Capital Raising",
        desc: "Accompagnement à la levée equity et obligataire. Conception de véhicules, rédaction de memos d'investissement, sourcing d'investisseurs qualifiés.",
        tags: ["Equity", "Obligataire", "Memos IC", "Co-investissements"],
      },
    ],
  },
  convictions: {
    tag: "Notre approche",
    title: ["Trois convictions guident", "chacune de nos missions."],
    intro:
      "Les opérations que nous conduisons partagent toutes la même logique : identifier où se crée réellement la valeur, structurer les instruments qui permettent de la capter, aligner les intérêts dans la durée.",
    items: [
      {
        num: "01",
        name: "Structurer avant de financer",
        text: "Un financement bien structuré vaut toujours mieux qu'un financement abondant. Nous concevons d'abord l'architecture juridique et contractuelle — instruments de sûreté, véhicules d'interposition, flux intra-groupe — avant d'arrêter le quantum. C'est ce qui fait la différence entre un deal qui tient et un deal qui se défait à la première tension.",
      },
      {
        num: "02",
        name: "Révéler la valeur sous-jacente",
        text: "La plupart des entreprises et des patrimoines portent des actifs sous-exploités : immobilier d'exploitation, participations minoritaires, créances intra-groupe, droits incorporels. Notre travail consiste à identifier ces réserves de valeur et à concevoir les instruments — fiducie-sûreté, cession-bail, refinancement — qui permettent de les mobiliser sans les aliéner.",
      },
      {
        num: "03",
        name: "Aligner les intérêts dans la durée",
        text: "L'ingénierie financière se juge sur dix ans, pas sur un closing. Nos structurations intègrent les événements prévisibles — cession, transmission, entrée d'un partenaire — dès la conception. Un véhicule qui ne sait pas évoluer avec son actionnariat est une contrainte future. Nous construisons des structures qui accompagnent, pas qui enferment.",
      },
    ],
  },
  audiences: {
    tag: "À qui nous nous adressons",
    title: ["À chaque audience,", "son langage."],
    items: [
      {
        href: `${PALAN_BASE}/dirigeants`,
        num: "01 · Pour dirigeants & cédants",
        title: "Conseil aux dirigeants",
        text: "Création de levier financier, révélation d'actifs dormants, préparation de cession ou de transmission. Refinancement et fiducie-sûreté pour libérer la valeur sans aliéner l'actif.",
      },
      {
        href: `${PALAN_BASE}/patrimoines-prives`,
        num: "02 · Pour patrimoines privés",
        title: "Patrimoines privés",
        text: "Structuration internationale, holdings patrimoniales, optimisation de liquidités dormantes, transmission. Pour familles et dirigeants disposant d'un patrimoine complexe et multi-juridictionnel.",
      },
      {
        href: `${PALAN_BASE}/fonds`,
        num: "03 · Pour fonds d'investissement",
        title: "Conseil aux fonds",
        text: "Optimisation pré-cession de participations, préparation d'investissement equity, structuration de deals complexes — fiducie-sûreté, dette mezzanine, earn-outs, co-investissements.",
      },
      {
        href: `${PALAN_BASE}/investisseurs`,
        num: "04 · Pour investisseurs qualifiés",
        title: "Investisseurs",
        text: "Opportunités propriétaires en dette privée, obligations structurées, co-investissements equity. Exposition à des véhicules que nous avons nous-mêmes conçus ou sélectionnés.",
      },
    ],
  },
  cta: {
    text: ["Une question,", "un dossier,", "une opportunité."],
    sub: "Chaque mission commence par un entretien de cadrage.",
    button: "Demander un entretien",
  },
};

export type AudienceSection = {
  eyebrow: string;
  title: string[];
  intro?: string;
};

export type AudienceBlock = {
  eyebrow: string;
  title: string[];
  paragraphs?: string[];
  list?: { num: string; name: string; text: string }[];
  tools?: { label: string; text: string }[];
};

export type AudiencePageContent = {
  slug: string;
  meta: { title: string; description: string };
  hero: AudienceSection;
  sections: AudienceBlock[];
  cta: { text: string[]; button: string };
};

export const audiencePages: Record<string, AudiencePageContent> = {
  dirigeants: {
    slug: "dirigeants",
    meta: {
      title: "Dirigeants & cédants — Palan Capital",
      description:
        "Conseil aux dirigeants : levier financier, révélation d'actifs dormants, préparation de cession ou transmission.",
    },
    hero: {
      eyebrow: "Pour dirigeants & cédants",
      title: ["Conseil aux dirigeants,", "levier & transmission."],
      intro:
        "Création de levier financier, révélation d'actifs dormants, préparation de cession ou de transmission. Accompagnement 18 à 36 mois avant l'événement patrimonial.",
    },
    sections: [
      {
        eyebrow: "Notre rôle",
        title: ["Préparer la cession", "avant les acheteurs."],
        paragraphs: [
          "Nous intervenons auprès de dirigeants qui préparent un événement patrimonial majeur — cession, transmission, refinancement stratégique — avec une approche d'ingénieur : comprendre d'abord la structure réelle de l'actif, avant toute conversation avec un acquéreur ou un financeur.",
          "Notre rôle est de révéler la valeur que le marché n'a pas encore vue, de construire les instruments juridiques et financiers qui la capturent, et d'aligner les intérêts de toutes les parties sur la durée. Pas de conseil généraliste : une exécution sur mesure, dossier par dossier.",
        ],
      },
      {
        eyebrow: "Trois axes de mission",
        title: ["De la révélation au", "closing."],
        list: [
          {
            num: "01",
            name: "Créer du levier financier",
            text: "Refinancement d'actifs tangibles (immobilier d'exploitation, flotte, équipements), mobilisation de créances intra-groupe, mise en place de lignes de dette privée ou de dette mezzanine. L'objectif : libérer de la trésorerie sans diluer le capital, sans céder l'actif.",
          },
          {
            num: "02",
            name: "Révéler la valeur sous-jacente",
            text: "Identification des actifs dormants ou sous-exploités : participations minoritaires, immobilier d'exploitation, droits incorporels, contrats récurrents. Conception des instruments — fiducie-sûreté, cession-bail, démembrement — qui permettent de mobiliser cette valeur sans aliéner l'actif productif.",
          },
          {
            num: "03",
            name: "Optimiser la valorisation pré-cession",
            text: "Préparation 18 à 36 mois avant l'événement : restructuration capitalistique, sécurisation des flux récurrents, isolation des risques, pré-due diligence. Lorsque le banquier d'affaires ou le M&A entre en scène, l'actif est prêt à être valorisé à son juste niveau.",
          },
        ],
      },
      {
        eyebrow: "Instruments mobilisés",
        title: ["Une boîte à outils", "complète."],
        tools: [
          {
            label: "Financement & LLD",
            text: "Refinancement immobilier professionnel, location longue durée sur véhicules, yachts, jets et équipements industriels. Préservation du BFR et de la capacité d'endettement bancaire.",
          },
          {
            label: "Dette privée",
            text: "Accès à des produits de dette privée sélectionnés, durées maîtrisées, sûretés négociées. Transformer la trésorerie en levier de marge sans impact sur l'exploitation.",
          },
          {
            label: "Fiducie-sûreté",
            text: "Transfert de titres ou d'actifs en patrimoine fiduciaire, isolant ces actifs des aléas du débiteur. Protection juridiquement supérieure au nantissement classique, exécution directe sans procédure.",
          },
          {
            label: "Holdings d'interposition",
            text: "Architecture de holding française ou luxembourgeoise, optimisation des flux intra-groupe, préparation de l'apport-cession (article 150-0 B ter CGI).",
          },
        ],
      },
    ],
    cta: { text: ["Un dossier à structurer ?", "Parlons-en."], button: "Demander un entretien" },
  },
  "patrimoines-prives": {
    slug: "patrimoines-prives",
    meta: {
      title: "Patrimoines privés — Palan Capital",
      description:
        "Structuration patrimoniale internationale, holdings, liquidités dormantes et transmission.",
    },
    hero: {
      eyebrow: "Pour familles & dirigeants",
      title: ["Patrimoines privés,", "à l'échelle internationale."],
      intro:
        "Holdings patrimoniales, structuration cross-border, optimisation de liquidités dormantes, transmission. Pour familles et dirigeants disposant d'un patrimoine complexe et multi-juridictionnel.",
    },
    sections: [
      {
        eyebrow: "Notre approche",
        title: ["La complexité", "n'est pas un problème, c'est une matière."],
        paragraphs: [
          "La complexité patrimoniale appelle de la précision. Nous intervenons sur des patrimoines multi-juridictionnels (France, Luxembourg, Émirats Arabes Unis), composés d'actifs de natures variées : immobilier d'exploitation et de rendement, participations cotées et non cotées, liquidités, actifs réels, actifs alternatifs.",
          "Notre approche intègre les dimensions juridiques, fiscales et financières dès la conception. Nous construisons des structures qui tiennent dans la durée, qui s'adaptent aux évolutions réglementaires et personnelles — pas seulement au prochain exercice fiscal.",
        ],
      },
      {
        eyebrow: "Quatre axes d'intervention",
        title: ["Du capital dormant", "au capital actif."],
        list: [
          {
            num: "01",
            name: "Holdings patrimoniales",
            text: "Conception et mise en place d'architectures de holdings — françaises (SAS, SCI), luxembourgeoises (Sàrl, SOPARFI), émiraties (Free Zone). Optimisation des flux de dividendes, gestion des participations, encadrement de l'apport-cession (150-0 B ter CGI).",
          },
          {
            num: "02",
            name: "Optimisation des liquidités dormantes",
            text: "Allocation de la trésorerie excédentaire vers des produits de dette privée sélectionnés, des obligations structurées, des co-investissements equity. Sortir des produits bancaires standards pour exposer le capital à des sources de rendement contractuelles, à durées maîtrisées et sûretés négociées.",
          },
          {
            num: "03",
            name: "Structuration cross-border",
            text: "Architecture multi-juridictionnelle pour familles et dirigeants ayant des intérêts ou des projets à l'international. Conventions fiscales, choix de juridiction de résidence, fiducie luxembourgeoise, holding émiratie. Cohérence sur dix ans, pas optimisation ponctuelle.",
          },
          {
            num: "04",
            name: "Transmission et continuité",
            text: "Préparation des donations, démembrement de propriété, pacte Dutreil, fiducie-libéralité. Anticipation des successions internationales et des règles de réserve héréditaire. Une transmission qui préserve la cohésion familiale autant que l'optimisation fiscale.",
          },
        ],
      },
    ],
    cta: { text: ["Un patrimoine à structurer ?", "Confidentialité absolue."], button: "Demander un entretien" },
  },
  fonds: {
    slug: "fonds",
    meta: {
      title: "Fonds d'investissement — Palan Capital",
      description: "Conseil aux fonds : optimisation pré-cession, equity, structuration de deals complexes.",
    },
    hero: {
      eyebrow: "Pour fonds & investisseurs institutionnels",
      title: ["Conseil aux fonds,", "de l'IC au closing."],
      intro:
        "Optimisation pré-cession de participations, préparation d'investissement equity, structuration de deals complexes. Analyses IC, memos d'investissement et accompagnement post-closing.",
    },
    sections: [
      {
        eyebrow: "Notre positionnement",
        title: ["Là où le conseil généraliste", "s'arrête."],
        paragraphs: [
          "Nous intervenons à toutes les étapes du cycle d'investissement : identification des leviers de valeur pré-acquisition, structuration de l'opération, rédaction des memos d'investissement et des analyses IC, accompagnement post-closing.",
          "Notre connaissance des structures de financement alternatives — dette privée, dette mezzanine, fiducie-sûreté, véhicules d'interposition Luxembourg / Émirats — nous permet d'apporter une valeur ajoutée concrète sur les dossiers complexes, là où les approches standards atteignent leurs limites.",
        ],
      },
      {
        eyebrow: "Trois temps d'intervention",
        title: ["Avant, pendant,", "après l'opération."],
        list: [
          {
            num: "01",
            name: "Optimisation pré-cession de participation",
            text: "Préparer l'exit d'une participation pour maximiser le multiple : restructuration capitalistique, sécurisation d'actifs, pré-due diligence, lissage et sécurisation des flux récurrents. Identification des sources de valeur sous-exploitées avant que le M&A entre en scène.",
          },
          {
            num: "02",
            name: "Préparation d'investissement equity",
            text: "Analyse des leviers d'optimisation sur une cible avant prise de participation : identification des actifs sous-valorisés, opportunités de refinancement immédiates, potentiel de dette privée, sources de cash dormant. Un memo IC qui regarde la cible comme un opérateur, pas comme un analyste.",
          },
          {
            num: "03",
            name: "Structuration de deals complexes",
            text: "Fiducie-sûreté sur titres non cotés (collatéral judiciairement supérieur au nantissement), dette mezzanine et obligations convertibles, earn-outs structurés, co-investissements equity, véhicules cross-border France / Luxembourg / Émirats. Architecture sur mesure pour les opérations qui ne rentrent pas dans le moule.",
          },
        ],
      },
      {
        eyebrow: "Livrables",
        title: ["Des documents", "actionnables."],
        tools: [
          {
            label: "Memos d'investissement",
            text: "Analyse complète d'une cible : modèle économique, qualité des flux, structure capitalistique, risques juridiques et fiscaux, leviers d'optimisation post-acquisition. Format IC, exploitable directement par les équipes d'investissement.",
          },
          {
            label: "Notes de structuration",
            text: "Architecture juridique et financière proposée pour une opération : choix des véhicules, instruments de sûreté, traitement fiscal, cohabitation avec les actionnaires existants.",
          },
          {
            label: "Term sheets & documentation",
            text: "Rédaction des term sheets, pactes d'actionnaires, conventions de subordination, documents de fiducie. En coordination avec les conseils juridiques du fonds.",
          },
        ],
      },
    ],
    cta: { text: ["Un dossier complexe à structurer ?", "Confidentialité contractuelle."], button: "Échanger sur un cas" },
  },
  investisseurs: {
    slug: "investisseurs",
    meta: {
      title: "Investisseurs qualifiés — Palan Capital",
      description: "Opportunités propriétaires en dette privée, obligations structurées et co-investissements equity.",
    },
    hero: {
      eyebrow: "Pour investisseurs qualifiés",
      title: ["Opportunités propriétaires,", "dette & equity."],
      intro:
        "Dette privée, obligations structurées, co-investissements equity. Exposition à des véhicules que nous avons nous-mêmes conçus, structurés ou rigoureusement sélectionnés.",
    },
    sections: [
      {
        eyebrow: "Notre sélection",
        title: ["Une analyse fondamentale,", "pas une métrique de marché."],
        paragraphs: [
          "Nous proposons à des investisseurs qualifiés un accès à des opportunités que nous avons identifiées, structurées et, le cas échéant, co-investies. Notre sélection repose sur une analyse fondamentale des flux, des sûretés et de la structure juridique — pas sur des métriques de marché ou des classements de performance passée.",
          "Chaque opportunité fait l'objet d'une note d'analyse détaillée, partagée sous obligation de confidentialité. Les entretiens sont confidentiels et réservés aux investisseurs qualifiés au sens réglementaire (article L.411-2 II du Code monétaire et financier).",
        ],
      },
      {
        eyebrow: "Trois familles de véhicules",
        title: ["Dette, obligataire,", "equity."],
        list: [
          {
            num: "01",
            name: "Dette privée",
            text: "Lignes de financement à des sociétés non cotées, garanties par fiducie-sûreté ou nantissement de premier rang. Durées maîtrisées, sûretés négociées au cas par cas, suivi contractuel rigoureux. Une exposition au crédit privé hors de la volatilité des marchés cotés.",
          },
          {
            num: "02",
            name: "Obligations structurées",
            text: "Émissions obligataires conçues sur mesure, avec structuration des coupons, des sûretés et des covenants. Adaptables aux contraintes patrimoniales et fiscales de l'investisseur. Émissions luxembourgeoises ou françaises selon les profils.",
          },
          {
            num: "03",
            name: "Co-investissements equity",
            text: "Accès à des opérations equity propriétaires, avec ticket minimum et alignement contractuel des intérêts. Sociétés non cotées sélectionnées, secteurs maîtrisés, gouvernance encadrée. Pour investisseurs cherchant une exposition concrète et active au capital risque ou au capital développement.",
          },
        ],
      },
      {
        eyebrow: "Cadre réglementaire",
        title: ["Investisseurs", "qualifiés."],
        paragraphs: [
          "Les opportunités présentées sont strictement réservées aux investisseurs qualifiés au sens de l'article L.411-2 II du Code monétaire et financier, ou aux investisseurs assimilés (entités, professionnels, personnes physiques répondant aux critères d'expérience, de patrimoine et de connaissance des risques).",
          "SAS LIVING agit en qualité de Conseiller en Investissements Financiers (agrément en cours d'immatriculation auprès de l'ORIAS). Aucune information communiquée sur ce site ne constitue un conseil personnalisé, une sollicitation à investir ou une garantie de performance. Toute opération fait l'objet d'un entretien préalable et d'une documentation contractuelle complète.",
        ],
      },
    ],
    cta: { text: ["Une opportunité à étudier ?", "Premier échange confidentiel."], button: "Demander un entretien" },
  },
};

export const cabinetContent = {
  meta: {
    title: "Cabinet — Palan Capital",
    description: "Julien Guiraud, fondateur de Palan Capital — ingénierie financière et structuration patrimoniale.",
  },
  tag: "Le cabinet",
  name: ["Julien", "Guiraud"],
  role: "Fondateur · Président — SAS LIVING",
  bios: [
    "Vingt ans à comprendre comment la valeur circule, se contracte et se libère. Du commerce de distribution à l'assurance affinitaire, de la location longue durée à la structuration de dette privée — une même conviction traversant chaque étape : la valeur se crée en structurant finement les flux, les actifs et les contreparties.",
    "Julien Guiraud fonde Pangée en 2018, précurseur de la mobilité LLD en grande distribution, développé en partenariat avec Décathlon, Carrefour et Leroy Merlin. Depuis 2026, il étend son activité au placement de dette privée, au refinancement d'actifs et au conseil en ingénierie patrimoniale internationale, sous la marque Palan Capital.",
  ],
  details: [
    "Courtier IOBSP · ORIAS 2021",
    "Courtier en assurances · ORIAS 2012",
    "CIF · Agrément en cours",
    "France · Luxembourg · Émirats Arabes Unis",
  ],
  cta: {
    text: ["Chaque mission commence par un entretien de cadrage.", "Confidentiel, sans engagement."],
    button: "Prendre contact",
  },
};

export const contactContent = {
  meta: {
    title: "Contact — Palan Capital",
    description: "Demander un entretien de cadrage confidentiel avec Palan Capital.",
  },
  tag: "Contact",
  title: ["Une question,", "un dossier,", "une opportunité."],
  intro:
    "Chaque mission commence par un entretien de cadrage. Nous évaluons la faisabilité et la pertinence avant toute proposition chiffrée. Entretiens confidentiels, sans engagement.",
  info: [
    { label: "Email", value: "contact@palancapital.com" },
    { label: "Siège", value: "2 rue d'Austerlitz · 31000 Toulouse" },
    { label: "Juridictions", value: "France · Luxembourg · Émirats Arabes Unis" },
  ],
  formTitle: "Demander un entretien",
};

export const legalContent = {
  meta: {
    title: "Mentions légales — Palan Capital",
    description: "Mentions légales et politique de confidentialité de Palan Capital.",
  },
  sections: [
    {
      title: "Éditeur",
      body: "Ce site est édité par SAS LIVING, sous le nom commercial Palan Capital.\nSIREN : 983 940 958 · RCS Toulouse\nSiège social : 2 rue d'Austerlitz, 31000 Toulouse\nPrésident : Julien Guiraud",
    },
    {
      title: "Activités réglementées",
      body: "Intermédiaire en opérations de banque et services de paiement (IOBSP) · ORIAS 2021\nCourtier en assurances · ORIAS 2012\nConseiller en investissements financiers (CIF) · Agrément en cours d'immatriculation",
    },
    {
      id: "confidentialite",
      title: "Confidentialité",
      body: "Les informations collectées via le formulaire de contact sont utilisées exclusivement pour répondre à vos demandes. Elles ne sont transmises à aucun tiers. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant contact@palancapital.com.",
    },
    {
      title: "Hébergement",
      body: "Ce site est hébergé par Vercel Inc. · 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
    },
  ],
};
