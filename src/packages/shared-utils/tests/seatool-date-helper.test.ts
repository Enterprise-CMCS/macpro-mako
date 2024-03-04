import { it, describe, expect } from "vitest";
import {
  formatSeatoolDate,
  getNextBusinessDayTimestamp,
  offsetToUtc,
  seaToolFriendlyTimestamp,
} from "../seatool-date-helper";

// describe("offsetToUtc", () => {
//   it("offsets given date to UTC", () => {
//     const originalDate = new Date("2000-01-01T12:00:00-06:00");
//     expect(offsetToUtc(originalDate).toISOString()).toEqual(
//       "2000-01-01T18:00:00.000Z"
//     );
//   });
// });
//
// describe("offsetFromUtc", () => {
//   it("offsets UTC date to user's timezone", () => {
//     const originalDate = new Date("2000-01-01T12:00:00.000Z");
//     expect(offsetToUtc(originalDate).toISOString()).toEqual(
//       "2000-01-01T06:00:00-06:00"
//     );
//   });
// });

describe("seaToolFriendlyTimestamp", () => {
  it("converts given date to a time string representing the given date with 00:00:00 time", () => {
    const originalDate = new Date("2000-01-01T12:00:00.000Z");
    expect(seaToolFriendlyTimestamp(originalDate)).toEqual(946710000000);
  });
});

describe("formatSeatoolDate", () => {
  it("formats a SEATool date to a user-friendly format", () => {
    const originalDate = new Date("2000-01-01T00:00:00.000Z");
    expect(formatSeatoolDate(originalDate.toISOString())).toEqual("01/01/2000");
  });
});

describe("getNextBusinessDayTimestamp", () => {
  it("identifies weekenends", () => {
    let testDate = new Date(2024, 0, 27, 12, 0, 0); // Saturday, noon, utc
    let nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 29)); // Monday, midnight, utc
  });

  it("identifies holidays", () => {
    let testDate = new Date(2024, 0, 15, 12, 0, 0); // MLK Day, a Monday
    let nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 16)); // Tuesday, midnight, utc
  });

  it("identifies submissions after 5pm eastern", () => {
    let testDate = new Date(2024, 0, 17, 23, 0, 0); // Wednesday 11pm utc, Wednesday 6pm eastern
    let nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 18)); // Thursday, midnight, utc
  });

  it("identifies submissions before 5pm eastern", () => {
    let testDate = new Date(2024, 0, 17, 10, 0, 0); // Wednesday 10am utc, Wednesday 5am eastern
    let nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 17)); // Wednesday, midnight, utc
  });

  it("handles combinations of rule violations", () => {
    let testDate = new Date(2024, 0, 12, 23, 0, 0); // Friday 11pm utc, Friday 6pm eastern
    let nextDate = getNextBusinessDayTimestamp(testDate);
    // Submission is after 5pm, Saturday is a weekend, Sunday is a weekend, and Monday is MLK Day
    expect(nextDate).toEqual(Date.UTC(2024, 0, 16)); // Tuesday, midnight utc
  });

  it("identifies valid business days", () => {
    let testDate = new Date(2024, 0, 9, 15, 0, 0); // Tuesday 3pm utc, Tuesday 8am eastern
    let nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 9)); // Tuesday, midnight utc
  });
});
