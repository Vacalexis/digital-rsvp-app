/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date string to Portuguese locale (long format)
 * E.g., "domingo, 14 de março de 2026"
 */
export function formatDatePT(dateStr: string): string {
  if (!dateStr) return "";
  try {
    // Handle ISO date strings from IonDatetime (e.g., "2026-03-14T00:00:00")
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) {
      return dateStr;
    }

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string to short Portuguese locale
 * E.g., "14 mar 2026"
 */
export function formatDateShortPT(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) {
      return dateStr;
    }

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate days until a given date
 */
export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;

  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}
