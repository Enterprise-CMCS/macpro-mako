import { it, describe, expect } from "vitest";
import { getCurrentOrNextBusinessDay } from "../seatool-date-helper";

describe("The getCurrentOrNextBusinessDay function", () => {
  it("identifies weekenends", () => {
    let testDate = new Date(2024, 0, 27, 12, 0, 0); // Saturday, noon, utc
    let nextDate = getCurrentOrNextBusinessDay(testDate);
    expect(nextDate).toEqual((new Date(2024, 0, 29)).getTime()); // Monday, midnight, utc
  });

  it("identifies holidays", () => {
    let testDate = new Date(2024, 0, 15, 12, 0, 0); // MLK Day, a Monday
    let nextDate = getCurrentOrNextBusinessDay(testDate);
    expect(nextDate).toEqual((new Date(2024, 0, 16)).getTime()); // Tuesday, midnight, utc
  });

  it("identifies submissions after 5pm eastern", () => {
    let testDate = new Date(2024, 0, 17, 23, 0, 0); // Wednesday 11pm utc, Wednesday 6pm eastern
    let nextDate = getCurrentOrNextBusinessDay(testDate);
    expect(nextDate).toEqual((new Date(2024, 0, 18)).getTime()); // Thursday, midnight, utc
  });

  it("identifies submissions before 5pm eastern", () => {
    let testDate = new Date(2024, 0, 17, 10, 0, 0); // Wednesday 10am utc, Wednesday 5am eastern
    let nextDate = getCurrentOrNextBusinessDay(testDate);
    expect(nextDate).toEqual((new Date(2024, 0, 17)).getTime()); // Wednesday, midnight, utc
  });

  it("handles combinations of rule violations", () => {
    let testDate = new Date(2024, 0, 12, 23, 0, 0); // Friday 11pm utc, Friday 6pm eastern
    let nextDate = getCurrentOrNextBusinessDay(testDate);
    // Submission is after 5pm, Saturday is a weekend, Sunday is a weekend, and Monday is MLK Day
    expect(nextDate).toEqual((new Date(2024, 0, 16)).getTime()); // Tuesday, midnight utc
  });

  it("identifies valid business days", () => {
    let testDate = new Date(2024, 0, 9, 15, 0, 0); // Tuesday 3pm utc, Tuesday 8am eastern
    let nextDate = getCurrentOrNextBusinessDay(testDate);
    expect(nextDate).toEqual((new Date(2024, 0, 9)).getTime()); // Tuesday, midnight utc
  });
  
});
