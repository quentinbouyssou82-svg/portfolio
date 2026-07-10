/**
 * Vérifie les variables d'environnement Uberly beta.
 * Usage : node scripts/uberly-beta-check.mjs
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_APP_URL",
];

const supabaseClientKeys = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
];

const supabaseServerKeys = [
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const visionKeys = [
  "MISTRAL_API_KEY",
  "UBERLY_GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
];

const optional = [
  "UBERLY_BETA_MODE",
  "UBERLY_VISION_PROVIDER",
  "UBERLY_MISTRAL_VISION_MODEL",
  "NEXT_PUBLIC_POSTHOG_KEY",
];

console.log("Uberly — vérification environnement beta\n");

let ok = true;

for (const key of required) {
  const val = process.env[key]?.trim();
  const present = Boolean(val);
  console.log(present ? "✓" : "✗", key, present ? "" : "(manquant)");
  if (!present) ok = false;
}

const hasClientKey = supabaseClientKeys.some((key) =>
  Boolean(process.env[key]?.trim()),
);
console.log(
  hasClientKey ? "✓" : "✗",
  "Supabase client key",
  hasClientKey ? "" : "(PUBLISHABLE ou ANON manquant)",
);
if (!hasClientKey) ok = false;

const hasServerKey = supabaseServerKeys.some((key) =>
  Boolean(process.env[key]?.trim()),
);
console.log(
  hasServerKey ? "✓" : "✗",
  "Supabase server key",
  hasServerKey ? "" : "(SECRET ou SERVICE_ROLE manquant)",
);
if (!hasServerKey) ok = false;

const visionProvider =
  process.env.UBERLY_VISION_PROVIDER?.trim().toLowerCase() || "mistral";
const hasVisionKey = visionKeys.some((key) => Boolean(process.env[key]?.trim()));
console.log(
  hasVisionKey ? "✓" : "✗",
  "Vision IA",
  hasVisionKey
    ? `(provider=${visionProvider})`
    : "(MISTRAL_API_KEY ou UBERLY_GEMINI_API_KEY manquant)",
);
if (!hasVisionKey) ok = false;

console.log("\nOptionnel :");
for (const key of optional) {
  const val = process.env[key]?.trim();
  console.log(val ? "✓" : "○", key, val ? `= ${val}` : "(non défini)");
}

console.log(ok ? "\n✓ Prêt pour configurer .env.local" : "\n✗ Variables manquantes");
process.exit(ok ? 0 : 1);
