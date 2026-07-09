let navCount = 0;
const recent: Array<{ ts: string; from: string; to: string; reason: string }> = [];

export function logNavigation(from: string, to: string, reason: string): void {
  navCount += 1;
  const entry = {
    ts: new Date().toISOString(),
    from,
    to,
    reason,
  };
  recent.push(entry);
  if (recent.length > 30) recent.shift();

  console.info(
    `[nav #${navCount}] ${from} → ${to}`,
    { reason, session: "see auth log", count: navCount },
  );

  if (navCount > 20) {
    console.error("[nav] ALERTE: plus de 20 navigations", recent);
  }
}

export function logRouteState(
  scope: string,
  data: {
    pathname: string;
    isLoading: boolean;
    hasSession: boolean;
    action?: string;
  },
): void {
  console.info(`[route:${scope}]`, data);
}

export function resetNavigationLog(): void {
  navCount = 0;
  recent.length = 0;
}
