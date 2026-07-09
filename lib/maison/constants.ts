export const MAISON_PREFIX = "/demos/maison";

export const MAISON_PATHS = {
  connexion: `${MAISON_PREFIX}/connexion`,
  creer: `${MAISON_PREFIX}/creer`,
  rejoindre: `${MAISON_PREFIX}/rejoindre`,
  /** @deprecated alias → connexion */
  login: `${MAISON_PREFIX}/connexion`,
  /** @deprecated alias → creer */
  signup: `${MAISON_PREFIX}/creer`,
  home: MAISON_PREFIX,
  planning: `${MAISON_PREFIX}/planning`,
  courses: `${MAISON_PREFIX}/courses`,
  nutrition: `${MAISON_PREFIX}/nutrition`,
  profils: `${MAISON_PREFIX}/profils`,
  parametres: `${MAISON_PREFIX}/parametres`,
  connexionCourses: `${MAISON_PREFIX}/connexion-courses`,
  connexionCoursesRetour: `${MAISON_PREFIX}/connexion-courses/retour`,
  onboarding: `${MAISON_PREFIX}/onboarding`,
  enAttente: `${MAISON_PREFIX}/en-attente`,
  deconnexion: `${MAISON_PREFIX}/deconnexion`,
} as const;

export const PUBLIC_MAISON_PATHS: Set<string> = new Set([
  MAISON_PATHS.connexion,
  MAISON_PATHS.creer,
  MAISON_PATHS.rejoindre,
  MAISON_PATHS.onboarding,
  MAISON_PATHS.enAttente,
  MAISON_PATHS.deconnexion,
]);

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Goûter",
};

export const GROCERY_CATEGORY_LABELS: Record<string, string> = {
  fruits: "Fruits",
  legumes: "Légumes",
  viande: "Viande",
  poisson: "Poisson",
  produits_laitiers: "Crèmerie",
  epicerie: "Épicerie",
  surgeles: "Surgelés",
  boissons: "Boissons",
};

export const GROCERY_CATEGORY_TONE: Record<string, string> = {
  fruits: "text-sage",
  legumes: "text-sage",
  viande: "text-terracotta",
  poisson: "text-terracotta",
  produits_laitiers: "text-terracotta",
  epicerie: "text-olive",
  surgeles: "text-olive",
  boissons: "text-olive",
};

export const NUTRITION_GOAL_LABELS: Record<string, string> = {
  weight_loss: "Perte de poids",
  maintain: "Maintien",
  light_gain: "Prise de masse légère",
};

export const DAY_LABELS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export const MAISON_SESSION_COOKIE = "maison_session";
