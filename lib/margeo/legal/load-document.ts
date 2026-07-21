import fs from "fs";
import path from "path";
import {
  getLegalDocument,
  rewriteLegalMarkdownLinks,
  type UberlyLegalDocId,
} from "./documents";

export function loadUberlyLegalMarkdown(id: UberlyLegalDocId): string {
  const doc = getLegalDocument(id);
  const fullPath = path.join(
    process.cwd(),
    "content/uberly/legal",
    doc.file,
  );
  const raw = fs.readFileSync(fullPath, "utf8");
  return rewriteLegalMarkdownLinks(raw);
}
