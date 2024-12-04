import { describe, it, expect } from "vitest";
import { getCpocEmail, getSrtEmails } from "./email-components";
import { Document } from "shared-types/opensearch/main";
import { Document as CpocUser } from "shared-types/opensearch/cpocs";

describe("Email Components", () => {
  describe("getSrtEmails", () => {
    it("should handle undefined input", () => {
      expect(getSrtEmails(undefined)).toEqual([]);
    });

    it("should handle item with direct reviewTeam", () => {
      const mockItem = {
        reviewTeam: [
          { name: "John Doe", email: "john@example.com" },
          { name: "Jane Smith", email: "jane@example.com" },
        ],
      } as Document;

      expect(getSrtEmails(mockItem)).toEqual([
        "John Doe <john@example.com>",
        "Jane Smith <jane@example.com>",
      ]);
    });

    it("should handle item with _source reviewTeam", () => {
      const mockItem = {
        _source: {
          reviewTeam: [
            { name: "John Doe", email: "john@example.com" },
            { name: "Jane Smith", email: "jane@example.com" },
          ],
        },
      } as any;

      expect(getSrtEmails(mockItem)).toEqual([
        "John Doe <john@example.com>",
        "Jane Smith <jane@example.com>",
      ]);
    });

    it("should filter out invalid reviewers", () => {
      const mockItem = {
        reviewTeam: [
          { name: "John Doe", email: "john@example.com" },
          { name: "", email: "invalid@example.com" },
          { name: "No Email" },
        ],
      } as Document;

      expect(getSrtEmails(mockItem)).toEqual(["John Doe <john@example.com>"]);
    });
  });

  describe("getCpocEmail", () => {
    it("should handle undefined input", () => {
      expect(getCpocEmail(undefined)).toEqual([]);
    });

    it("should handle direct CPOC user data", () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      } as CpocUser;

      expect(getCpocEmail(mockUser)).toEqual(["John Doe <john@example.com>"]);
    });

    it("should handle CPOC user with _source", () => {
      const mockUser = {
        _source: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      } as any;

      expect(getCpocEmail(mockUser)).toEqual(["John Doe <john@example.com>"]);
    });

    it("should handle invalid CPOC user data", () => {
      const mockUser = {
        firstName: "John",
        // missing lastName and email
      } as any;

      expect(getCpocEmail(mockUser)).toEqual([]);
    });
  });
});
