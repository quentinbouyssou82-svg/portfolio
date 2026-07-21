/** Prompt Vision ultra-court — JSON strict, latence minimale. */
export const VISION_EXTRACTION_PROMPT = `Course livreur FR. JSON only, null if unread, never invent:
{"platform":"Uber Eats"|"Deliveroo"|"Stuart"|"Amazon Flex"|"Autre"|null,"pickup":string|null,"dropoff":string|null,"payout":number|null,"distanceKm":number|null,"durationMin":number|null,"emptyReturnKm":number|null}
payout=€, distanceKm=km, durationMin=min, emptyReturnKm=0 if missing.`;
