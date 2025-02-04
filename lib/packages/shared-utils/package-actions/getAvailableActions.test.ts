import { describe, it, expect } from "vitest";
import { getAvailableActions } from "./getAvailableActions";
import { Action, SEATOOL_STATUS } from "shared-types";
import {
  TEST_1915B_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_CMS_REVIEWER_USER,
  TEST_MED_SPA_ITEM,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";

describe("getAvailableActions tests", () => {
  it(`should return actions: [${Action.RESPOND_TO_RAI},${Action.WITHDRAW_PACKAGE}]`, () => {
    const result = getAvailableActions(TEST_STATE_SUBMITTER_USER, {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
    });
    expect(result).toEqual([Action.RESPOND_TO_RAI, Action.WITHDRAW_PACKAGE]);
  });

  it(`should return actions: [${Action.TEMP_EXTENSION}, ${Action.AMEND_WAIVER}]`, () => {
    const result = getAvailableActions(TEST_STATE_SUBMITTER_USER, {
      ...TEST_1915B_ITEM._source,
      actionType: "New",
      seatoolStatus: SEATOOL_STATUS.APPROVED,
    });
    expect(result).toEqual([Action.TEMP_EXTENSION, Action.AMEND_WAIVER]);
  });

  it(`should return actions: [${Action.ENABLE_RAI_WITHDRAW}] for CHIP SPA`, () => {
    const result = getAvailableActions(TEST_CMS_REVIEWER_USER, {
      ...TEST_CHIP_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      raiReceivedDate: "2024-01-01T00:00:00.000Z",
    });
    expect(result).toEqual([Action.ENABLE_RAI_WITHDRAW]);
  });

  it(`should return actions: [${Action.ENABLE_RAI_WITHDRAW}] for Medicaid SPA`, () => {
    const result = getAvailableActions(TEST_CMS_REVIEWER_USER, {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      raiReceivedDate: "2024-01-01T00:00:00.000Z",
    });
    expect(result).toEqual([Action.ENABLE_RAI_WITHDRAW]);
  });

  it(`should return actions: [${Action.DISABLE_RAI_WITHDRAW}] for CHIP SPA`, () => {
    const result = getAvailableActions(TEST_CMS_REVIEWER_USER, {
      ...TEST_CHIP_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      raiReceivedDate: "2024-01-01T00:00:00.000Z",
      raiWithdrawEnabled: true,
    });
    expect(result).toEqual([Action.DISABLE_RAI_WITHDRAW]);
  });

  it(`should return actions: [${Action.DISABLE_RAI_WITHDRAW}] for Medicaid SPA`, () => {
    const result = getAvailableActions(TEST_CMS_REVIEWER_USER, {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      raiReceivedDate: "2024-01-01T00:00:00.000Z",
      raiWithdrawEnabled: true,
    });
    expect(result).toEqual([Action.DISABLE_RAI_WITHDRAW]);
  });

  it(`should return actions: [${Action.WITHDRAW_RAI}, ${Action.WITHDRAW_PACKAGE}, ${Action.UPLOAD_SUBSEQUENT_DOCUMENTS}]`, () => {
    const result = getAvailableActions(TEST_STATE_SUBMITTER_USER, {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      raiReceivedDate: "2024-01-01T00:00:00.000Z",
      raiWithdrawEnabled: true,
    });
    expect(result).toEqual([
      Action.WITHDRAW_RAI,
      Action.WITHDRAW_PACKAGE,
      Action.UPLOAD_SUBSEQUENT_DOCUMENTS,
    ]);
  });

  it(`should return actions: [${Action.WITHDRAW_PACKAGE}, ${Action.UPLOAD_SUBSEQUENT_DOCUMENTS}]`, () => {
    const result = getAvailableActions(TEST_STATE_SUBMITTER_USER, {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      raiWithdrawEnabled: true,
    });
    expect(result).toEqual([Action.WITHDRAW_PACKAGE, Action.UPLOAD_SUBSEQUENT_DOCUMENTS]);
  });
});
