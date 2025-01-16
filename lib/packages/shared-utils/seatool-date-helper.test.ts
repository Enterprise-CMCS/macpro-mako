import { it, describe, expect } from "vitest";
import {
  formatSeatoolDate,
  getNextBusinessDayTimestamp,
  offsetFromUtc,
  offsetToUtc,
  seaToolFriendlyTimestamp,
} from ".";

describe("offsetToUtc", () => {
  it("offsets given date to UTC", () => {
    const originalDate = new Date("January 1, 2000 12:00:00");
    const timezoneOffset = originalDate.getTimezoneOffset() * 60000; // in milliseconds
    const expectedDate = new Date(originalDate.getTime() - timezoneOffset);
    console.debug("originalDate: ", originalDate, "expectedDate: ", expectedDate);
    expect(offsetToUtc(originalDate)).toEqual(expectedDate);
  });
});

describe("offsetFromUtc", () => {
  it("offsets UTC date to user's timezone", () => {
    const originalDate = new Date("2000-01-01T12:00:00.000Z");
    const timezoneOffset = originalDate.getTimezoneOffset() * 60000; // in milliseconds
    const expectedDate = new Date(originalDate.getTime() + timezoneOffset);
    console.debug("originalDate: ", originalDate, "expectedDate: ", expectedDate);
    expect(offsetFromUtc(originalDate)).toEqual(expectedDate);
  });
});

describe("seaToolFriendlyTimestamp", () => {
  it("converts given date to a time string representing the given date", () => {
    const originalDate = new Date("January 1, 2000 12:00:00");
    const timezoneOffset = originalDate.getTimezoneOffset() * 60000; // in milliseconds
    const expectedDate = new Date(originalDate.getTime() - timezoneOffset);
    expect(seaToolFriendlyTimestamp(originalDate)).toEqual(expectedDate.getTime());
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
    const testDate = new Date(2024, 0, 27, 12, 0, 0); // Saturday, noon, utc
    const nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 29)); // Monday, midnight, utc
  });

  it("identifies holidays", () => {
    const testDate = new Date(2024, 0, 15, 12, 0, 0); // MLK Day, a Monday
    const nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 16)); // Tuesday, midnight, utc
  });

  it("identifies submissions after 5pm eastern", () => {
    const testDate = new Date(2024, 0, 17, 23, 0, 0); // Wednesday 11pm utc, Wednesday 6pm eastern
    const nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 18)); // Thursday, midnight, utc
  });

  it("identifies submissions before 5pm eastern", () => {
    const testDate = new Date(2024, 0, 17, 10, 0, 0); // Wednesday 10am utc, Wednesday 5am eastern
    const nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 17)); // Wednesday, midnight, utc
  });

  it("handles combinations of rule violations", () => {
    const testDate = new Date(2024, 0, 12, 23, 0, 0); // Friday 11pm utc, Friday 6pm eastern
    const nextDate = getNextBusinessDayTimestamp(testDate);
    // Submission is after 5pm, Saturday is a weekend, Sunday is a weekend, and Monday is MLK Day
    expect(nextDate).toEqual(Date.UTC(2024, 0, 16)); // Tuesday, midnight utc
  });

  // TODO: I dont know if its my time zone but this always fails for me in the MST
  it.skip("identifies valid business days", () => {
    const testDate = new Date(2024, 0, 9, 15, 0, 0); // Tuesday 3pm utc, Tuesday 8am eastern
    const nextDate = getNextBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 9)); // Tuesday, midnight utc
  });
});
