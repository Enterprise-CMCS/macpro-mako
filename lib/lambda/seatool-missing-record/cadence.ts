import { TZDate } from "@date-fns/tz";

export const EASTERN_TIME_ZONE = "America/New_York";
export const MIN_CALENDAR_DAYS_SINCE_SUBMIT = 4;

export interface EasternCalendarDate {
  year: number;
  month: number;
  day: number;
}

export function parseSubmissionInstant(value: string | number | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const milliseconds = value > 0 && value < 1e12 ? value * 1000 : value;
    const parsed = new Date(milliseconds);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && String(numeric) === trimmed) {
    return parseSubmissionInstant(numeric);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function easternCalendarDate(instant: Date): EasternCalendarDate {
  const eastern = new TZDate(instant.toISOString(), EASTERN_TIME_ZONE);
  return {
    year: eastern.getFullYear(),
    month: eastern.getMonth() + 1,
    day: eastern.getDate(),
  };
}

export function formatEasternCalendarDatePath(instant: Date): {
  year: string;
  month: string;
  day: string;
} {
  const { year, month, day } = easternCalendarDate(instant);
  return {
    year: String(year),
    month: String(month).padStart(2, "0"),
    day: String(day).padStart(2, "0"),
  };
}

export function calendarDaysBetweenEastern(start: Date, end: Date): number {
  const startDate = easternCalendarDate(start);
  const endDate = easternCalendarDate(end);
  const startUtc = Date.UTC(startDate.year, startDate.month - 1, startDate.day);
  const endUtc = Date.UTC(endDate.year, endDate.month - 1, endDate.day);
  return Math.floor((endUtc - startUtc) / 86_400_000);
}

export function daysSinceSubmission(
  submissionDate: string | number | Date,
  now: Date = new Date(),
): number | null {
  const submitted = parseSubmissionInstant(submissionDate);
  if (!submitted) {
    return null;
  }

  return calendarDaysBetweenEastern(submitted, now);
}

export function isPastMissingRecordCadence(
  submissionDate: string | number | Date,
  now: Date = new Date(),
): boolean {
  const days = daysSinceSubmission(submissionDate, now);
  return days !== null && days >= MIN_CALENDAR_DAYS_SINCE_SUBMIT;
}
