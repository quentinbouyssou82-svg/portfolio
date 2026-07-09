import type { FoodCategory, FoodItem } from "@/lib/maison/foods/types";
import { getFoodImageUrl } from "@/lib/maison/foods/food-image-map";

function food(
  id: string,
  name: string,
  category: FoodCategory,
  extras?: Partial<FoodItem>,
): FoodItem {
  return {
    id,
    name,
    category,
    photoUrl: getFoodImageUrl(id),
    ...extras,
  };
}

/** ~100 aliments — illustrations Fluent Emoji 3D (/public/food-assets-3d/) */
export const FOOD_CATALOG: FoodItem[] = [
  food("poulet", "Poulet", "viandes", { leclercRef: "LCL-POULET" }),
  food("boeuf", "Bœuf", "viandes", { leclercRef: "LCL-BOEUF" }),
  food("porc", "Porc", "viandes", { leclercRef: "LCL-PORC" }),
  food("agneau", "Agneau", "viandes", { leclercRef: "LCL-AGNEAU" }),
  food("dinde", "Dinde", "viandes", { leclercRef: "LCL-DINDE" }),
  food("canard", "Canard", "viandes"),
  food("jambon", "Jambon", "viandes", { leclercRef: "LCL-JAMBON" }),
  food("saucisse", "Saucisse", "viandes"),
  food("steak_hache", "Steak haché", "viandes", { leclercRef: "LCL-HACHE" }),
  food("lardons", "Lardons", "viandes"),
  food("merguez", "Merguez", "viandes"),
  food("foie_gras", "Foie gras", "viandes"),

  food("saumon", "Saumon", "poissons", { leclercRef: "LCL-SAUMON", allergens: ["poisson"] }),
  food("cabillaud", "Cabillaud", "poissons", { allergens: ["poisson"] }),
  food("thon", "Thon", "poissons", { leclercRef: "LCL-THON", allergens: ["poisson"] }),
  food("crevettes", "Crevettes", "poissons", { allergens: ["crustaces"] }),
  food("moules", "Moules", "poissons", { allergens: ["crustaces"] }),
  food("sardines", "Sardines", "poissons", { allergens: ["poisson"] }),
  food("truite", "Truite", "poissons", { allergens: ["poisson"] }),
  food("colin", "Colin", "poissons", { allergens: ["poisson"] }),
  food("surimi", "Surimi", "poissons", { allergens: ["poisson", "crustaces"] }),
  food("anchois", "Anchois", "poissons", { allergens: ["poisson"] }),

  food("riz", "Riz", "cereales", { leclercRef: "LCL-RIZ" }),
  food("pates", "Pâtes", "cereales", { leclercRef: "LCL-PATES", allergens: ["gluten"] }),
  food("pain", "Pain", "cereales", { leclercRef: "LCL-PAIN", allergens: ["gluten"] }),
  food("quinoa", "Quinoa", "cereales"),
  food("semoule", "Semoule", "cereales", { allergens: ["gluten"] }),
  food("couscous", "Couscous", "cereales", { allergens: ["gluten"] }),
  food("avoine", "Avoine", "cereales", { allergens: ["gluten"] }),
  food("ble", "Blé / Farine", "cereales", { allergens: ["gluten"] }),
  food("polenta", "Polenta", "cereales"),
  food("lentilles", "Lentilles", "cereales"),
  food("pois_chiches", "Pois chiches", "cereales"),
  food("haricots_rouges", "Haricots rouges", "cereales"),

  food("tomate", "Tomate", "legumes"),
  food("carotte", "Carotte", "legumes"),
  food("courgette", "Courgette", "legumes"),
  food("aubergine", "Aubergine", "legumes"),
  food("poivron", "Poivron", "legumes"),
  food("brocoli", "Brocoli", "legumes"),
  food("epinards", "Épinards", "legumes"),
  food("salade", "Salade", "legumes"),
  food("champignon", "Champignon", "legumes"),
  food("pomme_de_terre", "Pomme de terre", "legumes"),
  food("patate_douce", "Patate douce", "legumes"),
  food("haricots_verts", "Haricots verts", "legumes"),
  food("petits_pois", "Petits pois", "legumes"),
  food("concombre", "Concombre", "legumes"),
  food("chou_fleur", "Chou-fleur", "legumes"),

  food("pomme", "Pomme", "fruits"),
  food("banane", "Banane", "fruits"),
  food("orange", "Orange", "fruits"),
  food("fraise", "Fraise", "fruits"),
  food("raisin", "Raisin", "fruits"),
  food("poire", "Poire", "fruits"),
  food("kiwi", "Kiwi", "fruits"),
  food("mangue", "Mangue", "fruits"),
  food("ananas", "Ananas", "fruits"),
  food("cerise", "Cerise", "fruits"),
  food("peche", "Pêche", "fruits"),
  food("fruits_rouges", "Fruits rouges", "fruits"),

  food("lait", "Lait", "produits_laitiers", { leclercRef: "LCL-LAIT", allergens: ["lactose"] }),
  food("fromage", "Fromage", "produits_laitiers", { leclercRef: "LCL-FROMAGE", allergens: ["lactose"] }),
  food("yaourt", "Yaourt", "produits_laitiers", { allergens: ["lactose"] }),
  food("beurre", "Beurre", "produits_laitiers", { allergens: ["lactose"] }),
  food("creme", "Crème", "produits_laitiers", { allergens: ["lactose"] }),
  food("mozzarella", "Mozzarella", "produits_laitiers", { allergens: ["lactose"] }),
  food("emmental", "Emmental", "produits_laitiers", { allergens: ["lactose"] }),
  food("fromage_blanc", "Fromage blanc", "produits_laitiers", { allergens: ["lactose"] }),
  food("parmesan", "Parmesan", "produits_laitiers", { allergens: ["lactose"] }),
  food("oeuf", "Œuf", "produits_laitiers", { leclercRef: "LCL-OEUF", allergens: ["oeuf"] }),

  food("chocolat", "Chocolat", "snacks"),
  food("biscuit", "Biscuit", "snacks", { allergens: ["gluten"] }),
  food("chips", "Chips", "snacks"),
  food("barre_cereales", "Barre céréales", "snacks"),
  food("gateau", "Gâteau", "snacks", { allergens: ["gluten", "oeuf"] }),
  food("crepe", "Crêpe", "snacks", { allergens: ["gluten", "oeuf"] }),
  food("gaufre", "Gaufre", "snacks", { allergens: ["gluten"] }),
  food("popcorn", "Popcorn", "snacks"),
  food("miel", "Miel", "snacks"),
  food("confiture", "Confiture", "snacks"),

  food("eau", "Eau", "boissons"),
  food("jus_orange", "Jus d'orange", "boissons"),
  food("cafe", "Café", "boissons"),
  food("the", "Thé", "boissons"),
  food("soda", "Soda", "boissons"),
  food("vin", "Vin", "boissons"),
  food("biere", "Bière", "boissons"),
  food("smoothie", "Smoothie", "boissons"),

  food("huile_olive", "Huile d'olive", "cereales"),
  food("moutarde", "Moutarde", "cereales"),
  food("mayonnaise", "Mayonnaise", "cereales", { allergens: ["oeuf"] }),
  food("ketchup", "Ketchup", "cereales"),
  food("basilic", "Basilic / Herbes", "legumes"),
  food("ail", "Ail", "legumes"),
  food("oignon", "Oignon", "legumes"),
  food("citron", "Citron", "fruits"),
  food("avocat", "Avocat", "fruits"),
  food("noix", "Noix", "snacks", { allergens: ["fruits_a_coque"] }),
  food("amandes", "Amandes", "snacks", { allergens: ["fruits_a_coque"] }),
];

export const FOOD_BY_ID = Object.fromEntries(FOOD_CATALOG.map((f) => [f.id, f])) as Record<
  string,
  FoodItem
>;

export const FOOD_CATEGORIES_ORDER: FoodCategory[] = [
  "viandes",
  "poissons",
  "cereales",
  "legumes",
  "fruits",
  "produits_laitiers",
  "snacks",
  "boissons",
];

export function foodsByCategory(category: FoodCategory): FoodItem[] {
  return FOOD_CATALOG.filter((f) => f.category === category);
}

export function foodImageUrl(foodId: string): string {
  return getFoodImageUrl(foodId);
}
