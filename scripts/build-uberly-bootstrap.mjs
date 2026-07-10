#!/usr/bin/env node
/**
 * Bootstrap SQL Uberly — exécuter en une fois dans Supabase SQL Editor.
 * Généré depuis les 7 migrations ordonnées.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const files = [
  "margeo-setup.sql",
  "margeo-rls.sql",
  "uberly-migrate.sql",
  "uberly-backend-v2.sql",
  "uberly-beta.sql",
  "uberly-beta-v2.sql",
  "uberly-beta-v3.sql",
];

let out = "-- Uberly bootstrap — ne pas modifier à la main\n\n";
for (const f of files) {
  out += `-- ═══ ${f} ═══\n`;
  out += fs.readFileSync(path.join(root, "supabase", f), "utf8");
  out += "\n\n";
}

const dest = path.join(root, "supabase", "uberly-bootstrap.sql");
fs.writeFileSync(dest, out);
console.log("Écrit:", dest, `(${out.length} chars)`);
