import { BLOCK_TYPE_TO_FORMAT } from "./format.js";

export interface NormalizeWorkoutMeta {
  text: string;
  warnings: string[];
  transformations: string[];
  blockCount: number;
}

/** Alias LLM → type officiel du parser. */
const TYPE_ALIASES: Record<string, string> = {
  warmup: "StraightSets",
};

const HEADER_LINE =
  /^(#\s*Workout|---|[A-Za-z][\w\s]*\s*:\s*.+)$/i;

function normalizeTypeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
}

function isKnownBlockType(value: string): boolean {
  const key = normalizeTypeKey(value);
  return key in BLOCK_TYPE_TO_FORMAT || key in TYPE_ALIASES;
}

function resolveBlockType(raw: string): { type: string; mapped: boolean; label: string } {
  const trimmed = raw.trim();
  const key = normalizeTypeKey(trimmed);

  if (TYPE_ALIASES[key]) {
    return {
      type: TYPE_ALIASES[key],
      mapped: true,
      label: `${trimmed} → ${TYPE_ALIASES[key]}`,
    };
  }

  if (key in BLOCK_TYPE_TO_FORMAT) {
    return { type: trimmed, mapped: false, label: trimmed };
  }

  return {
    type: "StraightSets",
    mapped: true,
    label: `${trimmed} → StraightSets`,
  };
}

function stripCodeFences(text: string): { text: string; stripped: boolean } {
  const fenced = text.match(/```(?:markdown|md)?\s*\n([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return { text: fenced[1].trim(), stripped: true };
  }

  let out = text;
  const hadLeading = /^```(?:markdown|md)?\s*\n?/i.test(out);
  const hadTrailing = /\n?```\s*$/i.test(out);
  out = out.replace(/^```(?:markdown|md)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  return { text: out.trim(), stripped: hadLeading || hadTrailing };
}

function unifySeparators(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^⸻\s*$/gm, "---")
    .replace(/^—\s*$/gm, "---");
}

function hasBlockMarker(text: string): boolean {
  return /^##\s*Block\b/im.test(text);
}

function isHeaderSegment(segment: string): boolean {
  const t = segment.trim();
  if (!t) return false;
  if (/^##\s*Block\b/im.test(t)) return false;
  if (/^Type\s*:/im.test(t)) return false;
  if (/^Exercise\s*:/im.test(t)) return false;
  if (/^###\s*Exercise\b/im.test(t)) return false;
  return (
    /^#\s*Workout\b/im.test(t) ||
    /^Name\s*:/im.test(t) ||
    /^Goal\s*:/im.test(t) ||
    /^EstimatedDuration\s*:/im.test(t) ||
    /^Notes\s*:/im.test(t) ||
    /^---\s*$/m.test(t) ||
    HEADER_LINE.test(t.split("\n").find((l) => l.trim()) ?? "")
  );
}

function isBlockSegment(segment: string): boolean {
  const t = segment.trim();
  return (
    /^##\s*Block\b/im.test(t) ||
    /^Type\s*:/im.test(t) ||
    /^Exercise\s*:/im.test(t) ||
    /^###\s*Exercise\b/im.test(t)
  );
}

function ensureBlockComplete(
  segment: string,
  warnings: string[],
  transformations: string[],
): string {
  let body = segment.trim();

  if (/^##\s*Block\b/im.test(body)) {
    body = body.replace(/^##\s*Block\s*/i, "").trim();
  }

  if (!/^Type\s*:/im.test(body)) {
    body = `Type: StraightSets\n${body}`;
    transformations.push("type:defaulted_StraightSets");
    warnings.push("structure:Type_defaulted_to_StraightSets");
  }

  if (!/^Exercise\s*:/im.test(body) && !/^###\s*Exercise\b/im.test(body)) {
    warnings.push("structure:segment_without_Exercise");
  }

  return `## Block\n${body}`;
}

function splitSegments(text: string): string[] {
  const chunks = text
    .split(/^---\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);

  const segments: string[] = [];

  for (const chunk of chunks) {
    if (hasBlockMarker(chunk)) {
      const blocks = chunk
        .split(/(?=^##\s*Block\b)/gim)
        .map((s) => s.trim())
        .filter(Boolean);
      segments.push(...blocks);
      continue;
    }

    if (/^Type\s*:/im.test(chunk)) {
      const typed = chunk
        .split(/(?=^Type\s*:)/gim)
        .map((s) => s.trim())
        .filter(Boolean);
      segments.push(...typed);
      continue;
    }

    segments.push(chunk);
  }

  return segments;
}

function reconstructBlocks(
  text: string,
  warnings: string[],
  transformations: string[],
): string {
  const segments = splitSegments(text);
  const headerParts: string[] = [];
  const blockParts: string[] = [];

  for (const segment of segments) {
    if (!segment.trim()) continue;

    if (isBlockSegment(segment)) {
      blockParts.push(ensureBlockComplete(segment, warnings, transformations));
      continue;
    }

    if (isHeaderSegment(segment)) {
      headerParts.push(segment.replace(/^---\s*$/gm, "").trim());
      continue;
    }

    if (/^---\s*$/m.test(segment.trim())) continue;

    warnings.push("structure:unrecognized_segment_dropped");
    transformations.push("segment:dropped");
  }

  if (blockParts.length === 0) {
    const firstTypeIdx = text.search(/^Type\s*:/im);
    const firstExerciseIdx = text.search(/^Exercise\s*:/im);
    const firstIdx =
      firstTypeIdx === -1
        ? firstExerciseIdx
        : firstExerciseIdx === -1
          ? firstTypeIdx
          : Math.min(firstTypeIdx, firstExerciseIdx);

    if (firstIdx === -1) {
      warnings.push("structure:no_Type_or_Exercise_detected");
      return text;
    }

    const header = firstIdx > 0 ? text.slice(0, firstIdx).trim() : "";
    const body = text.slice(firstIdx).trim();
    const parts = body.split(/(?=^Type\s*:)/gim).filter((p) => p.trim());
    const blocks = parts.map((part) =>
      ensureBlockComplete(part, warnings, transformations),
    );

    transformations.push(`blocks:reconstructed_from_Type (${blocks.length})`);
    warnings.push("structure:reconstructed_from_Type");

    const joined = blocks.join("\n\n---\n\n");
    return header ? `${header}\n\n---\n\n${joined}` : joined;
  }

  if (blockParts.length > 0 && !hasBlockMarker(text)) {
    transformations.push(`blocks:reconstructed (${blockParts.length})`);
    warnings.push("structure:blocks_reconstructed");
  }

  const header = headerParts
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const blocks = blockParts.join("\n\n---\n\n");
  return header ? `${header}\n\n---\n\n${blocks}` : blocks;
}

function normalizeTypeLines(
  text: string,
  warnings: string[],
  transformations: string[],
): string {
  const blocks = text.split(/(?=^##\s*Block\b)/gim);

  return blocks
    .map((block) => {
      if (!/^##\s*Block\b/im.test(block.trim())) return block;

      return block.replace(/^Type\s*:\s*(.+)$/gim, (_match, raw: string) => {
        const key = normalizeTypeKey(raw);
        const { type, mapped, label } = resolveBlockType(raw);
        if (mapped) {
          transformations.push(`type:${label}`);
          warnings.push(`type_mapped:${label}`);
        }
        if (TYPE_ALIASES[key] && !/^Group\s*:/im.test(block)) {
          transformations.push("group:warmup_injected");
          return `Type: ${type}\nGroup: warmup`;
        }
        return `Type: ${type}`;
      });
    })
    .join("");
}

function trimBeforeFirstBlock(
  text: string,
  warnings: string[],
  transformations: string[],
): string {
  const blockIdx = text.search(/^##\s*Block\b/im);
  if (blockIdx === -1) return text;

  const before = text.slice(0, blockIdx);
  const after = text.slice(blockIdx);
  const kept: string[] = [];
  let removed = 0;

  for (const line of before.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      kept.push("");
      continue;
    }
    if (HEADER_LINE.test(trimmed)) {
      kept.push(line);
      continue;
    }
    removed++;
  }

  if (removed > 0) {
    transformations.push(`header:removed_${removed}_narrative_lines`);
    warnings.push("header:narrative_trimmed");
  }

  const header = kept.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
  return header ? `${header}\n\n${after}` : after;
}

function countBlocks(text: string): number {
  return (text.match(/^##\s*Block\b/gim) ?? []).length;
}

/**
 * Normalise une sortie LLM pour la rendre compatible avec `parseWorkoutMarkdown`.
 * Ne lève jamais d'exception.
 */
export function normalizeWorkoutInputDetailed(rawText: string): NormalizeWorkoutMeta {
  const warnings: string[] = [];
  const transformations: string[] = [];

  try {
    const { text: unfenced, stripped } = stripCodeFences(rawText);
    if (stripped) {
      transformations.push("markdown:code_fence_removed");
    }

    let text = unifySeparators(unfenced).trim();
    if (!text) {
      warnings.push("input:empty");
      return { text: "", warnings, transformations, blockCount: 0 };
    }

    text = reconstructBlocks(text, warnings, transformations);
    text = normalizeTypeLines(text, warnings, transformations);
    text = trimBeforeFirstBlock(text, warnings, transformations);
    text = text.trim();

    return {
      text,
      warnings,
      transformations,
      blockCount: countBlocks(text),
    };
  } catch {
    warnings.push("normalize:unexpected_error_kept_raw");
    return {
      text: rawText.trim(),
      warnings,
      transformations,
      blockCount: countBlocks(rawText),
    };
  }
}

/** Retourne uniquement le texte normalisé (API simple). */
export function normalizeWorkoutInput(rawText: string): string {
  return normalizeWorkoutInputDetailed(rawText).text;
}

export { isKnownBlockType, resolveBlockType };
