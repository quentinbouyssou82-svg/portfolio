const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

function startOfLocalDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Date relative en français pour les avis bêta (évolue avec le temps réel).
 * Ex. : il y a 2 h · aujourd'hui · hier · il y a 3 jours · il y a 2 semaines
 */
export function formatRelativeReviewDate(
  postedAt: Date,
  now: Date = new Date(),
): string {
  const diffMs = now.getTime() - postedAt.getTime();
  if (diffMs < 0) return "à l'instant";

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const dayDiff = Math.round(
    (startOfLocalDay(now) - startOfLocalDay(postedAt)) / 86_400_000,
  );

  if (minutes < 1) return "à l'instant";

  if (minutes < 60) {
    return minutes === 1 ? "il y a 1 min" : `il y a ${minutes} min`;
  }

  if (dayDiff === 0) {
    if (hours >= 5) return "aujourd'hui";
    return hours === 1 ? "il y a 1 h" : `il y a ${hours} h`;
  }

  if (dayDiff === 1) return "hier";

  if (dayDiff < 7) {
    return dayDiff === 1 ? "hier" : `il y a ${dayDiff} jours`;
  }

  const weeks = Math.floor(dayDiff / 7);
  if (weeks < 5) {
    return weeks === 1 ? "il y a 1 semaine" : `il y a ${weeks} semaines`;
  }

  const months = Math.floor(dayDiff / 30);
  if (months < 12) {
    return months <= 1 ? "il y a 1 mois" : rtf.format(-months, "month");
  }

  const years = Math.floor(dayDiff / 365);
  return years <= 1 ? "il y a 1 an" : rtf.format(-years, "year");
}
