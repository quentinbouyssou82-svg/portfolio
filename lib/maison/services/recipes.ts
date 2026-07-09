export interface Recipe {
  id: string;
  title: string;
  mealTypes: Array<"breakfast" | "lunch" | "dinner" | "snack">;
  dietTags: string[];
  tags: string[];
  allergens: string[];
  imageUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit?: string;
    category: string;
    pricePerUnit: number;
  }>;
}

export const RECIPE_CATALOG: Recipe[] = [
  {
    id: "bowl-acai",
    title: "Bowl açaï, granola maison",
    mealTypes: ["breakfast"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["fruits", "rapide"],
    allergens: ["gluten", "fruits_a_coque"],
    imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&q=80",
    calories: 380,
    protein: 12,
    carbs: 52,
    fat: 14,
    cost: 4.2,
    ingredients: [
      { name: "Açaï pur", quantity: "200", unit: "g", category: "fruits", pricePerUnit: 3.5 },
      { name: "Granola maison", quantity: "80", unit: "g", category: "epicerie", pricePerUnit: 5.6 },
      { name: "Banane", quantity: "1", unit: "pièce", category: "fruits", pricePerUnit: 0.4 },
      { name: "Myrtilles", quantity: "100", unit: "g", category: "fruits", pricePerUnit: 3.2 },
    ],
  },
  {
    id: "tartines-avocat",
    title: "Tartines avocat & graines",
    mealTypes: ["breakfast", "lunch"],
    dietTags: ["omnivore", "vegetarian", "vegan"],
    tags: ["legumes", "rapide"],
    allergens: ["gluten", "sesame"],
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
    calories: 420,
    protein: 14,
    carbs: 38,
    fat: 24,
    cost: 3.8,
    ingredients: [
      { name: "Pain complet", quantity: "4", unit: "tranches", category: "epicerie", pricePerUnit: 2.4 },
      { name: "Avocat", quantity: "2", unit: "pièces", category: "fruits", pricePerUnit: 2.5 },
      { name: "Graines de courge", quantity: "30", unit: "g", category: "epicerie", pricePerUnit: 4.0 },
    ],
  },
  {
    id: "pates-sauge",
    title: "Pâtes fraîches, beurre de sauge",
    mealTypes: ["lunch", "dinner"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["comfort", "enfants"],
    allergens: ["gluten", "lactose"],
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80",
    calories: 520,
    protein: 18,
    carbs: 68,
    fat: 20,
    cost: 5.4,
    ingredients: [
      { name: "Pâtes fraîches", quantity: "500", unit: "g", category: "epicerie", pricePerUnit: 4.2 },
      { name: "Beurre demi-sel", quantity: "60", unit: "g", category: "produits_laitiers", pricePerUnit: 2.6 },
      { name: "Sauge fraîche", quantity: "1", unit: "bouquet", category: "legumes", pricePerUnit: 1.8 },
    ],
  },
  {
    id: "bowl-quinoa-halloumi",
    title: "Bowl Quinoa & Halloumi grillé",
    mealTypes: ["lunch", "dinner"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["proteines", "legumes"],
    allergens: ["lactose"],
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    calories: 480,
    protein: 28,
    carbs: 42,
    fat: 22,
    cost: 6.8,
    ingredients: [
      { name: "Quinoa", quantity: "200", unit: "g", category: "epicerie", pricePerUnit: 3.8 },
      { name: "Halloumi", quantity: "200", unit: "g", category: "produits_laitiers", pricePerUnit: 4.9 },
      { name: "Courgette", quantity: "2", unit: "pièces", category: "legumes", pricePerUnit: 1.6 },
      { name: "Tomates cerises", quantity: "200", unit: "g", category: "legumes", pricePerUnit: 2.8 },
    ],
  },
  {
    id: "veloute-brocolis",
    title: "Velouté de brocolis & croûtons",
    mealTypes: ["lunch", "dinner"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["legumes", "hiver"],
    allergens: ["gluten", "lactose"],
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
    calories: 340,
    protein: 12,
    carbs: 38,
    fat: 16,
    cost: 4.6,
    ingredients: [
      { name: "Brocolis", quantity: "1", unit: "tête", category: "legumes", pricePerUnit: 2.4 },
      { name: "Pommes de terre", quantity: "300", unit: "g", category: "legumes", pricePerUnit: 1.2 },
      { name: "Crème légère", quantity: "100", unit: "mL", category: "produits_laitiers", pricePerUnit: 1.8 },
      { name: "Pain de mie", quantity: "4", unit: "tranches", category: "epicerie", pricePerUnit: 1.5 },
    ],
  },
  {
    id: "risotto-champignons",
    title: "Risotto aux champignons des bois",
    mealTypes: ["dinner"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["comfort", "saison"],
    allergens: ["lactose"],
    imageUrl: "https://images.unsplash.com/photo-1476124366836-4ca5bbd83a86?w=400&q=80",
    calories: 490,
    protein: 14,
    carbs: 62,
    fat: 20,
    cost: 7.2,
    ingredients: [
      { name: "Riz arborio", quantity: "300", unit: "g", category: "epicerie", pricePerUnit: 3.8 },
      { name: "Champignons de Paris", quantity: "400", unit: "g", category: "legumes", pricePerUnit: 3.6 },
      { name: "Parmesan", quantity: "60", unit: "g", category: "produits_laitiers", pricePerUnit: 4.5 },
      { name: "Bouillon de légumes", quantity: "1", unit: "L", category: "epicerie", pricePerUnit: 2.0 },
    ],
  },
  {
    id: "saumon-legumes",
    title: "Pavé de saumon, légumes rôtis",
    mealTypes: ["lunch", "dinner"],
    dietTags: ["omnivore", "pescetarian"],
    tags: ["poisson", "proteines"],
    allergens: ["poisson"],
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a2d024968?w=400&q=80",
    calories: 460,
    protein: 38,
    carbs: 22,
    fat: 26,
    cost: 9.5,
    ingredients: [
      { name: "Saumon", quantity: "400", unit: "g", category: "poisson", pricePerUnit: 12.0 },
      { name: "Courge butternut", quantity: "1", unit: "pièce", category: "legumes", pricePerUnit: 4.5 },
      { name: "Épinards frais", quantity: "200", unit: "g", category: "legumes", pricePerUnit: 3.2 },
    ],
  },
  {
    id: "poulet-citron",
    title: "Poulet rôti au citron & herbes",
    mealTypes: ["lunch", "dinner"],
    dietTags: ["omnivore"],
    tags: ["viande", "famille"],
    allergens: [],
    imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80",
    calories: 520,
    protein: 42,
    carbs: 18,
    fat: 32,
    cost: 8.4,
    ingredients: [
      { name: "Poulet fermier", quantity: "1.2", unit: "kg", category: "viande", pricePerUnit: 9.8 },
      { name: "Citron", quantity: "2", unit: "pièces", category: "fruits", pricePerUnit: 0.6 },
      { name: "Pommes de terre", quantity: "600", unit: "g", category: "legumes", pricePerUnit: 1.2 },
    ],
  },
  {
    id: "lentilles-corail",
    title: "Curry de lentilles corail",
    mealTypes: ["lunch", "dinner"],
    dietTags: ["omnivore", "vegetarian", "vegan"],
    tags: ["legumineuses", "economique"],
    allergens: [],
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    calories: 410,
    protein: 22,
    carbs: 48,
    fat: 14,
    cost: 4.8,
    ingredients: [
      { name: "Lentilles corail", quantity: "300", unit: "g", category: "epicerie", pricePerUnit: 2.4 },
      { name: "Lait de coco", quantity: "200", unit: "mL", category: "epicerie", pricePerUnit: 2.2 },
      { name: "Épinards frais", quantity: "150", unit: "g", category: "legumes", pricePerUnit: 3.2 },
      { name: "Riz basmati", quantity: "250", unit: "g", category: "epicerie", pricePerUnit: 2.8 },
    ],
  },
  {
    id: "gouter-fruits",
    title: "Assortiment fruits & fromage blanc",
    mealTypes: ["snack"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["enfants", "rapide"],
    allergens: ["lactose"],
    imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&q=80",
    calories: 220,
    protein: 10,
    carbs: 32,
    fat: 6,
    cost: 3.2,
    ingredients: [
      { name: "Poires Conférence", quantity: "2", unit: "pièces", category: "fruits", pricePerUnit: 2.8 },
      { name: "Fromage blanc", quantity: "200", unit: "g", category: "produits_laitiers", pricePerUnit: 2.0 },
    ],
  },
  {
    id: "omelette-herbes",
    title: "Omelette aux fines herbes",
    mealTypes: ["breakfast", "lunch"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["rapide", "proteines"],
    allergens: ["oeufs"],
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
    calories: 320,
    protein: 22,
    carbs: 4,
    fat: 24,
    cost: 3.5,
    ingredients: [
      { name: "Œufs", quantity: "4", unit: "pièces", category: "produits_laitiers", pricePerUnit: 3.0 },
      { name: "Ciboulette", quantity: "1", unit: "bouquet", category: "legumes", pricePerUnit: 1.2 },
    ],
  },
  {
    id: "salade-composee",
    title: "Salade composée, vinaigrette moutarde",
    mealTypes: ["lunch"],
    dietTags: ["omnivore", "vegetarian"],
    tags: ["legumes", "ete"],
    allergens: ["moutarde"],
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    calories: 360,
    protein: 12,
    carbs: 28,
    fat: 22,
    cost: 5.2,
    ingredients: [
      { name: "Mesclun", quantity: "200", unit: "g", category: "legumes", pricePerUnit: 2.8 },
      { name: "Tomates", quantity: "3", unit: "pièces", category: "legumes", pricePerUnit: 1.5 },
      { name: "Maïs", quantity: "150", unit: "g", category: "legumes", pricePerUnit: 1.8 },
      { name: "Huile d'olive extra", quantity: "30", unit: "mL", category: "epicerie", pricePerUnit: 12.0 },
    ],
  },
];

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPE_CATALOG.find((r) => r.id === id);
}
