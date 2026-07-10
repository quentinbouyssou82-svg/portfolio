import type { RideAnalysis } from "./types";

export type DateGroupKey =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "older";

export const DATE_GROUP_LABELS: Record<DateGroupKey, string> = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  week: "Cette semaine",
  month: "Ce mois",
  older: "Plus ancien",
};

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getDateGroup(iso: string): DateGroupKey {
  const date = new Date(iso);
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  if (date >= today) return "today";
  if (date >= yesterday) return "yesterday";
  if (date >= weekAgo) return "week";
  if (date >= monthAgo) return "month";
  return "older";
}

export function groupAnalysesByDate(
  analyses: RideAnalysis[],
): { key: DateGroupKey; label: string; items: RideAnalysis[] }[] {
  const order: DateGroupKey[] = [
    "today",
    "yesterday",
    "week",
    "month",
    "older",
  ];
  const buckets = new Map<DateGroupKey, RideAnalysis[]>();

  for (const a of analyses) {
    const key = getDateGroup(a.analyzedAt);
    const list = buckets.get(key) ?? [];
    list.push(a);
    buckets.set(key, list);
  }

  return order
    .filter((key) => buckets.has(key))
    .map((key) => ({
      key,
      label: DATE_GROUP_LABELS[key],
      items: buckets.get(key)!,
    }));
}
