export type TaskStatus = "todo" | "doing" | "done";

export type SessionDomain = "business" | "saas" | "quant";

export type BusinessMetricType =
  | "lead"
  | "email"
  | "reply"
  | "call"
  | "client"
  | "revenue";

export type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  task_date: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WorkSession = {
  id: string;
  user_id: string;
  domain: SessionDomain;
  task_id: string | null;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
};

export type MetricsDaily = {
  id: string;
  user_id: string;
  metric_date: string;
  focus_of_day: string | null;
  sleep_hours: number | null;
  screen_time_minutes: number | null;
  weight_kg: number | null;
  sport_done: boolean | null;
  sport_type: string | null;
  energy_score: number | null;
  created_at: string;
  updated_at: string;
};

export type BusinessMetric = {
  id: string;
  user_id: string;
  metric_type: BusinessMetricType;
  value: number;
  notes: string | null;
  created_at: string;
};

export type Skill = {
  id: string;
  user_id: string;
  name: string;
  progress: number;
  sort_order: number;
  updated_at: string;
};

export const DEFAULT_SKILLS = [
  "SaaS building",
  "Marketing SaaS",
  "Dev / vibe coding",
  "Quantitative skills",
] as const;

export const PIPELINE_STAGES: {
  type: BusinessMetricType;
  label: string;
}[] = [
  { type: "lead", label: "Leads" },
  { type: "email", label: "Emails envoyés" },
  { type: "reply", label: "Réponses" },
  { type: "call", label: "Appels" },
  { type: "client", label: "Clients" },
  { type: "revenue", label: "Revenu" },
];

export const SESSION_DOMAINS: { value: SessionDomain; label: string }[] = [
  { value: "business", label: "Business" },
  { value: "saas", label: "SaaS" },
  { value: "quant", label: "Quant" },
];
