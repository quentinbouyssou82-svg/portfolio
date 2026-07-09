import { DAY_LABELS } from "@/lib/maison/constants";
import type { Meal } from "@/lib/maison/types";
import { addDays, formatShortDate } from "@/lib/maison/utils/date";

export type PlanningDayGroup = {
  day: string;
  date: string;
  meals: Meal[];
};

export function buildPlanningDays(weekStart: string, meals: Meal[]): PlanningDayGroup[] {
  return DAY_LABELS.map((day, i) => {
    const dayDate = addDays(weekStart, i);
    return {
      day,
      date: formatShortDate(dayDate),
      meals: meals.filter((m) => m.day_date === dayDate),
    };
  });
}
