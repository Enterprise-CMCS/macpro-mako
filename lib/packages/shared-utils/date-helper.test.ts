import { describe, expect, it } from "vitest";

import { formatDate, formatDateToEST, formatNinetyDaysDate } from "./date-helper";

describe("date-helper", () => {
  describe("formatDate", () => {
    it('should return "Pending" if date is null or undefined', () => {
      expect(formatDate(null)).toBe("Pending");
      expect(formatDate(undefined)).toBe("Pending");
    });

    it("should correctly format a valid date", () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025

      expect(formatDate(date.getTime())).toBe("January 5, 2025");
    });
  });

  describe("formatDateForPackageDetails", () => {
    it("formats a valid UTC date correctly to EST", () => {
      const utcDate = "2025-02-28T18:14:41.855Z";
      const formattedDate = formatDateToEST(utcDate);

      expect(formattedDate).toBe("Fri, Feb 28 2025, 01:14:41 PM EST");
    });

    it("formats a UTC date in daylight saving time (DST) correctly", () => {
      const utcDate = "2025-07-15T18:00:00.000Z";
      const formattedDate = formatDateToEST(utcDate);

      expect(formattedDate).toBe("Tue, Jul 15 2025, 02:00:00 PM EST");
    });
  });

  describe("formatNinetyDaysDate", () => {
    it('should return "Pending" if date is null or undefined', () => {
      expect(formatNinetyDaysDate(null)).toBe("Pending");
      expect(formatNinetyDaysDate(undefined)).toBe("Pending");
    });

    it("should format the date correctly and add 90 days (no DST change)", () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Apr 5, 2025 @ 11:59pm EST");
    });

    it("should format the date correctly when in DST (March -> June)", () => {
      const date = new Date(2025, 2, 10); // March 10, 2025 (potentially DST)
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Jun 8, 2025 @ 11:59pm EST");
    });

    it("should handle boundary cases near DST transitions correctly", () => {
      const date = new Date(2025, 10, 1); // Nov 1, 2025 (before DST ends)
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Jan 30, 2026 @ 11:59pm EST");
    });
  });
});
