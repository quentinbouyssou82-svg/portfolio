import cors from "cors";
import express, { type Express } from "express";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { ollamaRouter } from "./routes/ollama.js";
import { debugRouter } from "./routes/debug.js";
import { workoutsRouter } from "./routes/workouts.js";
import { requireAuth } from "./middleware/session.js";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/ollama", ollamaRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/workouts", workoutsRouter);
  app.use("/api/debug", debugRouter);

  app.get("/api/me", requireAuth, (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("[cali-api] error:", err);
      res.status(500).json({ code: "INTERNAL_ERROR", message: err.message });
    },
  );

  return app;
}
