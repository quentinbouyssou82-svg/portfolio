import { getControlTowerDb } from "@/lib/control-tower/supabase/data";

export async function ensureProfile(userId: string) {
  const db = getControlTowerDb();
  await db.from("profiles").upsert(
    {
      id: userId,
      email: "local@control-tower",
    },
    { onConflict: "id" },
  );
}
