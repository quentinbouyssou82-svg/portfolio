import { randomUUID } from "node:crypto";
import {
  parsedWorkoutSchema,
  type ParsedWorkoutOutput,
  type WorkoutFormatType,
} from "@cali/types";
import { ZodError } from "zod";
import { ParseMarkdownError } from "./errors.js";
import { BLOCK_TYPE_TO_FORMAT } from "./format.js";

export interface ParseMarkdownResult {
  workout: ParsedWorkoutOutput;
  warnings: string[];
  durationMs: number;
  phaseTimings: {
    lexMs: number;
    buildMs: number;
    zodMs: number;
    totalMs: number;
  };
}

type Fields = Record<string, string>;

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "");
}

function parseFields(lines: string[]): Fields {
  const fields: Fields = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = normalizeKey(trimmed.slice(0, colon));
    const value = trimmed.slice(colon + 1).trim();
    if (key) fields[key] = value;
  }
  return fields;
}

function splitSections(raw: string): { headerLines: string[]; blockSections: string[] } {
  const parts = raw
    .split(/^---\s*$/m)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new ParseMarkdownError("Document vide.", "EMPTY_DOCUMENT");
  }

  const headerLines: string[] = [];
  const blockSections: string[] = [];

  for (const part of parts) {
    if (/^##\s*Block/m.test(part) || /^###\s*Exercise/m.test(part)) {
      blockSections.push(part);
    } else if (blockSections.length === 0 && !/^##\s*Block/m.test(part)) {
      headerLines.push(...part.split("\n"));
    } else {
      blockSections.push(part);
    }
  }

  if (blockSections.length === 0) {
    const allLines = raw.split("\n");
    const blockStart = allLines.findIndex((l) => /^##\s*Block/i.test(l.trim()));
    if (blockStart === -1) {
      throw new ParseMarkdownError(
        "Aucun bloc « ## Block » trouvé. Utilisez le format Markdown officiel.",
        "NO_BLOCKS",
      );
    }
    return {
      headerLines: allLines.slice(0, blockStart),
      blockSections: splitBlocks(allLines.slice(blockStart).join("\n")),
    };
  }

  return { headerLines, blockSections };
}

function splitBlocks(blockText: string): string[] {
  return blockText
    .split(/(?=^##\s*Block)/m)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumber(value: string | undefined, field: string): number {
  if (value == null || value === "") {
    throw new ParseMarkdownError(`Champ numérique manquant : ${field}`, "MISSING_FIELD", {
      field,
    });
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new ParseMarkdownError(`Valeur invalide pour ${field}: ${value}`, "INVALID_NUMBER", {
      field,
      value,
    });
  }
  return n;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function expandReps(value: string): Array<number | string> {
  const v = value.trim();
  if (v.includes(",")) {
    return v.split(",").map((x) => {
      const t = x.trim();
      const n = Number(t);
      return Number.isFinite(n) ? n : t;
    });
  }
  const range = v.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    const step = start <= end ? 1 : -1;
    const out: number[] = [];
    for (let i = start; step > 0 ? i <= end : i >= end; i += step) out.push(i);
    return out;
  }
  const n = Number(v);
  return Number.isFinite(n) ? [n] : [v];
}

function resolveFormat(typeRaw: string): WorkoutFormatType {
  const key = normalizeKey(typeRaw);
  const format = BLOCK_TYPE_TO_FORMAT[key];
  if (!format) {
    throw new ParseMarkdownError(
      `Type de bloc inconnu : ${typeRaw}`,
      "UNKNOWN_BLOCK_TYPE",
      { type: typeRaw, supported: Object.keys(BLOCK_TYPE_TO_FORMAT) },
    );
  }
  return format;
}

function parseExerciseSubsections(blockText: string): string[] {
  const parts = blockText.split(/(?=^###\s*Exercise)/im).map((p) => p.trim()).filter(Boolean);
  const exerciseParts = parts.filter(
    (p) => /^###\s*Exercise/im.test(p) || /^Exercise:/im.test(p),
  );
  if (exerciseParts.length > 0) return exerciseParts;
  return [blockText];
}

function buildSetsFromFields(
  fields: Fields,
  format: WorkoutFormatType,
  warnings: string[],
): ParsedWorkoutOutput["exercises"][0]["sets"] {
  const sets: NonNullable<ParsedWorkoutOutput["exercises"][0]["sets"]> = [];
  const rest = parseOptionalNumber(fields.rest ?? fields.restafterseconds);
  const rir = parseOptionalNumber(fields.rir);
  const rpe = parseOptionalNumber(fields.rpe);
  const loadUnit = fields.loadunit?.toLowerCase() as "kg" | "lb" | "bodyweight" | undefined;

  if (format === "emom") {
    const durationMin = parseNumber(fields.duration ?? fields.durationminutes, "Duration");
    const reps = parseNumber(fields.repsperminute ?? fields.reps, "RepsPerMinute");
    for (let i = 1; i <= durationMin; i++) {
      sets.push({
        setNumber: i,
        targetReps: reps,
        restAfterSeconds: 0,
        ...(rir != null ? { rir } : {}),
        ...(rpe != null ? { rpe } : {}),
      });
    }
    return sets;
  }

  if (format === "pyramid" || format === "ladder" || format === "reverse_pyramid") {
    const repsList = expandReps(fields.reps ?? fields.repssequence ?? "1");
    repsList.forEach((rep, idx) => {
      sets.push({
        setNumber: idx + 1,
        targetReps: rep,
        ...(rest != null ? { restAfterSeconds: rest } : {}),
        ...(rir != null ? { rir } : {}),
      });
    });
    return sets;
  }

  if (format === "hold" || format === "isometric") {
    const duration = parseNumber(fields.duration ?? fields.durationseconds, "Duration");
    const setCount = parseOptionalNumber(fields.sets) ?? 1;
    for (let i = 1; i <= setCount; i++) {
      sets.push({
        setNumber: i,
        durationSeconds: duration,
        ...(rest != null ? { restAfterSeconds: rest } : {}),
      });
    }
    return sets;
  }

  const setCount = parseOptionalNumber(fields.sets);
  const repsRaw = fields.reps;

  if (setCount != null && repsRaw != null) {
    const repsList = expandReps(repsRaw);
    if (repsList.length === setCount) {
      repsList.forEach((rep, idx) => {
        sets.push({
          setNumber: idx + 1,
          targetReps: rep,
          ...(rest != null ? { restAfterSeconds: rest } : {}),
          ...(rir != null ? { rir } : {}),
          ...(rpe != null ? { rpe } : {}),
          ...(fields.weight ? { targetWeight: parseNumber(fields.weight, "Weight") } : {}),
          ...(loadUnit ? { loadUnit } : {}),
        });
      });
      return sets;
    }
    for (let i = 1; i <= setCount; i++) {
      sets.push({
        setNumber: i,
        targetReps: repsList.length === 1 ? repsList[0] : repsRaw,
        ...(rest != null ? { restAfterSeconds: rest } : {}),
        ...(rir != null ? { rir } : {}),
        ...(rpe != null ? { rpe } : {}),
        ...(fields.weight ? { targetWeight: parseNumber(fields.weight, "Weight") } : {}),
        ...(loadUnit ? { loadUnit } : format === "weighted" ? { loadUnit: "kg" as const } : format === "bodyweight" ? { loadUnit: "bodyweight" as const } : {}),
      });
    }
    return sets;
  }

  if (repsRaw) {
    warnings.push("Sets non spécifié — 1 série par défaut.");
    sets.push({
      setNumber: 1,
      targetReps: expandReps(repsRaw)[0],
      ...(rest != null ? { restAfterSeconds: rest } : {}),
    });
    return sets;
  }

  throw new ParseMarkdownError(
    "Champs Sets/Reps ou Duration requis pour ce bloc.",
    "INCOMPLETE_BLOCK",
    { fields },
  );
}

function buildExerciseFromBlock(
  blockText: string,
  warnings: string[],
): ParsedWorkoutOutput["exercises"] {
  const subsections = parseExerciseSubsections(blockText);
  const exercises: ParsedWorkoutOutput["exercises"] = [];
  const blockFields = parseFields(
    blockText
      .split("\n")
      .filter((l) => !/^###\s*Exercise/i.test(l.trim()) && !/^Exercise:/i.test(l.trim())),
  );
  const blockType = blockFields.type;
  if (!blockType) {
    throw new ParseMarkdownError("Champ Type manquant dans un bloc.", "MISSING_TYPE");
  }
  const format = resolveFormat(blockType);
  const groupId = blockFields.group ?? blockFields.groupid;

  const exerciseSections =
    subsections.length > 0 ? subsections : [blockText];

  for (const section of exerciseSections) {
    const lines = section.split("\n");
    const fields = parseFields(lines);
    const name = fields.exercise ?? fields.name;
    if (!name) {
      throw new ParseMarkdownError(
        "Champ Exercise manquant.",
        "MISSING_EXERCISE",
        { section: section.slice(0, 120) },
      );
    }

    const mergedFields = { ...blockFields, ...fields };
    const sets = buildSetsFromFields(mergedFields, format, warnings);
    const timeCapSeconds =
      format === "emom"
        ? (parseOptionalNumber(mergedFields.duration ?? mergedFields.durationminutes) ?? 0) * 60
        : parseOptionalNumber(mergedFields.duration ?? mergedFields.durationseconds);

    exercises.push({
      id: randomUUID(),
      name,
      format,
      sets,
      ...(groupId ? { groupId } : {}),
      ...(timeCapSeconds ? { timeCapSeconds } : {}),
      ...(mergedFields.note || mergedFields.notes
        ? { instructions: mergedFields.note ?? mergedFields.notes }
        : {}),
    });
  }

  return exercises;
}

/**
 * Parse déterministe du format Markdown officiel Cali Tracker.
 */
export function parseWorkoutMarkdown(raw: string): ParseMarkdownResult {
  const totalStart = performance.now();
  const warnings: string[] = [];

  const tLex = performance.now();
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) {
    throw new ParseMarkdownError("Texte vide.", "EMPTY_DOCUMENT");
  }

  const { headerLines, blockSections } = splitSections(text);
  const header = parseFields(headerLines);
  const lexMs = performance.now() - tLex;

  const tBuild = performance.now();
  const exercises: ParsedWorkoutOutput["exercises"] = [];

  for (const block of blockSections) {
    const blockBody = block.replace(/^##\s*Block\s*/i, "").trim();
    exercises.push(...buildExerciseFromBlock(blockBody, warnings));
  }

  if (exercises.length === 0) {
    throw new ParseMarkdownError("Aucun exercice extrait.", "NO_EXERCISES");
  }

  const primaryFormat = exercises[0]?.format ?? "classic";
  const draft: ParsedWorkoutOutput = {
    title: header.name ?? header.title,
    description: header.goal ?? header.description,
    format: primaryFormat,
    estimatedDurationSeconds: parseOptionalNumber(
      header.estimatedduration ?? header.duration,
    ),
    exercises,
    rawNotes: header.notes,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
  const buildMs = performance.now() - tBuild;

  const tZod = performance.now();
  try {
    const workout = parsedWorkoutSchema.parse(draft);
    const zodMs = performance.now() - tZod;
    const totalMs = performance.now() - totalStart;
    return {
      workout,
      warnings: workout.warnings ?? [],
      durationMs: Math.round(totalMs),
      phaseTimings: {
        lexMs: Math.round(lexMs),
        buildMs: Math.round(buildMs),
        zodMs: Math.round(zodMs),
        totalMs: Math.round(totalMs),
      },
    };
  } catch (e) {
    if (e instanceof ZodError) {
      throw new ParseMarkdownError(
        "Le document ne respecte pas le schéma workout.",
        "VALIDATION_FAILED",
        e.flatten(),
      );
    }
    throw e;
  }
}
