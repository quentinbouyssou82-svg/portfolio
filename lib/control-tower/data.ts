import { todayLocalISO } from "@/lib/control-tower/date";
import { requireAuth } from "@/lib/control-tower/auth-helpers";
import { getControlTowerDb } from "@/lib/control-tower/supabase/data";
import type {
  BusinessMetricType,
  MetricsDaily,
  Skill,
  Task,
  WorkSession,
} from "@/lib/control-tower/types";
import { DEFAULT_SKILLS, PIPELINE_STAGES } from "@/lib/control-tower/types";

export type DashboardData = {
  today: string;
  tasks: Task[];
  focusOfDay: string | null;
  sessions: WorkSession[];
  metrics: MetricsDaily | null;
  pipelineTotals: Record<BusinessMetricType, number>;
  skills: Skill[];
};

export async function loadDashboardData(): Promise<
  | { ok: true; data: DashboardData }
  | { ok: false; message: string }
> {
  const auth = await requireAuth();
  if (!auth.ok) {
    return { ok: false, message: auth.message };
  }

  const supabase = getControlTowerDb();
  const today = todayLocalISO();

  const [
    tasksRes,
    metricsRes,
    sessionsRes,
    skillsRes,
    pipelineRes,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.userId)
      .eq("task_date", today)
      .order("sort_order", { ascending: true }),
    supabase
      .from("metrics_daily")
      .select("*")
      .eq("user_id", auth.userId)
      .eq("metric_date", today)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("skills")
      .select("*")
      .eq("user_id", auth.userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("business_metrics")
      .select("metric_type, value")
      .eq("user_id", auth.userId),
  ]);

  if (tasksRes.error) {
    return {
      ok: false,
      message: mapDbError(tasksRes.error.message, tasksRes.error.code),
    };
  }

  let skills = (skillsRes.data ?? []) as Skill[];
  if (skills.length === 0 && !skillsRes.error) {
    const seed = DEFAULT_SKILLS.map((name, i) => ({
      user_id: auth.userId,
      name,
      progress: 0,
      sort_order: i + 1,
    }));
    await supabase.from("skills").insert(seed);
    const { data: reloaded } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", auth.userId)
      .order("sort_order", { ascending: true });
    skills = (reloaded ?? []) as Skill[];
  }

  const pipelineTotals = emptyPipelineTotals();
  for (const row of pipelineRes.data ?? []) {
    const t = row.metric_type as BusinessMetricType;
    if (t in pipelineTotals) {
      pipelineTotals[t] += Number(row.value) || 0;
    }
  }

  return {
    ok: true,
    data: {
      today,
      tasks: (tasksRes.data ?? []) as Task[],
      focusOfDay: metricsRes.data?.focus_of_day ?? null,
      sessions: (sessionsRes.data ?? []) as WorkSession[],
      metrics: metricsRes.data as MetricsDaily | null,
      pipelineTotals,
      skills,
    },
  };
}

function emptyPipelineTotals(): Record<BusinessMetricType, number> {
  return Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s.type, 0]),
  ) as Record<BusinessMetricType, number>;
}

function mapDbError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("Could not find the table")
  ) {
    return "Tables manquantes — exécute supabase/control-tower-setup.sql dans Supabase.";
  }
  return message;
}
