import * as dateFns from "date-fns";
import { DateTime } from "luxon";
export function formatDate(date: number | null | undefined) {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return dateFns.format(date, "MMMM d, yyyy");
  }
}

export function formatNinetyDaysDate(date: number | null | undefined): string {
  if (!date || date === undefined) {
    return "Pending";
  } else {
    return dateFns.format(dateFns.add(date, { days: 90 }), "MMM d, yyyy '@ 11:59pm ET'");
  }
}

export const getDateFromMillis = (D: number | Date) =>
  typeof D === "number" ? DateTime.fromMillis(D).toFormat("LLL d, yyyy") : DateTime.fromJSDate(D).toFormat("LLL d, yyyy");
