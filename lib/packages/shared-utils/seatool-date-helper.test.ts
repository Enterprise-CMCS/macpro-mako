import { it, describe, expect, vi, beforeEach, afterEach } from "vitest";
import { formatSeatoolDate, getBusinessDayTimestamp, seaToolFriendlyTimestamp } from ".";

describe("seaToolFriendlyTimestamp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should convert date to a timestamp representing the date at midnight UTC time", () => {
    const localDate = new Date("2025-01-23T17:01:42.000Z");
    const expectedTimestamp = Date.parse("2025-01-23T00:00:00.000Z");
    expect(seaToolFriendlyTimestamp(localDate)).toEqual(expectedTimestamp);
  });

  it("should return timestamp representing today at midnight UTC time", () => {
    const mockDate = new Date("2025-02-03T12:00:00Z");
    vi.setSystemTime(mockDate);
    const expectedTimestamp = Date.parse("2025-02-03T00:00:00.000Z");
    expect(seaToolFriendlyTimestamp()).toEqual(expectedTimestamp);
  });
});

describe("formatSeatoolDate", () => {
  it("should format a SEATool date to a user-friendly format", () => {
    const originalDate = new Date("2000-01-01T00:00:00.000Z");
    expect(formatSeatoolDate(originalDate.toISOString())).toEqual("01/01/2000");
  });

  it("should convert time to UTC to handle timezone differences", () => {
    const originalDate = new Date("Fri Dec 31 1999 19:00:00 GMT-0500 (Eastern Standard Time)");
    expect(formatSeatoolDate(originalDate.toISOString())).toEqual("01/01/2000");
  });
});

describe("getBusinessDayTimestamp", () => {
  it("identifies weekends", () => {
    const testDate = new Date(Date.UTC(2024, 0, 27, 12, 0, 0)); // Saturday, noon, utc
    const nextDate = getBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 29, 0, 0, 0, 0)); // Monday, midnight, utc
  });

  it("identifies holidays", () => {
    const testDate = new Date(Date.UTC(2024, 0, 15, 12, 0, 0)); // MLK Day, a Monday
    const nextDate = getBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 16, 0, 0, 0, 0)); // Tuesday, midnight, utc
  });

  it("identifies submissions after 5pm eastern", () => {
    const testDate = new Date(Date.UTC(2024, 0, 17, 23, 0, 0)); // Wednesday 11pm utc, Wednesday 6pm eastern
    const nextDate = getBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 18, 0, 0, 0, 0)); // Thursday, midnight, utc
  });

  it("identifies submissions before 5pm eastern", () => {
    const testDate = new Date(Date.UTC(2024, 0, 17, 10, 0, 0)); // Wednesday 10am utc, Wednesday 5am eastern
    const nextDate = getBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 17, 0, 0, 0, 0)); // Thursday, midnight, utc
  });

  it("handles combinations of rule violations", () => {
    const testDate = new Date(Date.UTC(2024, 0, 12, 23, 0, 0)); // Friday 11pm utc, Friday 6pm eastern
    const nextDate = getBusinessDayTimestamp(testDate);
    // Submission is after 5pm, Saturday is a weekend, Sunday is a weekend, and Monday is MLK Day
    expect(nextDate).toEqual(Date.UTC(2024, 0, 16, 0, 0, 0, 0)); // Tuesday, midnight utc
  });

  it("identifies valid business days", () => {
    const testDate = new Date(Date.UTC(2024, 0, 9, 15, 0, 0)); // Tuesday 3pm utc, Tuesday 8am eastern
    const nextDate = getBusinessDayTimestamp(testDate);
    expect(nextDate).toEqual(Date.UTC(2024, 0, 9, 0, 0, 0, 0)); // Tuesday, midnight utc
  });
});
