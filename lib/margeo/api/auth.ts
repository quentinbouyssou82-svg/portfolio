import type { User } from "@supabase/supabase-js";
import { ApiError } from "./errors";
import { createMargeoServerClient } from "../supabase/server";

export async function requireAuthUser(): Promise<User> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
  }

  return user;
}
