import { isAHoliday } from "@18f/us-federal-holidays";
import { TZDate } from "@date-fns/tz";
import { UTCDate } from "@date-fns/utc";
import { format, isWeekend, startOfDay } from "date-fns";

const isEasternHoliday = (date: TZDate): boolean =>
  isAHoliday(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)));

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
 * Returns the timestamp for UTC midnight of the current business day.
 * If no date is provided, it returns the current business day relative to today.
 * If the date is after 5pm Eastern time, it returns the next business day.
 * If the date is on a federal holiday or weekend, it returns the next business day.
 *
 * @param date the date object to return the timestamp for
 * @returns the timestamp of midnight UTC of the current business day relative to the date or today, if none provided
 */
export const getBusinessDayTimestamp = (date: Date = new Date()): number => {
  const nyDateTime = new TZDate(date.toISOString(), "America/New_York");

  while (nyDateTime.getHours() >= 17 || isEasternHoliday(nyDateTime) || isWeekend(nyDateTime)) {
    nyDateTime.setDate(nyDateTime.getDate() + 1);
    nyDateTime.setHours(0, 0, 0, 0);
  }

  return startOfDay(
    new UTCDate(nyDateTime.getFullYear(), nyDateTime.getMonth(), nyDateTime.getDate()),
  ).getTime();
};
