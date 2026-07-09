import { redirect } from "next/navigation";
import { ConnexionCoursesRetourClient } from "@/components/maison/connexion-courses-retour-client";
import { requireMaisonGrocerySetupSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS } from "@/lib/maison/constants";

type Props = {
  searchParams: Promise<{ state?: string }>;
};

export default async function MaisonConnexionCoursesRetourPage({ searchParams }: Props) {
  await requireMaisonGrocerySetupSession();
  const { state } = await searchParams;

  if (!state) {
    redirect(MAISON_PATHS.connexionCourses);
  }

  return <ConnexionCoursesRetourClient state={state} />;
}
