// This manually accounts for the offset between the client's timezone and UTC.
export const offsetForUtc = (date: Date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
}

// This creates a Date for midnight today, then accounts for timezone offset.
export const seatoolTimestampForToday = () => {
  const today = new Date();
  today.setHours(0,0,0,0);
  return offsetForUtc(today);
};