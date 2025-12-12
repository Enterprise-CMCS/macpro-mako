import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatDate,
  formatDateToET,
  formatDateToUTC,
  formatNinetyDaysDate,
  isWithinDays,
} from "./date-helper";

describe("date-helper", () => {
  describe("formatDate", () => {
    it("should correctly format a valid date", () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025

      expect(formatDate(date.getTime())).toBe("January 5, 2025");
    });
  });

  describe("formatDateToET", () => {
    it("formats a valid UTC date correctly to ET", () => {
      const utcDate = "2025-02-28T18:14:41.855Z";
      const result = formatDateToET(utcDate);

      expect(result).toBe("Fri, Feb 28 2025, 01:14:41 PM EST");
    });

    it("formats a UTC date in daylight saving time (DST) correctly", () => {
      const utcDate = "2025-07-15T18:00:00.000Z";
      const result = formatDateToET(utcDate);

      expect(result).toBe("Tue, Jul 15 2025, 02:00:00 PM EDT");
    });

    it("should format the date to EST with a custom format and timezone", () => {
      const date = "2025-03-11T12:00:00Z";
      const formatValue = "yyyy-MM-dd HH:mm:ss aaaa";
      const expectedFormat = "2025-03-11 08:00:00 a.m. EDT";

      const result = formatDateToET(date, formatValue);

      expect(result).toBe(expectedFormat);
    });

    it("should format the date to EST with a custom format without timezone", () => {
      const date = "2025-03-11T12:00:00Z";
      const formatValue = "yyyy-MM-dd HH:mm:ss aaaa";
      const expectedFormat = "2025-03-11 08:00:00 a.m.";

      const result = formatDateToET(date, formatValue, false);

      expect(result).toBe(expectedFormat);
    });
  });

  describe("formatDateToUTC", () => {
    it('should format the date in default format "MMMM d, yyyy"', () => {
      const date = "2025-03-11T00:00:00Z";
      const expectedFormat = "March 11, 2025";

      const result = formatDateToUTC(date);

      expect(result).toEqual(expectedFormat);
    });

    it("should format the date with a custom format", () => {
      const date = "2025-03-11T00:00:00Z";
      const formatValue = "yyyy-MM-dd";
      const expectedFormat = "2025-03-11";

      const result = formatDateToUTC(date, formatValue);

      expect(result).toEqual(expectedFormat);
    });
  });

  describe("formatNinetyDaysDate", () => {
    it('should return "Pending" if date is null or undefined', () => {
      expect(formatNinetyDaysDate(null)).toBe("Pending");
      expect(formatNinetyDaysDate(undefined)).toBe("Pending");
    });

    it("should format the date correctly and add 90 days", () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Apr 5, 2025");
    });
  });

  describe("isWithinDays", () => {
    const fixedNow = new Date("2025-10-30T12:00:00Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns false for null/undefined", () => {
      expect(isWithinDays(null, 20)).toBe(false);
      expect(isWithinDays(undefined as any, 20)).toBe(false);
    });

    it("returns true for today", () => {
      expect(isWithinDays(fixedNow.toISOString(), 20)).toBe(true);
    });

    it("returns true for a date within the window", () => {
      const tenDaysAgo = new Date(fixedNow);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      expect(isWithinDays(tenDaysAgo.toISOString(), 20)).toBe(true);
    });

    it("returns false for a date older than the window", () => {
      const twentyOneDaysAgo = new Date(fixedNow);
      twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
      expect(isWithinDays(twentyOneDaysAgo.toISOString(), 20)).toBe(false);
    });

    it("returns false for a future date", () => {
      const future = new Date(fixedNow);
      future.setDate(future.getDate() + 5);
      expect(isWithinDays(future.toISOString(), 20)).toBe(false);
    });
  });
});
