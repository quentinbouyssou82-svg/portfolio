/**
 * Vérifie les variables d'environnement Uberly beta.
 * Usage : node scripts/uberly-beta-check.mjs
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "UBERLY_GEMINI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const optional = ["UBERLY_BETA_MODE", "NEXT_PUBLIC_POSTHOG_KEY"];

console.log("Uberly — vérification environnement beta\n");

let ok = true;

for (const key of required) {
  const val = process.env[key]?.trim();
  const present = Boolean(val);
  console.log(present ? "✓" : "✗", key, present ? "" : "(manquant)");
  if (!present) ok = false;
}

console.log("\nOptionnel :");
for (const key of optional) {
  const val = process.env[key]?.trim();
  console.log(val ? "✓" : "○", key, val ? `= ${val}` : "(non défini)");
}

console.log(ok ? "\n✓ Prêt pour configurer .env.local" : "\n✗ Variables manquantes");
process.exit(ok ? 0 : 1);
