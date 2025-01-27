import { TZDate } from "@date-fns/tz";
import { UTCDate } from "@date-fns/utc";
import { format, startOfDay, isWeekend, addDays } from "date-fns";
import { isAHoliday } from "@18f/us-federal-holidays";

/**
 * Returns the epoch timestamp for midnight UTC time for the date provided.
 * If no date is provided, it returns the timestamp of midnight UTC time today.
 *
 * @param date the date object or date string to return the timestamp for
 * @returns epoch timestamp for midnight UTC of the date or today, if none provided
 */
export const seaToolFriendlyTimestamp = (date?: Date | string): number => {
  const utcDate = date ? new UTCDate(date) : new UTCDate();
  return startOfDay(utcDate).getTime();
};

/**
 * Returns the formatted date string of the UTC timezone for the date provided.
 * If no date is provided, it returns an empty string.
 *
 * @param date the date object or date string to return the formatted time of
 * @returns the `MM/dd/yyyy` formatted date string for the UTC time of the date provided
 * or an empty string if no date was provided
 */
export const formatSeatoolDate = (date?: Date | string): string => {
  if (!date) return "";
  return format(new UTCDate(date), "MM/dd/yyyy");
};

/**
 * Returns the epoch timestamp for midnight UTC time for the date provided.
 * If no date is provided, it returns the timestamp of midnight UTC time today.
 * If the date is after 5pm Eastern time, it returns midnight UTC the next day.
 * If the date is on a federal holiday or weekend, it returns midnight UTC of the
 * next business day.
 *
 * @param date the date object to return the timestamp for
 * @returns epoch timestamp for midnight UTC of the date or today, if none provided
 */
export const getNextBusinessDayTimestamp = (date: Date = new Date()): number => {
  // Get the date in Eastern time
  const nyDateTime = new TZDate(date.toISOString(), "America/New_York");

  // Check if the time is after 5pm Eastern time or if the day is not a business day.
  // If any of those are true, check again for the next day.
  if (nyDateTime.getHours() >= 17 || isAHoliday(nyDateTime) || isWeekend(nyDateTime)) {
    return getNextBusinessDayTimestamp(startOfDay(addDays(nyDateTime, 1)));
  }

  const nextBusinessDay = startOfDay(addDays(new UTCDate(date), 1) as UTCDate) as UTCDate;
  if (isAHoliday(nextBusinessDay) || isWeekend(nextBusinessDay)) {
    return getNextBusinessDayTimestamp(nextBusinessDay);
  }

  return nextBusinessDay.getTime();
};
