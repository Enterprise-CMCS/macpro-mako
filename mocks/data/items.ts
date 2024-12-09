import { SEATOOL_STATUS } from "shared-types";
import type { TestItemResult } from "../index.d";

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
export const CAPITATED_INITIAL_ITEM_ID = "MD-006.R00.00";
export const CAPITATED_AMEND_ITEM_ID = "MD-006.R00.01";
export const CONTRACTING_INITIAL_ITEM_ID = "MD-007.R00.00";
export const CONTRACTING_AMEND_ITEM_ID = "MD-007.R00.01";
export const MISSING_CHANGELOG_ITEM_ID = "MD-008.R00.00";
export const WITHDRAWN_CHANGELOG_ITEM_ID = "MD-009.R00.01";
export const SUBMISSION_ERROR_ITEM_ID = "Throw Submission Error";
export const GET_ERROR_ITEM_ID = "Throw Get Item Error";

const items: Record<string, TestItemResult> = {
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
  },
  [TEST_ITEM_ID]: {
    _id: TEST_ITEM_ID,
    found: true,
    _source: {
      id: TEST_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      changelog: [{ _source: { id: "0001", event: "new-medicaid-submission" } }],
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
  [CAPITATED_INITIAL_ITEM_ID]: {
    _id: CAPITATED_INITIAL_ITEM_ID,
    found: true,
    _source: {
      id: CAPITATED_INITIAL_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Amend",
      authority: "1915(b)",
      changelog: [{ _source: { event: "capitated-initial" } }],
    },
  },
  [CONTRACTING_INITIAL_ITEM_ID]: {
    _id: CONTRACTING_INITIAL_ITEM_ID,
    found: true,
    _source: {
      id: CONTRACTING_INITIAL_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Amend",
      authority: "1915(b)",
      changelog: [{ _source: { event: "contracting-initial" } }],
    },
  },
  [MISSING_CHANGELOG_ITEM_ID]: {
    _id: MISSING_CHANGELOG_ITEM_ID,
    found: true,
    _source: {
      id: MISSING_CHANGELOG_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Amend",
      authority: "1915(b)",
      changelog: [],
    },
  },
  [WITHDRAWN_CHANGELOG_ITEM_ID]: {
    _id: WITHDRAWN_CHANGELOG_ITEM_ID,
    found: true,
    _source: {
      id: WITHDRAWN_CHANGELOG_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
      actionType: "Withdrawal",
      authority: "CHIP SPA",
      changelog: [
        {
          _source: {
            packageId: "0001",
            id: "20001",
            event: "capitated-amendment",
            attachments: [
              {
                key: "doc001",
                title: "Contract Amendment",
                filename: "contract_amendment_2024.pdf",
              },
            ],
            additionalInformation: "Amendment to the capitated contract terms for 2024.",
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
          },
        },
        {
          _source: {
            packageId: "0002",
            id: "20002",
            event: "respond-to-rai",
            attachments: [
              {
                key: "rai002",
                title: "Response to RAI",
                filename: "rai_response.docx",
              },
            ],
            additionalInformation: "Detailed response to the request for additional information.",
            timestamp: 1675123200000, // Feb 1, 2023
          },
        },
        {
          _source: {
            packageId: "0003",
            id: "20003",
            event: "upload-subsequent-documents",
            attachments: [
              {
                key: "subdoc003",
                title: "Follow-Up Documents",
                filename: "followup_docs.zip",
              },
            ],
            additionalInformation: "Supporting documents uploaded as follow-up.",
            timestamp: 1677715200000, // Mar 1, 2023
          },
        },
        {
          _source: {
            packageId: "0004",
            id: "20004",
            event: "upload-subsequent-documents",
            attachments: [
              {
                key: "subdoc004",
                title: "Compliance Files",
                filename: "compliance_documents.xlsx",
              },
            ],
            additionalInformation: "Compliance review files uploaded.",
            timestamp: 1680307200000, // Apr 1, 2023
          },
        },
        {
          _source: {
            packageId: "0005",
            id: "20005",
            event: "withdraw-rai",
            attachments: [
              {
                key: "withdraw005",
                title: "Withdrawal Notice",
                filename: "rai_withdrawal_notice.pdf",
              },
            ],
            additionalInformation: "Official notice of RAI withdrawal submitted.",
            timestamp: 1682899200000, // May 1, 2023
          },
        },
        {
          _source: {
            packageId: "0006",
            id: "20006",
            event: "withdraw-package",
            attachments: [
              {
                key: "withdraw006",
                title: "Package Withdrawal",
                filename: "package_withdrawal_request.docx",
              },
            ],
            additionalInformation: "Package has been withdrawn from submission pipeline.",
            timestamp: 1685491200000, // Jun 1, 2023
          },
        },
        {
          _source: {
            packageId: "0007",
            id: "20007",
            event: undefined,
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: false,
          },
        },
      ],
    },
  },
};

export default items;
