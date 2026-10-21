/** Prompt Vision ultra-court — JSON strict, latence minimale. */
export const VISION_EXTRACTION_PROMPT = `Course livreur FR. JSON only, null if unread, never invent:
{"platform":"Uber Eats"|"Deliveroo"|"Stuart"|"Amazon Flex"|"Autre"|null,"pickup":string|null,"dropoff":string|null,"payout":number|null,"distanceKm":number|null,"durationMin":number|null,"emptyReturnKm":number|null,"pickupDistanceKm":number|null,"multipleOffersDetected":boolean|null,"bonusIncluded":boolean|null}
payout/distanceKm/durationMin MUST be bare JSON numbers (e.g. 12.45), never strings like "12,45 €".
If a value is unknown, return null.
Do not replace missing values with 0.
Set multipleOffersDetected=true if more than one possible offer is visible.`;
