import { describe, it, expect } from "vitest";
import { testItemResult, testCMSCognitoUser } from "./testData";
import { PackageCheck } from "../package-check";
import { Authority, SEATOOL_STATUS } from "shared-types";
import { pack } from "serverless-esbuild/dist/pack";

// Build Mock Package data:
//   - make it basic, like a new submission
//   - then override properties as needed
// ex: { ...baseNewSubmissionObj._source, raiWithdrawEnabled: true }

describe("PackageCheck", () => {
  describe("Plan Checks", () => {
    it("checks if isSpa", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority.MED_SPA,
      });
      expect(packageCheck.isSpa).toBe(true);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority.CHIP_SPA,
      });
      expect(packageCheck.isSpa).toBe(true);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority["1915b"],
      });
      expect(packageCheck.isSpa).toBe(false);
    });
    it("checks if isWaiver", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority["1915b"],
      });
      expect(packageCheck.isWaiver).toBe(true);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority.CHIP_SPA,
      });
      expect(packageCheck.isWaiver).toBe(false);
    });
    it("checks waiver type", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority["1915b"],
        actionType: "New",
      });
      expect(packageCheck.isInitial).toBe(true);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority["1915b"],
        actionType: "Renew",
      });
      expect(packageCheck.isRenewal).toBe(true);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority["1915b"],
        actionType: "Amend",
      });
      expect(packageCheck.isAmendment).toBe(true);
    });
    it("checks against input", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority["1915b"],
      });
      expect(packageCheck.authorityIs([Authority["1915b"]])).toBe(true);
    });
  });

  describe("Status Checks", () => {
    it("checks if isInActivePendingStatus", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(packageCheck.isInActivePendingStatus).toBe(true);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(packageCheck.isInActivePendingStatus).toBe(false);
    });
    it("checks if isInSecondClock", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority.CHIP_SPA, // Chip Spas don't have 2nd clock
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "exists",
        raiReceivedDate: "exists",
      });
      expect(packageCheck.isInSecondClock).toBe(false);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        authority: Authority.MED_SPA,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "exists",
        raiReceivedDate: "exists",
      });
      expect(packageCheck.isInSecondClock).toBe(true);
    });
    it("checks if isNotWithdrawn", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      });
      expect(packageCheck.isNotWithdrawn).toBe(false);
      packageCheck = PackageCheck({
        ...testItemResult._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(packageCheck.isNotWithdrawn).toBe(true);
    });
    it("checks against input", () => {
      let packageCheck = PackageCheck({
        ...testItemResult._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      });
      expect(packageCheck.hasStatus(SEATOOL_STATUS.PENDING_RAI)).toBe(false);
      expect(packageCheck.hasStatus(SEATOOL_STATUS.WITHDRAWN)).toBe(true);
    });
  });

  describe("RAI Checks", () => {
    it("checks if hasRequestedRai", () => {});
    it("checks if hasLatestRai", () => {
      let packageChecker = PackageCheck(testItemResult._source);
      expect(packageChecker.hasLatestRai).toBe(false);
      packageChecker = PackageCheck({
        ...testItemResult._source,
        raiRequestedDate: "yesterday, lol",
      });
      expect(packageChecker.hasLatestRai).toBe(true);
    });
    it("checks if hasRaiResponse", () => {
      let packageChecker = PackageCheck({
        ...testItemResult._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(packageChecker.hasRaiResponse).toBe(true);
      packageChecker = PackageCheck({
        ...testItemResult._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawnDate: "test",
      });
      expect(packageChecker.hasRaiResponse).toBe(false);
    });
    it("checks if hasCompletedRai", () => {
      let packageChecker = PackageCheck(testItemResult._source);
      expect(packageChecker.hasCompletedRai).toBe(false);
      packageChecker = PackageCheck({
        ...testItemResult._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(packageChecker.hasCompletedRai).toBe(true);
    });
    it("checks if hasEnabledRaiWithdraw", () => {
      let packageChecker = PackageCheck(testItemResult._source);
      expect(packageChecker.hasEnabledRaiWithdraw).toBe(false);
      packageChecker = PackageCheck({
        ...testItemResult._source,
        raiWithdrawEnabled: true,
      });
      expect(packageChecker.hasEnabledRaiWithdraw).toBe(true);
    });
  });
});
