import type { UserProfile } from "./types";

export function buildDisplayName(firstName: string, lastName: string): string {
  return [firstName, lastName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export function getProfileInitials(profile: Pick<UserProfile, "firstName" | "lastName" | "name">): string {
  const first = (profile.firstName || profile.name || "?").trim().charAt(0);
  const last = (profile.lastName || "").trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}
