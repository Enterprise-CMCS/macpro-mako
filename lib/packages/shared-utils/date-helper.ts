import * as dateFns from "date-fns";
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
