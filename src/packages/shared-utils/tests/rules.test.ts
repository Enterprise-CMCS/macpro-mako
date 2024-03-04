import { describe, it, expect } from "vitest";
import rules from "../package-actions/rules";
import { Action, Authority, SEATOOL_STATUS } from "shared-types";
import { baseNewSubmissionObj, testCmsUser, testStateUser } from "./testData";
import { PackageCheck } from "../package-check";

// Build Mock CMS user
// Build Mock State user
// Build Mock Package data for:
//   - make it basic, like a new submission
//   - then override properties as needed
// ex: { ...baseNewSubmissionObj._source, raiWithdrawEnabled: true }

const getRule = (action: Action) => {
  const rule = rules.filter((v) => v.action === action);
  if (!rule.length) return null;
  return rule;
};

describe("Action Rules", () => {
  describe("Issue RAI", () => {
    const rule = getRule(Action.ISSUE_RAI);
    const { check } = rule[0];
    it("only has one associated rule", () => {
      expect(rule).toHaveLength(1);
    });
    it("only available for CMS users", () => {
      const packageChecker = PackageCheck(baseNewSubmissionObj._source);
      expect(check(packageChecker, testStateUser.user)).toBe(false); // With CMS user
      expect(check(packageChecker, testCmsUser.user)).toBe(true);
    });
    it("is unavailable if the package is not in an active Pending status", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable if the package has a requested rai", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable if the package has completed the latest RAI and is a Medicaid SPA", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        authority: Authority.MED_SPA,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable if the package has completed the latest RAI and has RAI Withdraw enabled", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        authority: Authority.CHIP_SPA,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawEnabled: true,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
  });

  describe("Respond To RAI", () => {
    const rule = getRule(Action.RESPOND_TO_RAI);
    const { check } = rule[0];
    it("only has one associated rule", () => {
      expect(rule).toHaveLength(1);
    });
    it("is available for packages with Pending RAI status and a requested RAI", () => {
      let packageChecker = PackageCheck(baseNewSubmissionObj._source);
      expect(check(packageChecker, testStateUser.user)).toBe(false);
      packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "yesterday, lol",
      });
      expect(check(packageChecker, testStateUser.user)).toBe(true);
    });
    it("is unavailable for CMS users", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "yesterday, lol",
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
      expect(check(packageChecker, testStateUser.user)).toBe(true);
    });
  });

  describe("Enable RAI Withdraw rule", () => {
    const rule = getRule(Action.ENABLE_RAI_WITHDRAW);
    const { check } = rule[0];
    it("only has one associated rule", () => {
      expect(rule).toHaveLength(1);
    });
    it("is unavailable if the package is Withdrawn", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable to State users", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(true);
      expect(check(packageChecker, testStateUser.user)).toBe(false);
    });
    it("is unavailable if the package has no RAI response", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawnDate: "also today",
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable if the package already has withdraw RAI enabled", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawEnabled: true,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
  });

  describe("Disable RAI Withdraw rule", () => {
    const rule = getRule(Action.DISABLE_RAI_WITHDRAW);
    const { check } = rule[0];
    it("only has one associated rule", () => {
      expect(rule).toHaveLength(1);
    });
    it("is unavailable if the package is Withdrawn", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable to State users", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawEnabled: true,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(true);
      expect(check(packageChecker, testStateUser.user)).toBe(false);
    });
    it("is unavailable if the package has no RAI response", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawnDate: "also today",
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
    it("is unavailable if the package already has withdraw RAI disabled", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawEnabled: false,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
    });
  });

  describe("Withdraw RAI rule", () => {
    const rule = getRule(Action.WITHDRAW_RAI);
    const { check } = rule[0];
    it("only has one associated rule", () => {
      expect(rule).toHaveLength(1);
    });
    it("is unavailable to CMS users", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawEnabled: true,
      });
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
      expect(check(packageChecker, testStateUser.user)).toBe(true);
    });
    it("is unavailable if the package is not in an Active Pending status", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(check(packageChecker, testStateUser.user)).toBe(false);
    });
    it("is unavailable if the package doesn't have an RAI response", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawnDate: "also today",
      });
      expect(check(packageChecker, testStateUser.user)).toBe(false);
    });
    it("is unavailable if the package doesn't have RAI response withdraw enabled", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        raiRequestedDate: "yesterday, lol",
        raiReceivedDate: "today, foo",
        raiWithdrawEnabled: false,
      });
      expect(check(packageChecker, testStateUser.user)).toBe(false);
    });
  });

  describe("Withdraw Package rule", () => {
    const rule = getRule(Action.WITHDRAW_PACKAGE);
    const { check } = rule[0];
    it("only has one associated rule", () => {
      expect(rule).toHaveLength(1);
    });
    it("is unavailable to CMS users", () => {
      const packageChecker = PackageCheck(baseNewSubmissionObj._source);
      expect(check(packageChecker, testCmsUser.user)).toBe(false);
      expect(check(packageChecker, testStateUser.user)).toBe(true);
    });
    it("is unavailable if the package is in a Final Disposition status", () => {
      const packageChecker = PackageCheck({
        ...baseNewSubmissionObj._source,
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      });
      expect(check(packageChecker, testStateUser.user)).toBe(false);
    });
  });
});
