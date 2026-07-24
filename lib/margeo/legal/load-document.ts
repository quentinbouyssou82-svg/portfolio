import fs from "fs";
import path from "path";
import {
  getLegalDocument,
  rewriteLegalMarkdownLinks,
  type DriveelyLegalDocId,
} from "./documents";
import { applyLegalEntityPlaceholders } from "./entity";

export function loadDriveelyLegalMarkdown(id: DriveelyLegalDocId): string {
  const doc = getLegalDocument(id);
  const fullPath = path.join(
    process.cwd(),
    "content/driveely/legal",
    doc.file,
  );
  const raw = fs.readFileSync(fullPath, "utf8");
  return applyLegalEntityPlaceholders(rewriteLegalMarkdownLinks(raw));
}
