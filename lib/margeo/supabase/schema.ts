import type { Platform, Vehicle, Verdict } from "../types";

export interface MargeoProfileRow {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string;
  vehicle: Vehicle;
  vehicle_details?: Record<string, unknown> | null;
  cost_per_km: number;
  target_hourly: number;
  daily_target: number;
  platforms: string[];
  other_platform: string | null;
  premium: boolean;
  premium_until: string | null;
  premium_source: "manual" | "beta" | "stripe" | "trial" | null;
  plan_id?: "discovery" | "pro" | "elite" | null;
  is_beta_tester: boolean;
  onboarding_completed: boolean;
  min_benefit: number;
  max_distance_km: number;
  empty_returns: "yes" | "no" | "short_only" | null;
  weekly_hours: "under_10" | "10_20" | "20_30" | "30_40" | "over_40" | null;
  last_lat: number | null;
  last_lng: number | null;
  location_permission: "granted" | "denied" | "unknown";
  location_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MargeoRideRow {
  id: string;
  user_id: string;
  platform: string;
  pickup: string;
  dropoff: string;
  payout: number;
  distance_km: number;
  duration_min: number;
  empty_return_km: number;
  pickup_distance_km: number | null;
  courier_lat: number | null;
  courier_lng: number | null;
  image_path: string | null;
  vision_source: "mock" | "vision" | null;
  vision_confidence: number | null;
  missing_fields: string[];
  extraction_quality: "complete" | "partial" | "failed";
  created_at: string;
}

export interface ScoreBreakdownRow {
  label: string;
  impact: number;
  detail: string;
}

export interface MargeoAnalysisRow {
  id: string;
  user_id: string;
  ride_id: string;
  gross_gain: number;
  estimated_cost: number;
  net_gain: number;
  hourly_rate: number;
  score: number;
  verdict: Verdict;
  explanation: string;
  insights: string[];
  score_breakdown: ScoreBreakdownRow[];
  analyzed_at: string;
}

export interface MargeoFeedbackRow {
  id: string;
  analysis_id: string;
  user_id: string;
  accepted: boolean | null;
  actual_duration_min: number | null;
  actual_gain: number | null;
  actual_distance_km: number | null;
  created_at: string;
  updated_at: string;
}

export interface MargeoAnalysisWithRide extends MargeoAnalysisRow {
  ride: MargeoRideRow;
  feedback: MargeoFeedbackRow | null;
}

export type ProfileUpdateInput = Partial<
  Pick<
    MargeoProfileRow,
    | "name"
    | "first_name"
    | "last_name"
    | "avatar_url"
    | "city"
    | "vehicle"
    | "vehicle_details"
    | "cost_per_km"
    | "target_hourly"
    | "daily_target"
    | "platforms"
    | "other_platform"
    | "onboarding_completed"
    | "min_benefit"
    | "max_distance_km"
    | "empty_returns"
    | "weekly_hours"
    | "last_lat"
    | "last_lng"
    | "location_permission"
    | "location_updated_at"
  >
>;

export type OnboardingInput = {
  vehicle: Vehicle;
  targetHourly: number;
  minBenefit: number;
  emptyReturns: "yes" | "no" | "short_only";
  maxDistanceKm: number;
  weeklyHours: "under_10" | "10_20" | "20_30" | "30_40" | "over_40";
};
