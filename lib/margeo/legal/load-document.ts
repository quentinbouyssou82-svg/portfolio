import fs from "fs";
import path from "path";
import {
  getLegalDocument,
  rewriteLegalMarkdownLinks,
  type DriveelyLegalDocId,
} from "./documents";

export function loadDriveelyLegalMarkdown(id: DriveelyLegalDocId): string {
  const doc = getLegalDocument(id);
  const fullPath = path.join(
    process.cwd(),
    "content/driveely/legal",
    doc.file,
  );
  const raw = fs.readFileSync(fullPath, "utf8");
  return rewriteLegalMarkdownLinks(raw);
}
