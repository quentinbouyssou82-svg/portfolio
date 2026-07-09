import { Router } from "express";
import { prisma } from "@cali/database";
import type { HealthStatus } from "@cali/types";
import { isOllamaAvailable, getOllamaConfig } from "../services/ollama.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database: HealthStatus["database"] = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  const ollamaOk = await isOllamaAvailable();
  const { model } = getOllamaConfig();

  const status: HealthStatus = {
    api: "ok",
    database,
    ollama: ollamaOk ? "ok" : "unavailable",
    model: ollamaOk ? model : undefined,
  };

  res.json(status);
});
