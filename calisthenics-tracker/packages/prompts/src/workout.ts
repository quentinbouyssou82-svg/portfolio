/**
 * Prompt compact — style proche du test terminal `ollama run`.
 * Schéma validé ensuite par Zod (pas de schéma inline verbeux).
 */
export function buildWorkoutParsePrompt(rawWorkoutText: string): string {
  return `Convert this workout into valid JSON.

Workout:

${rawWorkoutText.trim()}

Return ONLY valid JSON matching this shape:
{"format":"classic","exercises":[{"id":"<uuid>","name":"<string>","format":"classic","sets":[{"setNumber":1,"targetReps":5,"restAfterSeconds":180}]}],"warnings":[]}`;
}

export function buildSessionAnalysisPrompt(
  plannedJson: string,
  performedJson: string,
): string {
  return `Tu es un coach en calisthénie. Compare la séance prévue vs réalisée.

RÈGLES :
- Réponds UNIQUEMENT en JSON valide.
- Identifie échecs, dépassements, sous-performance, progressions.
- Donne conseils concrets pour la prochaine séance.

SCHÉMA :
{
  "aiAnalysis": "string — synthèse en français",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "failedAreas": ["string"],
  "exceededAreas": ["string"],
  "underperformedAreas": ["string"],
  "progressAreas": ["string"]
}

PRÉVU :
${plannedJson}

RÉALISÉ :
${performedJson}`;
}

export function buildInSessionQuestionPrompt(
  question: string,
  sessionContext: string,
): string {
  return `Tu es un assistant coach calisthénie pendant une séance en cours.
Réponds en français, de façon concise et actionnable (2-4 phrases max).
Base-toi uniquement sur le contexte fourni.

CONTEXTE SÉANCE :
${sessionContext}

QUESTION :
${question}`;
}
