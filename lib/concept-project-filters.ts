import type { ConceptProject } from "@/lib/concept-projects";

export type ProjectFilterId = "all" | "restaurant" | "fitness" | "renovation";

export type ProjectFilter = {
  id: ProjectFilterId;
  label: string;
};

export const projectFilters: ProjectFilter[] = [
  { id: "all", label: "Tous" },
  { id: "restaurant", label: "Restauration" },
  { id: "fitness", label: "Sport & fitness" },
  { id: "renovation", label: "Rénovation" },
];

const filterByProjectId: Record<string, ProjectFilterId> = {
  "bella-vista": "restaurant",
  "titan-fitness": "fitness",
  "nova-habitat": "renovation",
};

export function getProjectFilterId(project: ConceptProject): ProjectFilterId {
  return filterByProjectId[project.id] ?? "all";
}

export function filterProjects(
  projects: ConceptProject[],
  active: ProjectFilterId,
): ConceptProject[] {
  if (active === "all") return projects;
  return projects.filter((p) => getProjectFilterId(p) === active);
}
