import { GROCERY_CATEGORY_LABELS, GROCERY_CATEGORY_TONE } from "@/lib/maison/constants";
import type { GroceryItem } from "@/lib/maison/types";

export type GroceryItemGroup = {
  label: string;
  tone: string;
  items: GroceryItem[];
};

export function groupGroceryItems(items: GroceryItem[]): GroceryItemGroup[] {
  const byCategory = new Map<string, GroceryItem[]>();

  for (const item of items) {
    const cat = item.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(item);
  }

  return [...byCategory.entries()].map(([cat, catItems]) => ({
    label: GROCERY_CATEGORY_LABELS[cat] ?? cat,
    tone: GROCERY_CATEGORY_TONE[cat] ?? "text-olive",
    items: catItems,
  }));
}
