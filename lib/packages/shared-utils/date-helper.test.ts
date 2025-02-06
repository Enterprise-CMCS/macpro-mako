import { describe, it, expect, vi } from "vitest";
import { formatDate, formatNinetyDaysDate, isDST } from "./date-helper";
import { beforeEach } from "node:test";

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

  describe("formatNinetyDaysDate", () => {
    beforeEach(() => {
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockImplementation(function (this: Date) {
        return isDST(this) ? -240 : -300; // EDT: -240, EST: -300
      });
    });

    it('should return "Pending" if date is null or undefined', () => {
      expect(formatNinetyDaysDate(null)).toBe("Pending");
      expect(formatNinetyDaysDate(undefined)).toBe("Pending");
    });

    it("should format the date correctly and add 90 days (no DST change)", () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Apr 5, 2025 @ 11:59pm EDT");
    });

    it("should format the date correctly when in DST (March -> June)", () => {
      const date = new Date(2025, 2, 10); // March 10, 2025 (potentially DST)
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Jun 8, 2025 @ 11:59pm EDT");
    });

    it("should handle boundary cases near DST transitions correctly", () => {
      const date = new Date(2025, 10, 1); // Nov 1, 2025 (before DST ends)
      const formattedDate = formatNinetyDaysDate(date.getTime());
      expect(formattedDate).toBe("Jan 30, 2026 @ 11:59pm EST");
    });
  });
});
