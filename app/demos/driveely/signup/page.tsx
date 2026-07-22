import { redirect } from "next/navigation";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

/** Inscription — redirige vers la page auth unique (/login?mode=signup). */
export default function MargeoSignupPage() {
  redirect(`${DRIVEELY_PATHS.login}?mode=signup`);
}
