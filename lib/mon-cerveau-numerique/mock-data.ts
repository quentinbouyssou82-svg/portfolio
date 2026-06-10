import type { McnDashboardData, McnDocument, McnProfile, McnTask } from "./types";

export const DEMO_USER_ID = "demo-user";

export const defaultProfile: McnProfile = {
  id: DEMO_USER_ID,
  display_name: "Alex",
  onboarding_completed: true,
  priorities: ["documents", "todos"],
  created_at: "2026-01-01T00:00:00.000Z",
};

export const defaultTasks: McnTask[] = [
  {
    id: "task-1",
    user_id: DEMO_USER_ID,
    title: "Renouveler assurance habitation",
    done: false,
    priority: "high",
    due_date: null,
    created_at: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "task-2",
    user_id: DEMO_USER_ID,
    title: "Archiver factures mars",
    done: false,
    priority: "medium",
    due_date: null,
    created_at: "2026-03-02T08:00:00.000Z",
  },
  {
    id: "task-3",
    user_id: DEMO_USER_ID,
    title: "Répondre au mail banque",
    done: true,
    priority: "medium",
    due_date: null,
    created_at: "2026-03-03T08:00:00.000Z",
  },
];

export const defaultDocuments: McnDocument[] = [
  {
    id: "doc-1",
    user_id: DEMO_USER_ID,
    name: "Facture EDF — Mars 2026",
    category: "Factures",
    created_at: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "doc-2",
    user_id: DEMO_USER_ID,
    name: "Contrat assurance auto",
    category: "Contrats",
    created_at: "2026-02-15T10:00:00.000Z",
  },
  {
    id: "doc-3",
    user_id: DEMO_USER_ID,
    name: "Avis d'imposition 2025",
    category: "Impôts",
    created_at: "2026-01-20T10:00:00.000Z",
  },
];

export function buildDashboardData(
  profile = defaultProfile,
  tasks = defaultTasks,
  documents = defaultDocuments,
): McnDashboardData {
  const categories = new Set(documents.map((d) => d.category));

  return {
    profile,
    tasks,
    documents,
    stats: {
      totalDocuments: documents.length,
      pendingTasks: tasks.filter((t) => !t.done).length,
      completedTasks: tasks.filter((t) => t.done).length,
      categories: categories.size,
    },
  };
}

export const demoDashboardData = buildDashboardData();
