/* Declarative configuration for the onboarding wizard.
   The step list is computed dynamically from the user's answers (adaptive
   parcours: picking "Travail / Business" adds the work-profile step, which is
   why the counter goes from x/3 to x/4 on the live site). */

export type DomainOption = {
  id: string;
  label: string;
  emoji: string;
  folder: string;
};

export const DOMAIN_OPTIONS: DomainOption[] = [
  { id: "maison", label: "Maison", emoji: "🏠", folder: "Maison" },
  { id: "famille", label: "Famille & amis", emoji: "👨‍👩‍👧", folder: "Famille" },
  { id: "sante", label: "Santé", emoji: "❤️", folder: "Santé" },
  { id: "travail", label: "Travail / Business", emoji: "💼", folder: "Business" },
  { id: "argent", label: "Argent & contrats", emoji: "💰", folder: "Argent & contrats" },
  { id: "vehicules", label: "Véhicules", emoji: "🚗", folder: "Véhicules" },
  { id: "loisirs", label: "Loisirs & projets", emoji: "🎨", folder: "Loisirs & projets" },
  { id: "numerique", label: "Numérique", emoji: "💻", folder: "Numérique" },
];

export type CardOption = {
  id: string;
  label: string;
  emoji: string;
};

export const MAIL_ORG_OPTIONS: CardOption[] = [
  { id: "mirror", label: "Recopie mon organisation Gmail existante", emoji: "📥" },
  { id: "ready", label: "Propose-moi un rangement prêt à l'emploi", emoji: "✨" },
];

export const WORK_OPTIONS: CardOption[] = [
  { id: "salarie", label: "Salarié (CDI / CDD)", emoji: "📇" },
  { id: "freelance", label: "Indépendant / Freelance", emoji: "🧑‍💻" },
  { id: "dirigeant", label: "Chef d'entreprise / Gérant", emoji: "🏢" },
];

export type StepId = "identity" | "domains" | "mailOrg" | "work";

export type StepDef = {
  id: StepId;
  section: string;
  badge: string;
  badgeEmoji: string;
  title: string;
  description: string;
};

const STEP_DEFS: Record<StepId, StepDef> = {
  identity: {
    id: "identity",
    section: "identité",
    badge: "Identité",
    badgeEmoji: "🙂",
    title: "Comment tu t'appelles ?",
    description: "Je m'en servirai pour personnaliser ton expérience.",
  },
  domains: {
    id: "domains",
    section: "Tes domaines",
    badge: "Tes domaines",
    badgeEmoji: "🧭",
    title: "Quels pans de ta vie veux-tu gérer ici ?",
    description:
      "Choisis ce qui te concerne — je ne poserai des questions que sur ces sujets, et je préparerai ton rangement en fonction. Tu pourras en ajouter d'autres plus tard.",
  },
  mailOrg: {
    id: "mailOrg",
    section: "Tes domaines",
    badge: "Tes domaines",
    badgeEmoji: "📨",
    title: "Comment veux-tu organiser tes mails et documents ?",
    description:
      "Rassure-toi : je ne touche jamais à ta boîte Gmail — aucun mail supprimé ni déplacé, aucun de tes dossiers Gmail écrasé. Je crée seulement des dossiers de rangement dans l'app.",
  },
  work: {
    id: "work",
    section: "Travail",
    badge: "Travail",
    badgeEmoji: "💼",
    title: "Côté travail, tu es plutôt…",
    description:
      "Pour activer le bon niveau de tri (un salarié n'a pas les mêmes besoins qu'un chef d'entreprise).",
  },
};

/** Adaptive step list: the "work" step only appears when the user picks the
 *  "travail" domain. */
export function computeSteps(selectedDomains: string[]): StepDef[] {
  const steps: StepDef[] = [
    STEP_DEFS.identity,
    STEP_DEFS.domains,
    STEP_DEFS.mailOrg,
  ];
  if (selectedDomains.includes("travail")) {
    steps.push(STEP_DEFS.work);
  }
  return steps;
}

export function proposedFolders(selectedDomains: string[]): string[] {
  const folders = DOMAIN_OPTIONS.filter((d) =>
    selectedDomains.includes(d.id),
  ).map((d) => d.folder);
  return folders.length > 0 ? folders : ["Personnel"];
}
