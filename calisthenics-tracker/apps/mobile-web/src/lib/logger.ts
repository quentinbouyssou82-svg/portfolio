export type LogEntry = {
  ts: string;
  level: "info" | "warn" | "error";
  scope: string;
  message: string;
  meta?: unknown;
};

const MAX_LOGS = 100;
const logs: LogEntry[] = [];

function push(entry: LogEntry): void {
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  const prefix = `[${entry.scope}]`;
  if (entry.level === "error") console.error(prefix, entry.message, entry.meta ?? "");
  else if (entry.level === "warn") console.warn(prefix, entry.message, entry.meta ?? "");
  else console.log(prefix, entry.message, entry.meta ?? "");
}

export const clientLogger = {
  info: (scope: string, message: string, meta?: unknown) =>
    push({ ts: new Date().toISOString(), level: "info", scope, message, meta }),
  warn: (scope: string, message: string, meta?: unknown) =>
    push({ ts: new Date().toISOString(), level: "warn", scope, message, meta }),
  error: (scope: string, message: string, meta?: unknown) =>
    push({ ts: new Date().toISOString(), level: "error", scope, message, meta }),
  getLogs: () => [...logs],
  exportText: () =>
    logs.map((l) => `${l.ts} [${l.level}] ${l.scope}: ${l.message}`).join("\n"),
};
