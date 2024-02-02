import moment from "moment-timezone";
import * as fedHolidays from '@18f/us-federal-holidays';


// This manually accounts for the offset between the client's timezone and UTC.
export const offsetForUtc = (date: Date): Date => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
}

// This creates a Date for midnight today, then accounts for timezone offset.
export const seaToolFriendlyTimestamp = (date?: Date): number => {
  // If you don't pass a date, we assume you want today the timestamp for today, midnight, utc.
  if(!date) {
    date = new Date();
    date.setHours(0,0,0,0);
  }
  return offsetForUtc(date).getTime();
};

// This takes an epoch string and converts it to a standard format for display
export const formatSeatoolDate = (date: string): string => {
  return moment(date).tz("UTC").format("MM/DD/yyyy")
}

export const getNextBusinessDayTimestamp = (date?: Date): number => {
  if(!date) {
    date = new Date();
  }

  let localeStringDate = date.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "short" });
  let localeStringHours24 = date.toLocaleString("en-US", { timeZone: "America/New_York", hour: 'numeric', hour12: false });
  let localeDate = new Date(localeStringDate);
  // Some logging
  console.log(`Evaluating ${localeStringDate} at ${localeStringHours24}`);

  // If it's after 5pm eastern, a holiday, or a weekend, recurse using the next day.
  if(parseInt(localeStringHours24,10) >= 17 || fedHolidays.isAHoliday(localeDate) || !(localeDate.getDay() % 6)) {
    let nextDate = localeDate;
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(12,0,0,0)
    console.log("Current date is not valid.  Will try " + nextDate)
    return getNextBusinessDayTimestamp(nextDate)
  }

  // If it's none of the above, return the time of the localeDate; equivalent to the next business day's epoch for midnight UTC
  let ret = offsetForUtc(localeDate).getTime();
  console.log('Current date is a valid business date.  Will return ' + ret);
  return ret;
}