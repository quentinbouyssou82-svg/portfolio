"use client";

import { Check, Download, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MaisonAppShell, MaisonPageHeader } from "@/components/maison/maison-app-shell";
import {
  exportGroceryListAction,
  toggleGroceryItemAction,
  validateGroceryListAction,
} from "@/lib/maison/actions";
import type { GroceryItemGroup } from "@/lib/maison/utils/groceries";

type Props = {
  groups: GroceryItemGroup[];
  total: number;
  listId: string | null;
  isAdmin: boolean;
};

export function MaisonCoursesClient({ groups, total, listId, isAdmin }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const allItems = groups.flatMap((g) => g.items);
  const done = allItems.filter((i) => i.checked).length;
  const count = allItems.length;

  function toggle(itemId: string, checked: boolean) {
    if (!listId) return;
    startTransition(async () => {
      await toggleGroceryItemAction(listId, itemId, checked);
      router.refresh();
    });
  }

  function handleValidate() {
    if (!listId) return;
    startTransition(async () => {
      await validateGroceryListAction(listId);
      router.refresh();
    });
  }

  function handleExport() {
    if (!listId) return;
    startTransition(async () => {
      const result = await exportGroceryListAction(listId);
      if (result.ok && result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `maison-courses-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      router.refresh();
    });
  }

  if (count === 0) {
    return (
      <MaisonAppShell>
        <MaisonPageHeader eyebrow="Courses" title="Liste de courses" />
        <div className="px-6 text-center py-16">
          <p className="text-sm text-ash">
            Générez d&apos;abord votre planning de la semaine pour obtenir la liste de courses.
          </p>
        </div>
      </MaisonAppShell>
    );
  }

  return (
    <MaisonAppShell>
      <MaisonPageHeader eyebrow="Prête pour demain" title="Liste de courses" />

      <section className="px-6 animate-rise delay-100">
        <div className="rounded-3xl bg-paper ring-1 ring-black/[0.04] p-5 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-sage-soft grid place-items-center text-sage">
            <Wallet className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-ash">Budget estimé</p>
            <p className="font-serif text-2xl text-ink leading-none mt-1">
              {total.toFixed(2).replace(".", ",")} €
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-ash">Articles</p>
            <p className="text-sm font-medium mt-1">
              {done}
              <span className="text-ash">/{count}</span>
            </p>
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-sage transition-[width] duration-500"
            style={{ width: `${count ? (done / count) * 100 : 0}%` }}
          />
        </div>

        {isAdmin && listId ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleValidate}
              disabled={pending}
              className="flex-1 maison-btn maison-btn-primary py-2.5 text-xs"
            >
              Valider le panier
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={pending}
              className="flex-1 maison-btn bg-paper ring-1 ring-black/[0.06] py-2.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export Leclerc
            </button>
          </div>
        ) : null}
      </section>

      <div className="px-6 mt-10 space-y-10 mb-8">
        {groups.map((g, gi) => (
          <section key={g.label} className="animate-rise" style={{ animationDelay: `${(gi + 2) * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${g.tone}`}>
                {g.label}
              </h3>
              <span className="text-[10px] text-ash">{g.items.length}</span>
            </div>
            <ul className="divide-y divide-border/70">
              {g.items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                      onClick={() => toggle(it.id, !it.checked)}
                    disabled={pending}
                    className="w-full flex items-center gap-3 py-3.5 text-left group"
                  >
                    <span
                      className={`size-5 rounded-md border transition-all grid place-items-center shrink-0 ${
                        it.checked ? "bg-ink border-ink" : "border-border group-hover:border-ink/40"
                      }`}
                    >
                      {it.checked ? <Check className="h-3 w-3 text-cream" strokeWidth={3} /> : null}
                    </span>
                    <span className="flex-1 min-w-0">
                      <p
                        className={`text-sm transition-colors ${
                          it.checked ? "text-ash line-through" : "text-ink"
                        }`}
                      >
                        {it.name}
                      </p>
                      <p className="text-[11px] text-ash mt-0.5">
                        {it.quantity}
                        {it.unit ? ` ${it.unit}` : ""}
                      </p>
                    </span>
                    <span className="text-[11px] text-ash tabular-nums">
                      {it.price_est.toFixed(2).replace(".", ",")} €
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </MaisonAppShell>
  );
}
