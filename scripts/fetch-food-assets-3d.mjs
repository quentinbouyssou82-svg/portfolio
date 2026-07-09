/**
 * Télécharge les illustrations Microsoft Fluent Emoji 3D vers public/food-assets-3d/.
 * Usage: node scripts/fetch-food-assets-3d.mjs
 *
 * Licence MIT — https://github.com/microsoft/fluentui-emoji
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "food-assets-3d");
const FLUENT_BASE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

function fluentFileName(folderName) {
  return `${folderName.toLowerCase().replace(/['']/g, "").replace(/\s+/g, "_")}_3d.png`;
}

function fluentUrl(folderName) {
  const file = fluentFileName(folderName);
  return `${FLUENT_BASE}/${encodeURIComponent(folderName)}/3D/${file}`;
}

/** Aligné sur lib/maison/foods/food-image-map.ts — une illustration distincte par fichier */
const ASSETS = [
  { file: "chicken.png", fluent: "Poultry leg" },
  { file: "beef.png", fluent: "Cut of meat" },
  { file: "pork.png", fluent: "Pig face" },
  { file: "lamb.png", fluent: "Goat" },
  { file: "turkey.png", fluent: "Turkey" },
  { file: "duck.png", fluent: "Duck" },
  { file: "ham.png", fluent: "Bacon" },
  { file: "sausage.png", fluent: "Hot dog" },
  { file: "ground-beef.png", fluent: "Hamburger" },
  { file: "bacon.png", fluent: "Meat on bone" },
  { file: "merguez.png", fluent: "Stuffed flatbread" },
  { file: "foie-gras.png", fluent: "Pot of food" },
  { file: "salmon.png", fluent: "Fish" },
  { file: "cod.png", fluent: "Blowfish" },
  { file: "tuna.png", fluent: "Dolphin" },
  { file: "shrimp.png", fluent: "Fried shrimp" },
  { file: "mussels.png", fluent: "Oyster" },
  { file: "sardines.png", fluent: "Fish cake with swirl" },
  { file: "trout.png", fluent: "Tropical fish" },
  { file: "fish.png", fluent: "Bento box" },
  { file: "surimi.png", fluent: "Sushi" },
  { file: "anchovy.png", fluent: "Squid" },
  { file: "rice.png", fluent: "Cooked rice" },
  { file: "pasta.png", fluent: "Spaghetti" },
  { file: "bread.png", fluent: "Baguette bread" },
  { file: "quinoa.png", fluent: "Curry rice" },
  { file: "semolina.png", fluent: "Steaming bowl" },
  { file: "couscous.png", fluent: "Falafel" },
  { file: "oats.png", fluent: "Oden" },
  { file: "wheat.png", fluent: "Bread" },
  { file: "polenta.png", fluent: "Ear of corn" },
  { file: "lentils.png", fluent: "Beans" },
  { file: "chickpeas.png", fluent: "Dango" },
  { file: "kidney-beans.png", fluent: "Canned food" },
  { file: "tomato.png", fluent: "Tomato" },
  { file: "carrot.png", fluent: "Carrot" },
  { file: "zucchini.png", fluent: "Melon" },
  { file: "eggplant.png", fluent: "Eggplant" },
  { file: "pepper.png", fluent: "Bell pepper" },
  { file: "broccoli.png", fluent: "Broccoli" },
  { file: "spinach.png", fluent: "Leafy green" },
  { file: "salad.png", fluent: "Green salad" },
  { file: "mushroom.png", fluent: "Mushroom" },
  { file: "potato.png", fluent: "Potato" },
  { file: "sweet-potato.png", fluent: "Roasted sweet potato" },
  { file: "green-beans.png", fluent: "Hot pepper" },
  { file: "peas.png", fluent: "Pea pod" },
  { file: "cucumber.png", fluent: "Cucumber" },
  { file: "cauliflower.png", fluent: "Brown mushroom" },
  { file: "apple.png", fluent: "Red apple" },
  { file: "banana.png", fluent: "Banana" },
  { file: "orange.png", fluent: "Tangerine" },
  { file: "strawberry.png", fluent: "Strawberry" },
  { file: "grapes.png", fluent: "Grapes" },
  { file: "pear.png", fluent: "Pear" },
  { file: "kiwi.png", fluent: "Kiwi fruit" },
  { file: "mango.png", fluent: "Mango" },
  { file: "pineapple.png", fluent: "Pineapple" },
  { file: "cherry.png", fluent: "Cherries" },
  { file: "peach.png", fluent: "Peach" },
  { file: "berries.png", fluent: "Blueberries" },
  { file: "milk.png", fluent: "Glass of milk" },
  { file: "cheese.png", fluent: "Cheese wedge" },
  { file: "yogurt.png", fluent: "Custard" },
  { file: "butter.png", fluent: "Butter" },
  { file: "cream.png", fluent: "Soft ice cream" },
  { file: "mozzarella.png", fluent: "Fondue" },
  { file: "emmental.png", fluent: "Pretzel" },
  { file: "cottage-cheese.png", fluent: "Croissant" },
  { file: "parmesan.png", fluent: "Bagel" },
  { file: "egg.png", fluent: "Egg" },
  { file: "chocolate.png", fluent: "Chocolate bar" },
  { file: "cookie.png", fluent: "Cookie" },
  { file: "chips.png", fluent: "French fries" },
  { file: "cereal-bar.png", fluent: "Candy" },
  { file: "cake.png", fluent: "Birthday cake" },
  { file: "crepe.png", fluent: "Pancakes" },
  { file: "waffle.png", fluent: "Waffle" },
  { file: "popcorn.png", fluent: "Popcorn" },
  { file: "honey.png", fluent: "Honey pot" },
  { file: "jam.png", fluent: "Lollipop" },
  { file: "water.png", fluent: "Potable water" },
  { file: "orange-juice.png", fluent: "Beverage box" },
  { file: "coffee.png", fluent: "Hot beverage" },
  { file: "tea.png", fluent: "Teacup without handle" },
  { file: "soda.png", fluent: "Cup with straw" },
  { file: "wine.png", fluent: "Wine glass" },
  { file: "beer.png", fluent: "Beer mug" },
  { file: "smoothie.png", fluent: "Tropical drink" },
  { file: "olive-oil.png", fluent: "Olive" },
  { file: "mustard.png", fluent: "Salt" },
  { file: "mayonnaise.png", fluent: "Jar" },
  { file: "ketchup.png", fluent: "Pouring liquid" },
  { file: "herbs.png", fluent: "Herb" },
  { file: "garlic.png", fluent: "Garlic" },
  { file: "onion.png", fluent: "Onion" },
  { file: "lemon.png", fluent: "Lemon" },
  { file: "avocado.png", fluent: "Avocado" },
  { file: "walnut.png", fluent: "Chestnut" },
  { file: "almonds.png", fluent: "Peanuts" },
  { file: "placeholder.png", fluent: "Fork and knife with plate" },
];

async function downloadFluent(folderName) {
  const url = fluentUrl(folderName);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${folderName} → HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const fluentUsed = new Set();
  for (const { fluent } of ASSETS) {
    if (fluentUsed.has(fluent)) {
      console.error(`Doublon fluent interdit : ${fluent}`);
      process.exit(1);
    }
    fluentUsed.add(fluent);
  }

  let ok = 0;
  let failed = 0;

  for (const { file, fluent } of ASSETS) {
    const dest = path.join(OUT_DIR, file);
    try {
      const buffer = await downloadFluent(fluent);
      await writeFile(dest, buffer);
      ok++;
      console.log(`✓ ${file} ← ${fluent}`);
    } catch (e) {
      failed++;
      console.warn(`✗ ${file} (${fluent}): ${e.message}`);
    }
  }

  console.log(`\n${ok} fichiers écrits, ${failed} échecs.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
