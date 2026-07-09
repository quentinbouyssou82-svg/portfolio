/** Retourne le lundi de la semaine contenant la date donnée. */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatFrenchDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const prefix =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonne soirée";
  return `${prefix} ${name}`;
}

export function getDayIndex(isoDate: string, weekStart: string): number {
  const start = new Date(weekStart + "T12:00:00").getTime();
  const current = new Date(isoDate + "T12:00:00").getTime();
  return Math.round((current - start) / (1000 * 60 * 60 * 24));
}
