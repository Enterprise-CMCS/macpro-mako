import { it, describe, expect } from "vitest";
import { getNextBusinessDayTimestamp } from "../seatool-date-helper";

describe("The getNextBusinessDayTimestamp function", () => {
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
