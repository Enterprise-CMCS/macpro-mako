import { TZDate } from "@date-fns/tz";
import { add, format } from "date-fns";

export const isDST = (date: Date): boolean => {
  const jan = new Date(date).getTimezoneOffset();
  const jul = new Date(new Date(date).setMonth(6)).getTimezoneOffset();
  return new Date(date).getTimezoneOffset() < Math.max(jan, jul);
};

export function formatNinetyDaysDate(date: number | null | undefined): string {
  if (!date) {
    return "Pending";
  }

  const baseDate = new Date(date);
  const ninetyDaysLater = add(baseDate, { days: 90 });

  const timezoneAbbreviation = isDST(ninetyDaysLater) ? "EDT" : "EST";
  return format(ninetyDaysLater, `MMM d, yyyy '@ 11:59pm ${timezoneAbbreviation}'`);
}

export function formatDate(dateValue: string | number) {
  const dateObj = new Date(dateValue);

  return format(dateObj, "MMMM d, yyyy");
}

export const formatDateToET = (
  utcDateValue: string | number,
  formatValue: string = "eee, MMM d yyyy, hh:mm:ss a",
  includeTimezone: boolean = true,
) => {
  const utcDateObj = new TZDate(new Date(utcDateValue).toISOString(), "America/New_York");

  if (includeTimezone) {
    const tzTag = format(utcDateObj, "z") === "GMT-5" ? "EST" : "EDT";
    return format(utcDateObj, `${formatValue} '${tzTag}'`);
  }
  return format(utcDateObj, formatValue);
};

export const formatDateToUTC = (
  utcDateValue: string | number,
  formatValue: string = "MMMM d, yyyy",
) => {
  const utcDateObj = new TZDate(new Date(utcDateValue).toISOString(), "UTC");

  return format(utcDateObj, formatValue);
};

export const isEpochStartDate = (date: string | number | Date) => {
  return new Date(date).getTime() === new Date("1970-01-01T00:00:00.000Z").getTime();
};
