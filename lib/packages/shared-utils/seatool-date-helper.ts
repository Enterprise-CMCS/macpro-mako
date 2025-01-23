import { TZDate } from "@date-fns/tz";
import { UTCDate } from "@date-fns/utc";
import { format, startOfDay, isWeekend, addDays } from "date-fns";
import { isAHoliday } from "@18f/us-federal-holidays";

// Returns the timestamp at midnight UTC time of the date, or today if the date is null
export const seaToolFriendlyTimestamp = (date?: Date): number => {
  const utcDate = date ? new UTCDate(date) : new UTCDate();
  return startOfDay(utcDate).getTime();
};

// Converts a date string to a standard date format using the UTC timezone
export const formatSeatoolDate = (date: string): string => {
  if (!date) return "";
  return format(new UTCDate(date), "MM/dd/yyyy");
};

export const getNextBusinessDayTimestamp = (date: Date = new Date()): number => {
  const nyDateTime = new TZDate(date.toISOString(), "America/New_York");

  if (nyDateTime.getHours() >= 17 || isAHoliday(nyDateTime) || isWeekend(nyDateTime)) {
    return getNextBusinessDayTimestamp(startOfDay(addDays(nyDateTime, 1)));
  }

  return startOfDay(new UTCDate(date)).getTime();
};
