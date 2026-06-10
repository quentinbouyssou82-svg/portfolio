import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { isPinSessionValid } from "@/lib/control-tower/pin-session";

export default async function ControlTowerHomePage() {
  if (await isPinSessionValid()) {
    redirect("/control-tower/dashboard");
  }
  redirect("/control-tower/login");
}
