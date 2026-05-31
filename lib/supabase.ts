import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis dans .env.local (ou Vercel).",
  );
}

export const supabase = createClient(url, anonKey);
