/**
 * Utility functions for Event-related operations
 */

import { Event, InvitationTheme, INVITATION_THEMES } from "@models/index";

/**
 * Get monogram from event hosts
 * Returns "A&B" for two hosts, "A" for one, or "♥" as fallback
 */
export function getMonogram(event: Event): string {
  const hosts = (event.hosts || []).map((name) => name.trim()).filter(Boolean);

  if (hosts.length >= 2) {
    const first = hosts[0].charAt(0).toUpperCase();
    const second = hosts[1].charAt(0).toUpperCase();
    return `${first}&${second}`;
  }

  if (hosts.length === 1) {
    return hosts[0].charAt(0).toUpperCase();
  }

  return "♥";
}

/**
 * Get theme color from theme name
 */
export function getThemeColor(theme: InvitationTheme): string {
  return INVITATION_THEMES.find((t) => t.value === theme)?.color || "#8b5a5a";
}

/**
 * Get time label from event (start time, end time, or range)
 * Returns null if no time is set
 */
export function getTimeLabel(event: Event): string | null {
  const startFromEvent = (event.time || "").trim();
  const startFromSchedule = (event.schedule?.[0]?.time || "").trim();
  const start = startFromEvent || startFromSchedule;
  const end = (event.endTime || "").trim();
  const normalizedEnd = end === "00:00" ? "" : end;

  if (start && normalizedEnd) return `${start} - ${normalizedEnd}`;
  if (start) return start;
  if (normalizedEnd) return `até ${normalizedEnd}`;
  return null;
}

/**
 * Check if event is in the past
 */
export function isEventPast(event: Event): boolean {
  const now = new Date();
  const baseDate = event.endDate || event.date;
  const endTime = event.endTime || event.time || "23:59";

  const [hours, minutes] = endTime.split(":").map((value) => Number(value));
  const date = new Date(baseDate);

  if (!Number.isNaN(hours)) {
    if (hours === 0 && minutes === 0) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  }

  return date < now;
}
