import moment from "moment-timezone";
import * as fedHolidays from "@18f/us-federal-holidays";

// Takes a local epoch for a moment in time, and returns the UTC epoch for that same moment
export const offsetToUtc = (date: Date): Date => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

// Takes a UTC epoch for a moment in time, and returns the local epoch for that same moment
export const offsetFromUtc = (date: Date): Date => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

// This creates a Date for midnight today, then accounts for timezone offset.
export const seaToolFriendlyTimestamp = (date?: Date): number => {
  // If you don't pass a date, we assume you want today the timestamp for today, midnight, utc.
  if (!date) {
    date = new Date();
    date.setHours(0, 0, 0, 0);
  }
  return offsetToUtc(date).getTime();
};

// This takes an epoch string and converts it to a standard format for display
export const formatSeatoolDate = (date: string): string => {
  return moment(date).tz("UTC").format("MM/DD/yyyy");
};

export const getNextBusinessDayTimestamp = (
  date: Date = new Date()
): number => {
  let localeStringDate = date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "short",
  });
  let localeStringHours24 = date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
  });
  let localeDate = new Date(localeStringDate);
  const after5pmEST = parseInt(localeStringHours24, 10) >= 17;
  const isHoliday = fedHolidays.isAHoliday(localeDate);
  const isWeekend = !(localeDate.getDay() % 6);
  if (after5pmEST || isHoliday || isWeekend) {
    let nextDate = localeDate;
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(12, 0, 0, 0);
    return getNextBusinessDayTimestamp(nextDate);
  }

  // Return the next business day's epoch for midnight UTC
  let ret = offsetToUtc(localeDate).getTime();
  return ret;
};
