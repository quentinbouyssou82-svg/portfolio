#!/usr/bin/env node
/**
 * Bootstrap SQL Driveely — exécuter en une fois dans Supabase SQL Editor.
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
  "driveely-migrate.sql",
  "driveely-backend-v2.sql",
  "driveely-beta.sql",
  "driveely-beta-v2.sql",
  "driveely-beta-v3.sql",
];

let out = "-- Driveely bootstrap — ne pas modifier à la main\n\n";
for (const f of files) {
  out += `-- ═══ ${f} ═══\n`;
  out += fs.readFileSync(path.join(root, "supabase", f), "utf8");
  out += "\n\n";
}

const dest = path.join(root, "supabase", "driveely-bootstrap.sql");
fs.writeFileSync(dest, out);
console.log("Écrit:", dest, `(${out.length} chars)`);
