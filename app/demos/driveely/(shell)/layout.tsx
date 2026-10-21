import { redirect } from "next/navigation";

/** Authenticated web app removed — iOS only. */
export default function WebAppRemoved() {
  redirect("/");
}
