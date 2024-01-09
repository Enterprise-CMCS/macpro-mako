import moment from "moment-timezone";

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