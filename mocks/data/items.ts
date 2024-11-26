import type { opensearch } from "shared-types";
import { SEATOOL_STATUS } from "shared-types";

export const EXISTING_ITEM_PENDING_ID = "MD-0002.R00.00";
export const EXISTING_ITEM_APPROVED_NEW_ID = "MD-0000.R00.00";
export const VALID_ITEM_TEMPORARY_EXTENSION_ID = "MD-0000.R00.TE00";
export const EXISTING_ITEM_APPROVED_AMEND_ID = "MD-0000.R00.01";
export const EXISTING_ITEM_APPROVED_RENEW_ID = "MD-0000.R01.00";
export const EXISTING_ITEM_ID = "MD-00-0000";
export const NOT_FOUND_ITEM_ID = "MD-0004.R00.00";
export const TEST_ITEM_ID = "MD-0005.R01.00";
export const EXISTING_ITEM_TEMPORARY_EXTENSION_ID = "MD-0005.R01.TE00";
export const HI_TEST_ITEM_ID = "HI-0000.R00.00";
export const ERROR_ITEM_ID = "Throw Error";

export type ItemTestFields = {
  _id: string;
  found: boolean;
  _source:
    | (Pick<opensearch.main.Document, "id" | "seatoolStatus" | "actionType"> & {
        authority?: string;
        state?: string;
        changelog?: [{ _source: { event: string } }];
        appkChildren?: Omit<opensearch.main.ItemResult, "found">[];
      })
    | boolean;
};

const items: Record<string, ItemTestFields> = {
  [EXISTING_ITEM_ID]: {
    _id: EXISTING_ITEM_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
    },
  },
  [EXISTING_ITEM_APPROVED_NEW_ID]: {
    _id: EXISTING_ITEM_APPROVED_NEW_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_APPROVED_NEW_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      authority: "1915(b)",
    },
  },
  [EXISTING_ITEM_APPROVED_AMEND_ID]: {
    _id: EXISTING_ITEM_APPROVED_AMEND_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_APPROVED_AMEND_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Amend",
      authority: "1915(b)",
    },
  },
  [EXISTING_ITEM_APPROVED_RENEW_ID]: {
    _id: EXISTING_ITEM_APPROVED_RENEW_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_APPROVED_RENEW_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Renew",
      authority: "1915(b)",
    },
  },
  [EXISTING_ITEM_PENDING_ID]: {
    _id: EXISTING_ITEM_PENDING_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_PENDING_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
    },
  },
  [NOT_FOUND_ITEM_ID]: {
    _id: NOT_FOUND_ITEM_ID,
    found: false,
    _source: false,
  },
  [TEST_ITEM_ID]: {
    _id: TEST_ITEM_ID,
    found: true,
    _source: {
      id: TEST_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      changelog: [{ _source: { event: "new-medicaid-submission" } }],
      authority: "Medicaid SPA",
    },
  },
  [EXISTING_ITEM_TEMPORARY_EXTENSION_ID]: {
    _id: EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Amend",
      authority: "Medicaid SPA",
    },
  },
  [HI_TEST_ITEM_ID]: {
    _id: HI_TEST_ITEM_ID,
    found: true,
    _source: {
      id: HI_TEST_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      authority: "Medicaid SPA",
      state: "HI",
    },
  },
};

export default items;
