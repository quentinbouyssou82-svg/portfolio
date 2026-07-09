import { Router } from "express";
import { checkOllamaHealth } from "../services/ollama.js";

export const ollamaRouter = Router();

ollamaRouter.get("/status", async (_req, res) => {
  const health = await checkOllamaHealth();
  res.json(health);
});
