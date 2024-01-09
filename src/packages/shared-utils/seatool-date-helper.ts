import moment from "moment-timezone";

// This manually accounts for the offset between the client's timezone and UTC.
export const offsetForUtc = (date: Date): Date => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
}

// This creates a Date for midnight today, then accounts for timezone offset.
export const seaToolFriendlyTimestamp = (): number => {
  const today = new Date();
  today.setHours(0,0,0,0);
  return offsetForUtc(today).getTime();
};

// This takes an epoch string and converts it to a standard format for display
export const formatSeatoolDate = (date: string): string => {
  return moment(date).tz("UTC").format("MM/DD/yyyy")
}