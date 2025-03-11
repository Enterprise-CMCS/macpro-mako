import { TZDate } from "@date-fns/tz";
import { format, add } from "date-fns";

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

export const formatDateToEST = (
  utcDateValue: string | number,
  formatValue: string = "eee, MMM d yyyy, hh:mm:ss a 'ET'",
) => {
  const utcDateObj = new TZDate(new Date(utcDateValue).toISOString(), "America/New_York");

  return format(utcDateObj, formatValue);
};
