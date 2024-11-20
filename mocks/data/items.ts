import type { opensearch } from "shared-types";
import { SEATOOL_STATUS } from "shared-types";

export const EXISTING_ITEM_PENDING_ID = "MD-0002.R00.00";
export const EXISTING_ITEM_APPROVED_NEW_ID = "MD-0000.R00.00";
export const EXISTING_ITEM_APPROVED_RENEW_ID = "MD-0001.R00.00";
export const EXISTING_ITEM_APPROVED_AMEND_ID = "MD-0000.R00.01";
export const NOT_FOUND_ITEM_ID = "MD-0006.R01.00";
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
  "MD-0000.R00.00": {
    _id: "MD-0000.R00.00",
    found: true,
    _source: {
      id: "MD-0000.R00.00",
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
    },
  },
  "MD-0000.R00.01": {
    _id: "MD-0000.R00.01",
    found: true,
    _source: {
      id: "MD-0000.R00.01",
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Amend",
    },
  },
  "MD-0001.R00.00": {
    _id: "MD-0001.R00.00",
    found: true,
    _source: {
      id: "MD-0001.R00.00",
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Renew",
    },
  },
  "MD-0002.R00.00": {
    _id: "MD-0002.R00.00",
    found: true,
    _source: {
      id: "MD-0002.R00.00",
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
    },
  },
  "MD-0005.R01.00": {
    _id: "MD-0005.R01.00",
    found: true,
    _source: {
      id: "MD-0005.R01.00",
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      changelog: [{ _source: { event: "new-medicaid-submission" } }],
      authority: "Medicaid SPA",
    },
  },
  "MD-0006.R01.00": {
    _id: "MD-0006.R01.00",
    found: false,
    _source: false,
  },
};

export default cases;
