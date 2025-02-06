import { format, add } from "date-fns";

export function formatDate(date: number | null | undefined) {
  if (!date || date === undefined) {
    return "Pending";
  }

  return format(date, "MMMM d, yyyy");
}

const isDST = (date: Date): boolean => {
  const januaryOffset = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const julyOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return date.getTimezoneOffset() !== Math.max(januaryOffset, julyOffset);
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
