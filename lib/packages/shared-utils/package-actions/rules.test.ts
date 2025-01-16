import { describe, expect, it } from "vitest";
import {
  arRespondToRai,
  arTempExtension,
  arAmend,
  arEnableWithdrawRaiResponse,
  arDisableWithdrawRaiResponse,
  arWithdrawRaiResponse,
  arWithdrawPackage,
  arUploadSubsequentDocuments,
} from "./rules";
import { PackageCheck } from "../package-check";
import { SEATOOL_STATUS } from "shared-types";
import {
  TEST_MED_SPA_ITEM,
  TEST_TEMP_EXT_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_1915B_ITEM,
  TEST_1915C_ITEM,
  TEST_STATE_SUBMITTER_USER,
  TEST_CMS_REVIEWER_USER,
} from "mocks";

describe("package actions rules tests", () => {
  describe("arRespondToRai rule tests", () => {
    it("should return true for a valid package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arRespondToRai.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });
    it("should return false for a temporary extension package", () => {
      const check = PackageCheck({
        ...TEST_TEMP_EXT_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arRespondToRai.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a non Pending-RAI status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arRespondToRai.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package without a raiRequestedDate", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: null,
      });
      expect(arRespondToRai.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with an rai response", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arRespondToRai.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a cms reviewer user", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arRespondToRai.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package that is locked", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        locked: true,
      });
      expect(arRespondToRai.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
  });

  describe("arTempExtension rule tests", () => {
    it("should return true for a valid 1915(b) package", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
      });
      expect(arTempExtension.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });
    it("should return true for a valid 1915(c) package", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
      });
      expect(arTempExtension.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });
    it("should return false for a package with a non-Approved status", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
      });
      expect(arTempExtension.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a Medicaid SPA package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
      });
      expect(arTempExtension.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a CHIP SPA package", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
      });
      expect(arTempExtension.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with action type Extend", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Extend",
      });
      expect(arTempExtension.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a cms reviewer user", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
      });
      expect(arTempExtension.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
  });

  describe("arAmend rule tests", () => {
    it("should return true for a valid 1915(b) package", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Renew",
      });
      expect(arAmend.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });

    it("should return true for a valid 1915(c) package", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Renew",
      });
      expect(arAmend.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });

    it("should return false for a Medicaid SPA package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Renew",
      });
      expect(arAmend.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });

    it("should return false for a CHIP SPA package", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Renew",
      });
      expect(arAmend.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });

    it("should return false for a package with a non-Approved status", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "Renew",
      });
      expect(arAmend.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });

    it("should return false for a package with an actionType of Extend", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Extend",
      });
      expect(arAmend.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });

    it("should return false for a package with a cms reviewer", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "Renew",
      });
      expect(arAmend.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
  });

  describe("arEnableWithdrawRaiResponse rule tests", () => {
    it("should return true for a valid package CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(true);
    });
    it("should return false for a temporary extension package CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "Extend",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Withdrawn status CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package that has an rai response CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawnDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with an rai withdraw enabled CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a state submitter CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with an Approved status CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Pending-Approved status CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Submitted status CHIP SPA", () => {
      const check = PackageCheck({
        ...TEST_CHIP_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });

    it("should return true for a valid package 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(true);
    });
    it("should return false for a temporary extension package 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "Extend",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Withdrawn status 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package that has an rai response 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawnDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with an rai withdraw enabled 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a state submitter 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with an Approved status 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Pending-Approved status 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Terminated status 1915(b)", () => {
      const check = PackageCheck({
        ...TEST_1915B_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.TERMINATED,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arEnableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
  });

  describe("arDisableWithdrawRaiResponse rule tests", () => {
    it("should return true for a valid package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(true);
    });
    it("should return false for a temporary extension package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "Extend",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Withdrawn status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package that has an rai response", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawnDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with an rai withdraw enabled", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: false,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a state submitter", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with an Approved status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Pending-Approved status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package with a Unsubmitted status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.UNSUBMITTED,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arDisableWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
  });

  describe("arWithdrawRaiResponse rule tests", () => {
    it("should return true for a valid package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });
    it("should return false for a temporary extension package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "Extend",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a Withdrawn status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package that has an rai response", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawnDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a status of Pending-Approval", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_APPROVAL,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with raiWithdrawEnabled false", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: false,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a cms reviewer", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package that is locked", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
        locked: true,
      });
      expect(arWithdrawRaiResponse.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
  });

  describe("arWithdrawPackage rule tests", () => {
    it("should return true for a valid package", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(arWithdrawPackage.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });
    it("should return false for a temporary extension package", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        actionType: "Extend",
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(arWithdrawPackage.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with status Approved", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(arWithdrawPackage.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with status Submitted", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      });
      expect(arWithdrawPackage.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a cms reviewer", () => {
      const check = PackageCheck({
        ...TEST_1915C_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(arWithdrawPackage.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
  });

  describe("arUploadSubsequentDocuments rule tests", () => {
    it("should return true for a valid package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_STATE_SUBMITTER_USER)).toBe(true);
    });
    it("should return false for a package with a cms reviewer", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_CMS_REVIEWER_USER)).toBe(false);
    });
    it("should return false for a package that needs intake", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING,
        initialIntakeNeeded: true,
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a temporary extension package", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "Extend",
        seatoolStatus: SEATOOL_STATUS.PENDING,
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with status Pending-RAI", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a requested withdraw", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
    it("should return false for a package with a non-Pending status", () => {
      const check = PackageCheck({
        ...TEST_MED_SPA_ITEM?._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      });
      expect(arUploadSubsequentDocuments.check(check, TEST_STATE_SUBMITTER_USER)).toBe(false);
    });
  });
});
