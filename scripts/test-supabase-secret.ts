import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const secret = process.env.SUPABASE_SECRET_KEY!;

const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  const res = await admin.from("margeo_profiles").select("id").limit(1);
  console.log("rest:", res.status, res.error?.message ?? "ok");

  const auth = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: { apikey: secret, Authorization: `Bearer ${secret}` },
  });
  console.log("admin:", auth.status, (await auth.text()).slice(0, 200));
})();
