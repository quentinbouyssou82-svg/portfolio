import { redirect } from "next/navigation";
import { getMaisonSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS } from "@/lib/maison/constants";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMaisonSession();

  if (session?.household.onboarding_completed) {
    redirect(MAISON_PATHS.home);
  }

  if (session && session.role !== "admin") {
    redirect(MAISON_PATHS.enAttente);
  }

  return children;
}
