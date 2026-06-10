import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { ControlTowerHeader } from "@/components/control-tower/control-tower-header";
import { DashboardToday } from "@/components/control-tower/dashboard-today";
import { DashboardSessions } from "@/components/control-tower/dashboard-sessions";
import { DashboardMetrics } from "@/components/control-tower/dashboard-metrics";
import { DashboardPipeline } from "@/components/control-tower/dashboard-pipeline";
import { DashboardSkills } from "@/components/control-tower/dashboard-skills";
import { loadDashboardData } from "@/lib/control-tower/data";
import { isControlTowerConfigured } from "@/lib/control-tower/env";

export default async function ControlTowerDashboardPage() {
  if (!isControlTowerConfigured()) {
    redirect("/control-tower/login");
  }

  const result = await loadDashboardData();

  if (!result.ok) {
    redirect("/control-tower/login");
  }

  const { data } = result;

  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="ct-shell">
      <div className="ct-bg-glow" aria-hidden />
      <ControlTowerHeader />

      <p className="ct-date-line">{todayLabel}</p>

      <DashboardToday focusOfDay={data.focusOfDay} tasks={data.tasks} />

      <div className="ct-grid-2">
        <DashboardSessions sessions={data.sessions} />
        <DashboardPipeline totals={data.pipelineTotals} />
      </div>

      <DashboardMetrics metrics={data.metrics} />

      <DashboardSkills skills={data.skills} />
    </div>
  );
}
