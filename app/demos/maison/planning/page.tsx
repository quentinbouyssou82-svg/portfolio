import { requireMaisonAppSession } from "@/lib/maison/auth/session";
import { MaisonPlanningClient } from "@/components/maison/maison-planning-client";
import { getCurrentWeekPlan, getMealsFromPlan } from "@/lib/maison/services/meals";
import { getHouseholdMembers } from "@/lib/maison/services/members";
import { buildMemberPreferenceSummaries } from "@/lib/maison/utils/preferences-summary";
import { getWeekStart } from "@/lib/maison/utils/date";
import { buildPlanningDays } from "@/lib/maison/utils/planning";

export default async function MaisonPlanningPage() {
  const session = await requireMaisonAppSession();
  const weekStart = getWeekStart();
  const plan = await getCurrentWeekPlan(session.householdId);
  const meals = plan ? getMealsFromPlan(plan) : [];
  const days = buildPlanningDays(weekStart, meals);
  const members = buildMemberPreferenceSummaries(
    await getHouseholdMembers(session.householdId),
  );

  return (
    <MaisonPlanningClient
      weekStart={weekStart}
      days={days}
      isAdmin={session.role === "admin"}
      members={members}
      shouldAutoGenerate={meals.length === 0}
    />
  );
}
