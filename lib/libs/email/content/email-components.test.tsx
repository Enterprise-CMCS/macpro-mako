import { describe, it, expect } from "vitest";
import { getCpocEmail, getSrtEmails } from "./email-components";
import * as opensearch from "shared-types/opensearch";

describe("Email Components", () => {
  describe("getSrtEmails", () => {
    const mockValidReviewTeam = [
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" },
    ];

    const createMockItemResult = (reviewTeam?: any): opensearch.main.ItemResult =>
      ({
        _index: "submissions",
        _id: "TEST-123",
        _score: 1,
        _source: {
          reviewTeam,
          title: "Test Title",
          additionalInformation: null,
          authority: "Test Authority",
          state: "CO",
        },
        found: true,
        sort: [1709319909826],
      } as opensearch.main.ItemResult);

    it("should handle undefined input", () => {
      expect(getSrtEmails(undefined)).toEqual([]);
    });

    it("should handle item with valid review team", () => {
      const mockItem = createMockItemResult(mockValidReviewTeam);
      expect(getSrtEmails(mockItem)).toEqual([
        "John Doe <john@example.com>",
        "Jane Smith <jane@example.com>",
      ]);
    });

    it("should handle item with empty review team", () => {
      const mockItem = createMockItemResult([]);
      expect(getSrtEmails(mockItem)).toEqual([]);
    });

    it("should handle item with missing review team", () => {
      const mockItem = createMockItemResult(undefined);
      expect(getSrtEmails(mockItem)).toEqual([]);
    });

    it("should handle item with invalid review team structure", () => {
      const mockItem = createMockItemResult("not-an-array");
      expect(getSrtEmails(mockItem)).toEqual([]);
    });

    it("should handle item with malformed review team members", () => {
      const mockItem = createMockItemResult([
        { name: "John Doe" }, // missing email
        { email: "jane@example.com" }, // missing name
      ]);
      expect(getSrtEmails(mockItem)).toEqual([
        "John Doe <undefined>",
        "undefined <jane@example.com>",
      ]);
    });
  });

  describe("getCpocEmail", () => {
    const createMockCpocItemResult = (userData?: any): opensearch.cpocs.ItemResult => ({
      _index: "cpocs",
      _id: "CPOC-123",
      _score: 1,
      _source: {
        id: 123,
        ...userData,
      },
      found: true,
      sort: [1709319909826],
    });

    it("should handle undefined input", () => {
      expect(getCpocEmail(undefined)).toEqual([]);
    });

    it("should handle valid CPOC user data", () => {
      const mockItem = createMockCpocItemResult({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(getCpocEmail(mockItem)).toEqual(["John Doe <john@example.com>"]);
    });

    it("should handle missing firstName", () => {
      const mockItem = createMockCpocItemResult({
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(getCpocEmail(mockItem)).toEqual([]);
    });

    it("should handle missing lastName", () => {
      const mockItem = createMockCpocItemResult({
        firstName: "John",
        email: "john@example.com",
      });
      expect(getCpocEmail(mockItem)).toEqual([]);
    });

    it("should handle missing email", () => {
      const mockItem = createMockCpocItemResult({
        firstName: "John",
        lastName: "Doe",
      });
      expect(getCpocEmail(mockItem)).toEqual([]);
    });

    it("should handle null values in user data", () => {
      const mockItem = createMockCpocItemResult({
        firstName: null,
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(getCpocEmail(mockItem)).toEqual([]);
    });

    it("should handle empty string values", () => {
      const mockItem = createMockCpocItemResult({
        firstName: "",
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(getCpocEmail(mockItem)).toEqual([]);
    });
  });
});
