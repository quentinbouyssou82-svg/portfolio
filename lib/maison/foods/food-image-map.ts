/**
 * Mapping aliments → Microsoft Fluent Emoji 3D (assets locaux).
 * Source : https://github.com/microsoft/fluentui-emoji (MIT — sans filigrane)
 * Régénérer : npm run food-assets:fetch
 */
export const FOOD_IMAGE_BASE = "/food-assets-3d";

export const FOOD_IMAGE_PLACEHOLDER = `${FOOD_IMAGE_BASE}/placeholder.png`;

export type FoodAsset3D = {
  id: string;
  file: string;
  /** Nom du dossier Fluent Emoji (assets/{name}/3D/) */
  fluent: string;
};

/** 100 aliments — 100 illustrations 3D distinctes */
export const FOOD_ASSETS_3D: FoodAsset3D[] = [
  { id: "poulet", file: "chicken.png", fluent: "Poultry leg" },
  { id: "boeuf", file: "beef.png", fluent: "Cut of meat" },
  { id: "porc", file: "pork.png", fluent: "Pig face" },
  { id: "agneau", file: "lamb.png", fluent: "Goat" },
  { id: "dinde", file: "turkey.png", fluent: "Turkey" },
  { id: "canard", file: "duck.png", fluent: "Duck" },
  { id: "jambon", file: "ham.png", fluent: "Bacon" },
  { id: "saucisse", file: "sausage.png", fluent: "Hot dog" },
  { id: "steak_hache", file: "ground-beef.png", fluent: "Hamburger" },
  { id: "lardons", file: "bacon.png", fluent: "Meat on bone" },
  { id: "merguez", file: "merguez.png", fluent: "Stuffed flatbread" },
  { id: "foie_gras", file: "foie-gras.png", fluent: "Pot of food" },

  { id: "saumon", file: "salmon.png", fluent: "Fish" },
  { id: "cabillaud", file: "cod.png", fluent: "Blowfish" },
  { id: "thon", file: "tuna.png", fluent: "Dolphin" },
  { id: "crevettes", file: "shrimp.png", fluent: "Fried shrimp" },
  { id: "moules", file: "mussels.png", fluent: "Oyster" },
  { id: "sardines", file: "sardines.png", fluent: "Fish cake with swirl" },
  { id: "truite", file: "trout.png", fluent: "Tropical fish" },
  { id: "colin", file: "fish.png", fluent: "Bento box" },
  { id: "surimi", file: "surimi.png", fluent: "Sushi" },
  { id: "anchois", file: "anchovy.png", fluent: "Squid" },

  { id: "riz", file: "rice.png", fluent: "Cooked rice" },
  { id: "pates", file: "pasta.png", fluent: "Spaghetti" },
  { id: "pain", file: "bread.png", fluent: "Baguette bread" },
  { id: "quinoa", file: "quinoa.png", fluent: "Curry rice" },
  { id: "semoule", file: "semolina.png", fluent: "Steaming bowl" },
  { id: "couscous", file: "couscous.png", fluent: "Falafel" },
  { id: "avoine", file: "oats.png", fluent: "Oden" },
  { id: "ble", file: "wheat.png", fluent: "Bread" },
  { id: "polenta", file: "polenta.png", fluent: "Ear of corn" },
  { id: "lentilles", file: "lentils.png", fluent: "Beans" },
  { id: "pois_chiches", file: "chickpeas.png", fluent: "Dango" },
  { id: "haricots_rouges", file: "kidney-beans.png", fluent: "Canned food" },

  { id: "tomate", file: "tomato.png", fluent: "Tomato" },
  { id: "carotte", file: "carrot.png", fluent: "Carrot" },
  { id: "courgette", file: "zucchini.png", fluent: "Melon" },
  { id: "aubergine", file: "eggplant.png", fluent: "Eggplant" },
  { id: "poivron", file: "pepper.png", fluent: "Bell pepper" },
  { id: "brocoli", file: "broccoli.png", fluent: "Broccoli" },
  { id: "epinards", file: "spinach.png", fluent: "Leafy green" },
  { id: "salade", file: "salad.png", fluent: "Green salad" },
  { id: "champignon", file: "mushroom.png", fluent: "Mushroom" },
  { id: "pomme_de_terre", file: "potato.png", fluent: "Potato" },
  { id: "patate_douce", file: "sweet-potato.png", fluent: "Roasted sweet potato" },
  { id: "haricots_verts", file: "green-beans.png", fluent: "Hot pepper" },
  { id: "petits_pois", file: "peas.png", fluent: "Pea pod" },
  { id: "concombre", file: "cucumber.png", fluent: "Cucumber" },
  { id: "chou_fleur", file: "cauliflower.png", fluent: "Brown mushroom" },

  { id: "pomme", file: "apple.png", fluent: "Red apple" },
  { id: "banane", file: "banana.png", fluent: "Banana" },
  { id: "orange", file: "orange.png", fluent: "Tangerine" },
  { id: "fraise", file: "strawberry.png", fluent: "Strawberry" },
  { id: "raisin", file: "grapes.png", fluent: "Grapes" },
  { id: "poire", file: "pear.png", fluent: "Pear" },
  { id: "kiwi", file: "kiwi.png", fluent: "Kiwi fruit" },
  { id: "mangue", file: "mango.png", fluent: "Mango" },
  { id: "ananas", file: "pineapple.png", fluent: "Pineapple" },
  { id: "cerise", file: "cherry.png", fluent: "Cherries" },
  { id: "peche", file: "peach.png", fluent: "Peach" },
  { id: "fruits_rouges", file: "berries.png", fluent: "Blueberries" },

  { id: "lait", file: "milk.png", fluent: "Glass of milk" },
  { id: "fromage", file: "cheese.png", fluent: "Cheese wedge" },
  { id: "yaourt", file: "yogurt.png", fluent: "Custard" },
  { id: "beurre", file: "butter.png", fluent: "Butter" },
  { id: "creme", file: "cream.png", fluent: "Soft ice cream" },
  { id: "mozzarella", file: "mozzarella.png", fluent: "Fondue" },
  { id: "emmental", file: "emmental.png", fluent: "Pretzel" },
  { id: "fromage_blanc", file: "cottage-cheese.png", fluent: "Croissant" },
  { id: "parmesan", file: "parmesan.png", fluent: "Bagel" },
  { id: "oeuf", file: "egg.png", fluent: "Egg" },

  { id: "chocolat", file: "chocolate.png", fluent: "Chocolate bar" },
  { id: "biscuit", file: "cookie.png", fluent: "Cookie" },
  { id: "chips", file: "chips.png", fluent: "French fries" },
  { id: "barre_cereales", file: "cereal-bar.png", fluent: "Candy" },
  { id: "gateau", file: "cake.png", fluent: "Birthday cake" },
  { id: "crepe", file: "crepe.png", fluent: "Pancakes" },
  { id: "gaufre", file: "waffle.png", fluent: "Waffle" },
  { id: "popcorn", file: "popcorn.png", fluent: "Popcorn" },
  { id: "miel", file: "honey.png", fluent: "Honey pot" },
  { id: "confiture", file: "jam.png", fluent: "Lollipop" },

  { id: "eau", file: "water.png", fluent: "Potable water" },
  { id: "jus_orange", file: "orange-juice.png", fluent: "Beverage box" },
  { id: "cafe", file: "coffee.png", fluent: "Hot beverage" },
  { id: "the", file: "tea.png", fluent: "Teacup without handle" },
  { id: "soda", file: "soda.png", fluent: "Cup with straw" },
  { id: "vin", file: "wine.png", fluent: "Wine glass" },
  { id: "biere", file: "beer.png", fluent: "Beer mug" },
  { id: "smoothie", file: "smoothie.png", fluent: "Tropical drink" },

  { id: "huile_olive", file: "olive-oil.png", fluent: "Olive" },
  { id: "moutarde", file: "mustard.png", fluent: "Salt" },
  { id: "mayonnaise", file: "mayonnaise.png", fluent: "Jar" },
  { id: "ketchup", file: "ketchup.png", fluent: "Pouring liquid" },
  { id: "basilic", file: "herbs.png", fluent: "Herb" },
  { id: "ail", file: "garlic.png", fluent: "Garlic" },
  { id: "oignon", file: "onion.png", fluent: "Onion" },
  { id: "citron", file: "lemon.png", fluent: "Lemon" },
  { id: "avocat", file: "avocado.png", fluent: "Avocado" },
  { id: "noix", file: "walnut.png", fluent: "Chestnut" },
  { id: "amandes", file: "almonds.png", fluent: "Peanuts" },
];

export const FOOD_IMAGE_MAP: Record<string, string> = Object.fromEntries(
  FOOD_ASSETS_3D.map((asset) => [asset.id, `${FOOD_IMAGE_BASE}/${asset.file}`]),
);

export function getFoodImageUrl(foodId: string): string {
  return FOOD_IMAGE_MAP[foodId] ?? FOOD_IMAGE_PLACEHOLDER;
}
