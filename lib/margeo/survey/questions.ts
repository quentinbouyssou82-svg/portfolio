import type {
  SurveyChoiceOption,
  SurveyQuestionType,
} from "./types";

/** Définition catalogue (fallback UI + référence seed SQL). */
export type SurveyQuestionDef = {
  questionKey: string;
  sectionKey: string;
  sectionLabel: string;
  questionType: SurveyQuestionType;
  label: string;
  options?: SurveyChoiceOption[];
  required?: boolean;
  sortOrder: number;
  stepIndex: number;
};

export const SURVEY_STEPS_META = [
  { stepIndex: 0, sectionKey: "profile", sectionLabel: "Profil" },
  { stepIndex: 1, sectionKey: "usage", sectionLabel: "Utilisation" },
  {
    stepIndex: 2,
    sectionKey: "value",
    sectionLabel: "Valeur du produit",
  },
  { stepIndex: 3, sectionKey: "pricing", sectionLabel: "Impact & prix" },
  {
    stepIndex: 4,
    sectionKey: "satisfaction",
    sectionLabel: "Satisfaction",
  },
] as const;

export const BETA_SURVEY_QUESTIONS: SurveyQuestionDef[] = [
  {
    questionKey: "delivery_tenure",
    sectionKey: "profile",
    sectionLabel: "Profil",
    questionType: "single_choice",
    label: "Depuis combien de temps effectuez-vous des livraisons ?",
    options: [
      { value: "lt_1m", label: "< 1 mois" },
      { value: "1_6m", label: "1 à 6 mois" },
      { value: "6_12m", label: "6 à 12 mois" },
      { value: "gt_1y", label: "Plus d'un an" },
    ],
    sortOrder: 1,
    stepIndex: 0,
  },
  {
    questionKey: "main_platform",
    sectionKey: "profile",
    sectionLabel: "Profil",
    questionType: "single_choice",
    label: "Quelle plateforme utilisez-vous le plus ?",
    options: [
      { value: "uber_eats", label: "Uber Eats" },
      { value: "deliveroo", label: "Deliveroo" },
      { value: "stuart", label: "Stuart" },
      { value: "several", label: "Plusieurs" },
    ],
    sortOrder: 2,
    stepIndex: 0,
  },
  {
    questionKey: "weekly_hours",
    sectionKey: "profile",
    sectionLabel: "Profil",
    questionType: "single_choice",
    label: "Combien d'heures livrez-vous par semaine ?",
    options: [
      { value: "lt_10", label: "< 10 h" },
      { value: "10_20", label: "10–20 h" },
      { value: "20_35", label: "20–35 h" },
      { value: "gt_35", label: "35 h +" },
    ],
    sortOrder: 3,
    stepIndex: 0,
  },
  {
    questionKey: "usage_frequency",
    sectionKey: "usage",
    sectionLabel: "Utilisation de Driveely",
    questionType: "single_choice",
    label: "À quelle fréquence utilisez-vous Driveely ?",
    options: [
      { value: "every_ride", label: "À chaque course" },
      { value: "several_daily", label: "Plusieurs fois par jour" },
      { value: "few_weekly", label: "Quelques fois par semaine" },
      { value: "rarely", label: "Rarement" },
    ],
    sortOrder: 4,
    stepIndex: 1,
  },
  {
    questionKey: "influences_decisions",
    sectionKey: "usage",
    sectionLabel: "Utilisation de Driveely",
    questionType: "single_choice",
    label: "Driveely influence-t-il vos décisions ?",
    options: [
      { value: "always", label: "Toujours" },
      { value: "often", label: "Souvent" },
      { value: "sometimes", label: "Parfois" },
      { value: "never", label: "Jamais" },
    ],
    sortOrder: 5,
    stepIndex: 1,
  },
  {
    questionKey: "more_confident",
    sectionKey: "usage",
    sectionLabel: "Utilisation de Driveely",
    questionType: "single_choice",
    label: "Vous sentez-vous plus confiant avant d'accepter une course ?",
    options: [
      { value: "yes_a_lot", label: "Oui beaucoup" },
      { value: "yes", label: "Oui" },
      { value: "a_bit", label: "Un peu" },
      { value: "no", label: "Non" },
    ],
    sortOrder: 6,
    stepIndex: 1,
  },
  {
    questionKey: "analysis_speed",
    sectionKey: "usage",
    sectionLabel: "Utilisation de Driveely",
    questionType: "single_choice",
    label: "Les analyses sont-elles suffisamment rapides ?",
    options: [
      { value: "excellent", label: "Excellentes" },
      { value: "good", label: "Bonnes" },
      { value: "average", label: "Moyennes" },
      { value: "too_slow", label: "Trop lentes" },
    ],
    sortOrder: 7,
    stepIndex: 1,
  },
  {
    questionKey: "results_credible",
    sectionKey: "usage",
    sectionLabel: "Utilisation de Driveely",
    questionType: "single_choice",
    label: "Les résultats vous semblent-ils crédibles ?",
    options: [
      { value: "always", label: "Toujours" },
      { value: "often", label: "Souvent" },
      { value: "sometimes", label: "Parfois" },
      { value: "rarely", label: "Rarement" },
    ],
    sortOrder: 8,
    stepIndex: 1,
  },
  {
    questionKey: "most_used_feature",
    sectionKey: "value",
    sectionLabel: "Valeur du produit",
    questionType: "single_choice",
    label: "Quelle fonctionnalité utilisez-vous le plus ?",
    options: [
      { value: "ai_analysis", label: "Analyse IA" },
      { value: "history", label: "Historique" },
      { value: "settings", label: "Paramètres" },
      { value: "other", label: "Autre" },
    ],
    sortOrder: 9,
    stepIndex: 2,
  },
  {
    questionKey: "most_valuable_feature",
    sectionKey: "value",
    sectionLabel: "Valeur du produit",
    questionType: "text",
    label: "Quelle fonctionnalité vous apporte le plus de valeur ?",
    sortOrder: 10,
    stepIndex: 2,
  },
  {
    questionKey: "missing_feature",
    sectionKey: "value",
    sectionLabel: "Valeur du produit",
    questionType: "text",
    label: "Quelle fonctionnalité manque le plus aujourd'hui ?",
    sortOrder: 11,
    stepIndex: 2,
  },
  {
    questionKey: "refused_thanks_to_app",
    sectionKey: "value",
    sectionLabel: "Valeur du produit",
    questionType: "yes_no",
    label: "Avez-vous déjà refusé une course grâce à Driveely ?",
    options: [
      { value: "yes", label: "Oui" },
      { value: "no", label: "Non" },
    ],
    sortOrder: 12,
    stepIndex: 2,
  },
  {
    questionKey: "earned_more",
    sectionKey: "pricing",
    sectionLabel: "Impact & prix",
    questionType: "single_choice",
    label: "Pensez-vous avoir gagné davantage d'argent grâce à Driveely ?",
    options: [
      { value: "yes_clearly", label: "Oui clairement" },
      { value: "probably", label: "Probablement" },
      { value: "unsure", label: "Je ne sais pas encore" },
      { value: "no", label: "Non" },
    ],
    sortOrder: 13,
    stepIndex: 3,
  },
  {
    questionKey: "would_miss",
    sectionKey: "pricing",
    sectionLabel: "Impact & prix",
    questionType: "single_choice",
    label: "Si Driveely disparaissait demain, cela vous manquerait-il ?",
    options: [
      { value: "enormously", label: "Énormément" },
      { value: "yes", label: "Oui" },
      { value: "a_bit", label: "Un peu" },
      { value: "not_really", label: "Pas vraiment" },
    ],
    sortOrder: 14,
    stepIndex: 3,
  },
  {
    questionKey: "fair_price",
    sectionKey: "pricing",
    sectionLabel: "Impact & prix",
    questionType: "single_choice",
    label: "Quel abonnement vous semblerait le plus juste ?",
    options: [
      { value: "free_only", label: "Gratuit uniquement" },
      { value: "2_99", label: "2,99 €/mois" },
      { value: "4_99", label: "4,99 €/mois" },
      { value: "6_99", label: "6,99 €/mois" },
      { value: "9_99", label: "9,99 €/mois" },
      { value: "more", label: "Plus" },
    ],
    sortOrder: 15,
    stepIndex: 3,
  },
  {
    questionKey: "willing_to_pay",
    sectionKey: "pricing",
    sectionLabel: "Impact & prix",
    questionType: "single_choice",
    label:
      "Si Driveely vous faisait réellement gagner plusieurs dizaines d'euros par semaine, seriez-vous prêt à payer un abonnement ?",
    options: [
      { value: "yes", label: "Oui" },
      { value: "maybe", label: "Peut-être" },
      { value: "no", label: "Non" },
    ],
    sortOrder: 16,
    stepIndex: 3,
  },
  {
    questionKey: "subscribe_criteria",
    sectionKey: "pricing",
    sectionLabel: "Impact & prix",
    questionType: "text",
    label: "Quel critère vous convaincrait de vous abonner ?",
    sortOrder: 17,
    stepIndex: 3,
  },
  {
    questionKey: "score_1_10",
    sectionKey: "satisfaction",
    sectionLabel: "Satisfaction",
    questionType: "scale",
    label: "Sur une échelle de 1 à 10, quelle note donneriez-vous à Driveely ?",
    options: Array.from({ length: 10 }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    })),
    sortOrder: 18,
    stepIndex: 4,
  },
  {
    questionKey: "would_recommend",
    sectionKey: "satisfaction",
    sectionLabel: "Satisfaction",
    questionType: "yes_no",
    label: "Recommanderiez-vous Driveely à un autre livreur ?",
    options: [
      { value: "yes", label: "Oui" },
      { value: "no", label: "Non" },
    ],
    sortOrder: 19,
    stepIndex: 4,
  },
  {
    questionKey: "indispensable_change",
    sectionKey: "satisfaction",
    sectionLabel: "Satisfaction",
    questionType: "text",
    label:
      "Quel est LE changement qui ferait de Driveely une application indispensable pour vous ?",
    sortOrder: 20,
    stepIndex: 4,
  },
];
