import type { Request, Response, NextFunction } from "express";
import { prisma } from "@cali/database";
import { isSessionExpired } from "@cali/utils";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Session requise." });
    return;
  }

  const session = await prisma.authSession.findUnique({ where: { token } });
  if (!session || isSessionExpired(session.expiresAt)) {
    if (session) {
      await prisma.authSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    res.status(401).json({ code: "SESSION_EXPIRED", message: "Session expirée." });
    return;
  }

  next();
}
