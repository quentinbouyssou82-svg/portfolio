import { Router } from "express";
import { z } from "zod";
import { prisma } from "@cali/database";
import { generateSessionToken, getSessionExpiry, verifyPin } from "@cali/utils";

const loginSchema = z.object({
  pin: z.string().min(4).max(8),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_PIN", message: "PIN invalide." });
    return;
  }

  const expectedPin = process.env.APP_PIN || "0610";
  const secret = process.env.SESSION_SECRET || "cali-local-secret";

  if (!verifyPin(parsed.data.pin, expectedPin, secret)) {
    res.status(401).json({ code: "WRONG_PIN", message: "Code incorrect." });
    return;
  }

  const token = generateSessionToken();
  const expiresAt = getSessionExpiry();

  await prisma.authSession.create({
    data: { token, expiresAt },
  });

  res.json({
    token,
    expiresAt: expiresAt.toISOString(),
  });
});

authRouter.post("/logout", async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    await prisma.authSession.deleteMany({ where: { token } });
  }
  res.json({ ok: true });
});

authRouter.get("/session", async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Non connecté." });
    return;
  }

  const session = await prisma.authSession.findUnique({ where: { token } });
  if (!session || session.expiresAt <= new Date()) {
    res.status(401).json({ code: "SESSION_EXPIRED", message: "Session expirée." });
    return;
  }

  res.json({
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
  });
});
