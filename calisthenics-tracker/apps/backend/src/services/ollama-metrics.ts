/** Compteur global d'appels HTTP vers Ollama /api/generate */
let generateCallCount = 0;
let tagsCallCount = 0;

export function incrementGenerateCalls(): number {
  generateCallCount += 1;
  return generateCallCount;
}

export function incrementTagsCalls(): number {
  tagsCallCount += 1;
  return tagsCallCount;
}

export function getOllamaMetrics() {
  return {
    generateCalls: generateCallCount,
    tagsCalls: tagsCallCount,
  };
}

export function resetOllamaMetrics(): void {
  generateCallCount = 0;
  tagsCallCount = 0;
}

/** Estimation grossière : ~4 caractères par token (latin). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function nsToMs(ns?: number): number | undefined {
  if (ns == null) return undefined;
  return Math.round(ns / 1_000_000);
}
