import { describe, it, expect } from "vitest";
import { PackageCheck } from ".";
import { ActionType, Authority, SEATOOL_STATUS } from "shared-types";
import { TEST_MED_SPA_ITEM, TEST_CHIP_SPA_ITEM, TEST_1915B_ITEM } from "mocks/data/items";

describe("PackageCheck", () => {
  describe("Plan Checks", () => {
    it("checks if isSpa", () => {
      let packageCheck = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
      });
      expect(packageCheck.isSpa).toBe(true);
      packageCheck = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
      });
      expect(packageCheck.isSpa).toBe(true);
      packageCheck = PackageCheck({
        ...TEST_1915B_ITEM?._source,
      });
      expect(packageCheck.isSpa).toBe(false);
    });
    it("checks if isWaiver", () => {
      let packageCheck = PackageCheck({
        ...TEST_1915B_ITEM?._source,
      });
      expect(packageCheck.isWaiver).toBe(true);
      packageCheck = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
      });
      expect(packageCheck.isWaiver).toBe(false);
    });
    it("checks against input", () => {
      const packageCheck = PackageCheck({
        ...TEST_1915B_ITEM._source,
      });
      expect(packageCheck.authorityIs([Authority["1915b"]])).toBe(true);
    });
  });

  describe("Status Checks", () => {
    it("checks if isInActivePendingStatus", () => {
      let packageCheck = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(packageCheck.isInActivePendingStatus).toBe(true);
      packageCheck = PackageCheck({
        ...TEST_CHIP_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(packageCheck.isInActivePendingStatus).toBe(false);
    });
    it("checks if isInSecondClock", () => {
      let packageCheck = PackageCheck({
        ...TEST_CHIP_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "exists",
        raiReceivedDate: "exists",
      });
      expect(packageCheck.isInSecondClock).toBe(false);
      packageCheck = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "exists",
        raiReceivedDate: "exists",
      });
      expect(packageCheck.isInSecondClock).toBe(true);
    });
    it("checks if isNotWithdrawn", () => {
      let packageCheck = PackageCheck({
        ...TEST_1915B_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      });
      expect(packageCheck.isNotWithdrawn).toBe(false);
      packageCheck = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(packageCheck.isNotWithdrawn).toBe(true);
    });
    it("checks against input", () => {
      const packageCheck = PackageCheck({
        ...TEST_CHIP_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      });
      expect(packageCheck.hasStatus(SEATOOL_STATUS.PENDING_RAI)).toBe(false);
      expect(packageCheck.hasStatus(SEATOOL_STATUS.WITHDRAWN)).toBe(true);
    });
  });

  describe("RAI Checks", () => {
    it("checks if hasRequestedRai", () => {});
    it("checks if hasLatestRai", () => {
      let packageChecker = PackageCheck(TEST_MED_SPA_ITEM._source);
      expect(packageChecker.hasLatestRai).toBe(false);
      packageChecker = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        raiRequestedDate: "yesterday, lol",
      });
      expect(packageChecker.hasLatestRai).toBe(true);
    });
    it("checks if hasRaiResponse", () => {
      let packageChecker = PackageCheck({
        ...TEST_CHIP_SPA_ITEM._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(packageChecker.hasRaiResponse).toBe(true);
      packageChecker = PackageCheck({
        ...TEST_CHIP_SPA_ITEM._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawnDate: "test",
      });
      expect(packageChecker.hasRaiResponse).toBe(false);
    });
    it("checks if hasCompletedRai", () => {
      let packageChecker = PackageCheck(TEST_1915B_ITEM._source);
      expect(packageChecker.hasCompletedRai).toBe(false);
      packageChecker = PackageCheck({
        ...TEST_1915B_ITEM._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(packageChecker.hasCompletedRai).toBe(true);
    });
    it("checks if hasEnabledRaiWithdraw", () => {
      let packageChecker = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        raiWithdrawEnabled: false,
      });
      expect(packageChecker.hasEnabledRaiWithdraw).toBe(false);
      packageChecker = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        raiWithdrawEnabled: true,
      });
      expect(packageChecker.hasEnabledRaiWithdraw).toBe(true);
    });
  });
  describe("Action Type Checks", () => {
    it("checks against input", () => {
      const packageChecker = PackageCheck({
        ...TEST_MED_SPA_ITEM._source,
        actionType: "Amend" as ActionType,
      });

      expect(packageChecker.actionIs("Amend")).toBe(true);
      expect(packageChecker.actionIs("Extend")).toBe(false);
    });
  });
});
