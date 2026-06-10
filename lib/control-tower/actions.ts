"use server";

import { revalidatePath } from "next/cache";
import { todayLocalISO } from "@/lib/control-tower/date";
import { requireAuth } from "@/lib/control-tower/auth-helpers";
import {
  clearPinSessionCookie,
  setPinSessionCookie,
  verifyPin,
} from "@/lib/control-tower/pin-session";
import { getControlTowerDb } from "@/lib/control-tower/supabase/data";
import type {
  BusinessMetricType,
  SessionDomain,
  TaskStatus,
} from "@/lib/control-tower/types";

const DASHBOARD_PATH = "/control-tower/dashboard";

function revalidateDashboard() {
  revalidatePath(DASHBOARD_PATH);
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

// ——— Auth (PIN) ———

export async function signInWithPin(pin: string): Promise<ActionResult> {
  if (!verifyPin(pin)) {
    if (process.env.NODE_ENV === "development") {
      console.info("[control-tower] PIN refusé");
    }
    return { ok: false, message: "PIN incorrect" };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[control-tower] PIN OK");
  }

  try {
    await setPinSessionCookie();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Session impossible",
    };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[control-tower] cookie session posé — le client redirige");
  }

  return { ok: true };
}

export async function signOutAction(): Promise<ActionResult> {
  await clearPinSessionCookie();
  return { ok: true };
}

// ——— Tasks ———

export async function createTask(title: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const trimmed = title.trim();
  if (!trimmed) return { ok: false, message: "Titre requis" };

  const supabase = getControlTowerDb();
  const today = todayLocalISO();

  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.userId)
    .eq("task_date", today);

  if ((count ?? 0) >= 3) {
    return { ok: false, message: "Maximum 3 tâches par jour" };
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: auth.userId,
    title: trimmed,
    status: "todo",
    task_date: today,
    sort_order: count ?? 0,
  });

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const supabase = getControlTowerDb();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("user_id", auth.userId);

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

export async function cycleTaskStatus(taskId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const supabase = getControlTowerDb();
  const { data: task } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", taskId)
    .eq("user_id", auth.userId)
    .single();

  if (!task) return { ok: false, message: "Tâche introuvable" };

  const next: TaskStatus =
    task.status === "todo"
      ? "doing"
      : task.status === "doing"
        ? "done"
        : "todo";

  return updateTaskStatus(taskId, next);
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const supabase = getControlTowerDb();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", auth.userId);

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

export async function saveFocusOfDay(focus: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const supabase = getControlTowerDb();
  const today = todayLocalISO();

  const { error } = await supabase.from("metrics_daily").upsert(
    {
      user_id: auth.userId,
      metric_date: today,
      focus_of_day: focus.trim() || null,
    },
    { onConflict: "user_id,metric_date" },
  );

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

// ——— Sessions ———

export async function createSession(input: {
  domain: SessionDomain;
  durationMinutes: number;
  notes?: string;
}): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (input.durationMinutes < 1) {
    return { ok: false, message: "Durée invalide" };
  }

  const supabase = getControlTowerDb();
  const { error } = await supabase.from("sessions").insert({
    user_id: auth.userId,
    domain: input.domain,
    duration_minutes: input.durationMinutes,
    notes: input.notes?.trim() || null,
  });

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

// ——— Metrics ———

export type MetricsInput = {
  sleep_hours?: number | null;
  screen_time_minutes?: number | null;
  weight_kg?: number | null;
  sport_done?: boolean;
  sport_type?: string | null;
  energy_score?: number | null;
};

export async function saveDailyMetrics(
  input: MetricsInput,
): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const supabase = getControlTowerDb();
  const today = todayLocalISO();

  const { error } = await supabase.from("metrics_daily").upsert(
    {
      user_id: auth.userId,
      metric_date: today,
      sleep_hours: input.sleep_hours ?? null,
      screen_time_minutes: input.screen_time_minutes ?? null,
      weight_kg: input.weight_kg ?? null,
      sport_done: input.sport_done ?? false,
      sport_type: input.sport_type?.trim() || null,
      energy_score: input.energy_score ?? null,
    },
    { onConflict: "user_id,metric_date" },
  );

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

// ——— Pipeline ———

export async function addBusinessMetric(
  metricType: BusinessMetricType,
  value: number,
): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (value <= 0) return { ok: false, message: "Valeur invalide" };

  const supabase = getControlTowerDb();
  const { error } = await supabase.from("business_metrics").insert({
    user_id: auth.userId,
    metric_type: metricType,
    value,
  });

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}

// ——— Skills ———

export async function updateSkillProgress(
  skillId: string,
  progress: number,
): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const supabase = getControlTowerDb();
  const { error } = await supabase
    .from("skills")
    .update({ progress: clamped })
    .eq("id", skillId)
    .eq("user_id", auth.userId);

  if (error) return { ok: false, message: error.message };
  revalidateDashboard();
  return { ok: true };
}
