import { TZDate } from "@date-fns/tz";
import { UTCDate } from "@date-fns/utc";

import { seatoolRecordWithUpdatedDateSchema } from "../../../seatool-tables";

// Dates on SEA Tool are created without a time and stored as an
// ISO string at midnight UTC. OneMAC dates are displayed at ET
// which results in the date looking like it is a day off because
// EDT is -4 hours from UTC and EST is -5 hours from UTC. In order
// to make this look normal, we need to shift the time to account
// for the difference in time handling in OneMAC and SEA Tool.
// Convert the date to midnight ET instead of midnight UTC.
export const shiftSeatoolTime = (date: number): string => {
  const utcDate = new UTCDate(date);
  return new TZDate(
    utcDate.getFullYear(),
    utcDate.getMonth(),
    utcDate.getDate(),
    utcDate.getHours(),
    utcDate.getMinutes(),
    utcDate.getSeconds(),
    utcDate.getMilliseconds(),
    "America/New_York",
  ).toISOString();
};

export const transform = () => {
  return seatoolRecordWithUpdatedDateSchema.transform((data) => ({
    id: data.ID_Number,
    changedDate: typeof data.Changed_Date === "number" ? shiftSeatoolTime(data.Changed_Date) : null,
  }));
};

export type Schema = ReturnType<typeof transform>;
