import type { opensearch } from "shared-types";
import { SEATOOL_STATUS } from "shared-types";

export const EXISTING_ITEM_PENDING_ID = "MD-0002.R00.00";
export const EXISTING_ITEM_APPROVED_NEW_ID = "MD-0000.R00.00";
export const APPROVED_ITEM_TEMPORARY_EXTENSION_ID = "MD-0000.R00.TE00";
export const EXISTING_ITEM_APPROVED_RENEW_ID = "MD-0001.R00.00";
export const EXISTING_ITEM_APPROVED_AMEND_ID = "MD-0000.R00.01";
export const NOT_FOUND_ITEM_ID = "MD-0004.R00.00";
export const TEST_ITEM_ID = "MD-0005.R01.00";

export type ItemTestFields = {
  _id: string;
  found: boolean;
  _source:
    | (Pick<opensearch.main.Document, "id" | "seatoolStatus" | "actionType"> & {
        authority?: string;
        changelog?: [{ _source: { event: string } }];
      })
    | boolean;
};

const cases: Record<string, ItemTestFields> = {
  "MD-00-0000": {
    _id: "MD-00-0000",
    found: true,
    _source: {
      id: "MD-00-0000",
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
    },
  },
  [EXISTING_ITEM_APPROVED_RENEW_ID]: {
    _id: EXISTING_ITEM_APPROVED_RENEW_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_APPROVED_RENEW_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Renew",
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
};

export default cases;
