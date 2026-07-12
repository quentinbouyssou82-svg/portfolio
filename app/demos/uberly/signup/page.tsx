import { redirect } from "next/navigation";
import { UBERLY_PATHS } from "@/lib/margeo/constants";

/** Inscription — redirige vers la page auth unique (/login?mode=signup). */
export default function MargeoSignupPage() {
  redirect(`${UBERLY_PATHS.login}?mode=signup`);
}
