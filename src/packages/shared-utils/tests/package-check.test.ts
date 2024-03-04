import { describe, it, expect } from "vitest";
import { baseNewSubmissionObj, testCmsUser } from "./testData";
import { PackageCheck } from "../package-check";
import { Authority } from "shared-types";

// Build Mock Package data for:
//   - make it basic, like a new submission
//   - then override properties as needed
// ex: { ...basePackageObj._source, raiWithdrawEnabled: true }

describe("PackageCheck", () => {
  describe("Plan Checks", () => {
    it("checks if isSpa", () => {});
    it("checks if isWaiver", () => {});
    it("checks against input", () => {});
  });

  describe("Status Checks", () => {
    it("checks if isInActivePendingStatus", () => {});
    it("checks if isInSecondClock", () => {});
    it("checks if isNotWithdrawn", () => {});
    it("checks against input", () => {});
  });

  describe("RAI Checks", () => {
    it("checks if hasRequestedRai", () => {});
    it("checks if hasLatestRai", () => {
      let packageChecker = PackageCheck(baseNewSubmissionObj._source);
      expect(packageChecker.hasLatestRai).toBe(false);
      packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
      });
      expect(packageChecker.hasLatestRai).toBe(true);
    });
    it("checks if hasRaiResponse", () => {
      let packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(packageChecker.hasRaiResponse).toBe(true);
      packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawnDate: "test",
      });
      expect(packageChecker.hasRaiResponse).toBe(false);
    });
    it("checks if hasCompletedRai", () => {
      let packageChecker = PackageCheck(baseNewSubmissionObj._source);
      expect(packageChecker.hasCompletedRai).toBe(false);
      packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(packageChecker.hasCompletedRai).toBe(true);
    });
    it("checks if hasEnabledRaiWithdraw", () => {
      let packageChecker = PackageCheck(baseNewSubmissionObj._source);
      expect(packageChecker.hasEnabledRaiWithdraw).toBe(false);
      packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiWithdrawEnabled: true,
      });
      expect(packageChecker.hasEnabledRaiWithdraw).toBe(true);
    });
  });
});
