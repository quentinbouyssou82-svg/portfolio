import { ProfilForm } from "@/components/margeo/profil-form";
import { getCurrentProfile } from "@/lib/margeo/services/profile";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { redirect } from "next/navigation";

export default async function ProfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(DRIVEELY_PATHS.login);

  return <ProfilForm initialProfile={profile} />;
}
