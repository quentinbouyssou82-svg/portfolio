export type FoodCategory =
  | "viandes"
  | "poissons"
  | "cereales"
  | "legumes"
  | "fruits"
  | "produits_laitiers"
  | "snacks"
  | "boissons";

export type FoodRating = "like" | "neutral" | "dislike";

export type ConsumptionFrequency = "often" | "sometimes" | "rarely";

export type DietType =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescetarian"
  | "flexitarian";

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  photoUrl: string;
  /** Référence future e.Leclerc (EAN / product id) */
  leclercRef?: string;
  allergens?: string[];
}

export interface MemberFoodProfile {
  dietType: DietType;
  foodRatings: Record<string, FoodRating>;
  allergies: string[];
  forbiddenFoods: string[];
  intolerances: string[];
  consumptionHabits: Record<string, ConsumptionFrequency>;
  /** Intensité d'évitement pour les aliments notés « dislike » */
  dislikeLevels: Record<string, ConsumptionFrequency>;
  preferredMeals: string[];
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  viandes: "Viandes",
  poissons: "Poissons",
  cereales: "Céréales",
  legumes: "Légumes",
  fruits: "Fruits",
  produits_laitiers: "Produits laitiers",
  snacks: "Snacks",
  boissons: "Boissons",
};

export const FOOD_CATEGORY_TONE: Record<FoodCategory, string> = {
  viandes: "from-terracotta/20 to-terracotta/5",
  poissons: "from-sky-100/80 to-blue-50/50",
  cereales: "from-amber-100/80 to-yellow-50/50",
  legumes: "from-sage-soft to-green-50/50",
  fruits: "from-orange-100/60 to-red-50/40",
  produits_laitiers: "from-blue-100/60 to-indigo-50/40",
  snacks: "from-purple-100/50 to-pink-50/40",
  boissons: "from-cyan-100/60 to-teal-50/40",
};

export const DIET_OPTIONS: Array<{ id: DietType; label: string; hint: string }> = [
  { id: "omnivore", label: "Omnivore", hint: "Viande, poisson, végétaux" },
  { id: "flexitarian", label: "Flexitarien", hint: "Peu de viande" },
  { id: "pescetarian", label: "Pesco-végétarien", hint: "Poisson, pas de viande" },
  { id: "vegetarian", label: "Végétarien", hint: "Sans viande ni poisson" },
  { id: "vegan", label: "Vegan", hint: "100 % végétal" },
];

export const FREQUENCY_OPTIONS: Array<{ id: ConsumptionFrequency; label: string; short: string }> = [
  { id: "often", label: "Souvent", short: "S" },
  { id: "sometimes", label: "Parfois", short: "P" },
  { id: "rarely", label: "Rarement", short: "R" },
];

export const DISLIKE_FREQUENCY_OPTIONS: Array<{
  id: ConsumptionFrequency;
  label: string;
  short: string;
}> = [
  { id: "often", label: "Toujours", short: "T" },
  { id: "sometimes", label: "Souvent", short: "S" },
  { id: "rarely", label: "Rarement", short: "R" },
];

export const MEAL_SLOT_OPTIONS = [
  { id: "breakfast", label: "Petit-déjeuner", hint: "Matin" },
  { id: "lunch", label: "Déjeuner", hint: "Midi" },
  { id: "dinner", label: "Dîner", hint: "Soir" },
  { id: "snack", label: "Goûter", hint: "Collation" },
] as const;

export const ALLERGY_QUICK_PICKS = [
  "Arachide",
  "Fruits à coque",
  "Lactose",
  "Gluten",
  "Œuf",
  "Soja",
  "Poisson",
  "Crustacés",
  "Sésame",
  "Céleri",
] as const;

export const INTOLERANCE_QUICK_PICKS = [
  "Lactose",
  "Gluten",
  "Fructose",
  "Histamine",
  "FODMAP",
] as const;
