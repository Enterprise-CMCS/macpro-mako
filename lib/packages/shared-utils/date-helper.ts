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
  }

  const isDST = (date: number): boolean => {
    const jan = new Date(date).getTimezoneOffset();
    const jul = new Date(new Date(date).setMonth(6)).getTimezoneOffset();
    return new Date(date).getTimezoneOffset() < Math.max(jan, jul);
  };

  const timezoneAbbreviation = isDST(date) ? "EDT" : "EST";
  return dateFns.format(new Date(date), `MMM d, yyyy '@ 11:59pm ${timezoneAbbreviation}'`);
}
