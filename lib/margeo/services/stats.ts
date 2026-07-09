import type { RideAnalysis, Verdict } from "../types";
import { listAnalysesForUser } from "./analyses";

export interface DashboardStats {
  todayNet: number;
  todayDelta: number;
  avgScore: number;
  analyzedCount: number;
  acceptedShare: number;
}

export interface EarningsPoint {
  day: string;
  net: number;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
}

export function computeDashboardStats(analyses: RideAnalysis[]): DashboardStats {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayAnalyses = analyses.filter(
    (a) => new Date(a.analyzedAt) >= today,
  );
  const yesterdayAnalyses = analyses.filter((a) => {
    const d = new Date(a.analyzedAt);
    return d >= yesterday && d < today;
  });

  const todayNet = todayAnalyses.reduce((sum, a) => sum + a.netGain, 0);
  const yesterdayNet = yesterdayAnalyses.reduce((sum, a) => sum + a.netGain, 0);

  const scores = analyses.map((a) => a.score);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 0;

  const accepted = analyses.filter((a) => a.verdict === "accept").length;
  const acceptedShare =
    analyses.length > 0 ? Math.round((accepted / analyses.length) * 100) : 0;

  return {
    todayNet: Math.round(todayNet * 100) / 100,
    todayDelta: Math.round((todayNet - yesterdayNet) * 100) / 100,
    avgScore,
    analyzedCount: analyses.length,
    acceptedShare,
  };
}

export function computeEarningsSeries(analyses: RideAnalysis[]): EarningsPoint[] {
  const days: EarningsPoint[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const dayStart = startOfDay(new Date(now));
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const net = analyses
      .filter((a) => {
        const d = new Date(a.analyzedAt);
        return d >= dayStart && d < dayEnd;
      })
      .reduce((sum, a) => sum + a.netGain, 0);

    days.push({ day: dayLabel(dayStart), net: Math.round(net * 100) / 100 });
  }

  return days;
}

export async function getUserDashboardData(userId: string) {
  const analyses = await listAnalysesForUser(userId, 200);
  return {
    analyses,
    stats: computeDashboardStats(analyses),
    earnings: computeEarningsSeries(analyses),
    recent: analyses.slice(0, 4),
  };
}

export function filterByVerdict(
  analyses: RideAnalysis[],
  filter: "all" | Verdict,
): RideAnalysis[] {
  if (filter === "all") return analyses;
  return analyses.filter((a) => a.verdict === filter);
}
