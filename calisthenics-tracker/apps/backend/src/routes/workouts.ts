import { Router, type Response } from "express";
import { z } from "zod";
import { prisma } from "@cali/database";
import {
  parseWorkout,
  resolveParseMode,
  ParseWorkoutError,
  ParseMarkdownError,
  OllamaUnavailableError,
} from "../services/parse-workout.js";
import { getOllamaMetrics, resetOllamaMetrics } from "../services/ollama-metrics.js";
import { requireAuth } from "../middleware/session.js";
import { logger } from "../lib/logger.js";

const parseBodySchema = z.object({
  rawText: z.string().min(1).max(50_000),
  /** markdown (défaut) | llm (compatibilité IA) */
  parseMode: z.enum(["markdown", "llm", "md", "ai"]).optional(),
});

const setLogSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  setNumber: z.number().int().positive(),
  round: z.number().int().nonnegative().default(0),
  actualReps: z.number().int().nonnegative().optional(),
  actualWeight: z.number().nonnegative().optional(),
  rir: z.number().int().min(0).max(10).optional(),
  rpe: z.number().min(1).max(10).optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  comments: z.string().max(2000).optional(),
});

export const workoutsRouter = Router();

workoutsRouter.use(requireAuth);

function sendSse(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function runParse(
  rawText: string,
  mode: ReturnType<typeof resolveParseMode>,
  onProgress?: (message: string) => void,
) {
  return parseWorkout(rawText, mode, onProgress);
}

/** Parsing IA avec progression SSE */
workoutsRouter.post("/parse/stream", async (req, res) => {
  const parsed = parseBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_BODY", message: "Texte requis." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const requestId = `parse-${Date.now()}`;
  const rawText = parsed.data.rawText;
  const parseMode = resolveParseMode(parsed.data.parseMode, String(req.query.parseMode ?? ""));
  logger.info("workouts.parse", "✅ Texte reçu", {
    requestId,
    textLength: rawText.length,
    parseMode,
  });

  try {
    sendSse(res, "progress", { message: "Lecture…", step: "start" });
    resetOllamaMetrics();
    const parseStart = Date.now();

    const result = await runParse(rawText, parseMode, (message) => {
      sendSse(res, "progress", { message, step: "generating" });
    });

    logger.info("workouts.parse", "✅ JSON final validé", {
      requestId,
      parseMode: result.parseMode,
      durationMs: result.durationMs,
      phaseTimings: result.phaseTimings,
      ollamaMetrics: parseMode === "llm" ? getOllamaMetrics() : undefined,
      exercises: result.workout.exercises.length,
      title: result.workout.title,
    });

    sendSse(res, "progress", { message: "Sauvegarde SQLite…", step: "saving" });
    logger.info("workouts.parse", "Création WorkoutSession…", { requestId });

    const tPrisma = Date.now();
    let session;
    try {
      session = await prisma.workoutSession.create({
        data: {
          title: result.workout.title ?? "Séance",
          status: "parsed",
          rawText,
          plannedJson: JSON.stringify(result.workout),
        },
      });
    } catch (dbError) {
      logger.error("workouts.parse", "❌ Échec création WorkoutSession", {
        requestId,
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      throw dbError;
    }

    logger.info("workouts.parse", "✅ WorkoutSession créée", {
      requestId,
      sessionId: session.id,
      prismaMs: Date.now() - tPrisma,
      totalWallMs: Date.now() - parseStart,
      ollamaGenerateCalls: getOllamaMetrics().generateCalls,
      ollamaTagsCalls: getOllamaMetrics().tagsCalls,
    });

    sendSse(res, "complete", {
      sessionId: session.id,
      workout: result.workout,
      warnings: result.warnings,
      durationMs: result.durationMs,
      parseMode: result.parseMode,
    });
    res.end();
  } catch (e) {
    const error = formatParseError(e);
    logger.error("workouts.parse", "❌ Workflow interrompu", {
      requestId,
      code: error.body.code,
      message: error.body.message,
      details: error.body.details,
    });
    sendSse(res, "error", error.body);
    res.end();
  }
});

/** Parsing IA classique (JSON) */
workoutsRouter.post("/parse", async (req, res) => {
  const parsed = parseBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_BODY", message: "Texte requis." });
    return;
  }

  const requestId = `parse-${Date.now()}`;
  const parseMode = resolveParseMode(parsed.data.parseMode, String(req.query.parseMode ?? ""));
  logger.info("workouts.parse", "Start parse", {
    requestId,
    textLength: parsed.data.rawText.length,
    parseMode,
  });

  try {
    const result = await runParse(parsed.data.rawText, parseMode);

    logger.info("workouts.parse", "Success", {
      requestId,
      durationMs: result.durationMs,
    });

    const session = await prisma.workoutSession.create({
      data: {
        title: result.workout.title ?? "Séance",
        status: "parsed",
        rawText: parsed.data.rawText,
        plannedJson: JSON.stringify(result.workout),
      },
    });

    res.json({
      sessionId: session.id,
      workout: result.workout,
      warnings: result.warnings,
      durationMs: result.durationMs,
      parseMode: result.parseMode,
    });
  } catch (e) {
    const error = formatParseError(e);
    logger.error("workouts.parse", "Failed", { requestId, ...error });
    res.status(error.status).json(error.body);
  }
});

function formatParseError(e: unknown): {
  status: number;
  body: Record<string, unknown>;
} {
  if (e instanceof OllamaUnavailableError) {
    return {
      status: 503,
      body: {
        code: e.code,
        message: e.message,
        details: e.details,
      },
    };
  }
  if (e instanceof ParseWorkoutError || e instanceof ParseMarkdownError) {
    return {
      status: 422,
      body: {
        code: e.code,
        message: e.message,
        details: e.details,
        logs: e instanceof ParseWorkoutError ? e.logs : undefined,
      },
    };
  }
  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: e instanceof Error ? e.message : "Erreur inconnue.",
    },
  };
}

workoutsRouter.get("/:id", async (req, res) => {
  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: req.params.id },
      include: { setLogs: { orderBy: { completedAt: "asc" } } },
    });
    if (!session) {
      res.status(404).json({ code: "NOT_FOUND", message: "Séance introuvable." });
      return;
    }

    const workout = session.plannedJson
      ? JSON.parse(session.plannedJson)
      : null;

    res.json({
      id: session.id,
      title: session.title,
      status: session.status,
      rawText: session.rawText,
      workout,
      engineState: session.engineStateJson
        ? JSON.parse(session.engineStateJson)
        : null,
      setLogs: session.setLogs,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    });
  } catch (e) {
    logger.error("workouts.get", "Failed", { id: req.params.id, error: String(e) });
    res.status(500).json({ code: "INTERNAL_ERROR", message: "Erreur serveur." });
  }
});

workoutsRouter.post("/:id/start", async (req, res) => {
  try {
    const session = await prisma.workoutSession.update({
      where: { id: req.params.id },
      data: { status: "active", startedAt: new Date() },
    });
    res.json({ id: session.id, status: session.status });
  } catch {
    res.status(404).json({ code: "NOT_FOUND", message: "Séance introuvable." });
  }
});

workoutsRouter.patch("/:id/engine-state", async (req, res) => {
  const body = z.object({ engineState: z.unknown() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ code: "INVALID_BODY", message: "engineState requis." });
    return;
  }

  try {
    await prisma.workoutSession.update({
      where: { id: req.params.id },
      data: { engineStateJson: JSON.stringify(body.data.engineState) },
    });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ code: "NOT_FOUND", message: "Séance introuvable." });
  }
});

workoutsRouter.post("/:id/sets", async (req, res) => {
  const parsed = setLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_BODY", message: "Données invalides." });
    return;
  }

  try {
    const log = await prisma.setLog.create({
      data: { sessionId: req.params.id, ...parsed.data },
    });
    res.json(log);
  } catch {
    res.status(404).json({ code: "NOT_FOUND", message: "Séance introuvable." });
  }
});

workoutsRouter.post("/:id/complete", async (req, res) => {
  try {
    const session = await prisma.workoutSession.update({
      where: { id: req.params.id },
      data: { status: "completed", endedAt: new Date() },
    });
    res.json({ id: session.id, status: session.status });
  } catch {
    res.status(404).json({ code: "NOT_FOUND", message: "Séance introuvable." });
  }
});
