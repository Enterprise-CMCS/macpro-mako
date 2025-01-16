import { SEATOOL_STATUS, opensearch } from "shared-types";
import type { TestItemResult } from "../index.d";
import { ATTACHMENT_BUCKET_NAME } from "../consts";

export const EXISTING_ITEM_PENDING_ID = "MD-0002.R00.00";
export const EXISTING_ITEM_APPROVED_NEW_ID = "MD-0000.R00.00";
export const VALID_ITEM_TEMPORARY_EXTENSION_ID = "MD-0000.R00.TE00";
export const VALID_ITEM_EXTENSION_ID = "VA-1111.R11.00";
export const EXISTING_ITEM_APPROVED_AMEND_ID = "MD-0000.R00.01";
export const EXISTING_ITEM_APPROVED_RENEW_ID = "MD-0000.R01.00";
export const EXISTING_ITEM_ID = "MD-00-0000";
export const NOT_FOUND_ITEM_ID = "MD-0004.R00.00";
export const NOT_EXISTING_ITEM_ID = "MD-11-0000";
export const TEST_ITEM_ID = "MD-0005.R01.00";
export const EXISTING_ITEM_TEMPORARY_EXTENSION_ID = "MD-0005.R01.TE00";
export const HI_TEST_ITEM_ID = "HI-0000.R00.00";
export const CAPITATED_INITIAL_ITEM_ID = "SS-2234.R00.00";
export const CAPITATED_INITIAL_NEW_ITEM_ID = "SS-1235.R00.00";
export const CAPITATED_AMEND_ITEM_ID = "VA-2234.R11.01";
export const WEIRD_ID = "VA";
export const CONTRACTING_INITIAL_ITEM_ID = "MD-007.R00.00";
export const CONTRACTING_AMEND_ITEM_ID = "MD-007.R00.01";
export const MISSING_CHANGELOG_ITEM_ID = "MD-008.R00.00";
export const WITHDRAWN_CHANGELOG_ITEM_ID = "VA-11-2020";
export const INITIAL_RELEASE_APPK_ITEM_ID = "MD-010.R00.01";
export const EXISTING_ITEM_APPROVED_APPK_ITEM_ID = "MD-012.R00.01";
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
  [WEIRD_ID]: {
    _id: EXISTING_ITEM_ID,
    found: true,
    _source: {
      leadAnalystEmail: "michael.chen@cms.hhs.gov",
      leadAnalystName: "Michael Chen",
      reviewTeam: [
        {
          email: "john.doe@medicaid.gov",
          name: "John Doe",
        },
        {
          email: "emily.rodriguez@medicaid.gov",
          name: "Emily Rodriguez",
        },
      ],
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
      origin: "OneMAC",
      state: "MD",
    },
  },
  [VALID_ITEM_EXTENSION_ID]: {
    _id: VALID_ITEM_EXTENSION_ID,
    found: true,
    _source: {
      id: VALID_ITEM_EXTENSION_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      authority: "1915(b)",
      origin: "OneMAC",
      state: "MD",
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
      origin: "OneMAC",
      state: "MD",
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
      origin: "OneMAC",
      state: "MD",
    },
  },
  [EXISTING_ITEM_PENDING_ID]: {
    _id: EXISTING_ITEM_PENDING_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_PENDING_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      origin: "SEATool",
      state: "MD",
    },
  },
  [CAPITATED_AMEND_ITEM_ID]: {
    _id: CAPITATED_AMEND_ITEM_ID,
    found: true,
    _source: {
      id: CAPITATED_AMEND_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      origin: "SEATool",
      state: "MD",
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
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      changelog: [
        {
          _id: `${TEST_ITEM_ID}-001`,
          _source: {
            id: `${TEST_ITEM_ID}-0001`,
            event: "new-medicaid-submission",
            packageId: TEST_ITEM_ID,
          },
        },
      ],
      authority: "Medicaid SPA",
    },
  },
  [EXISTING_ITEM_TEMPORARY_EXTENSION_ID]: {
    _id: EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "Extend",
      authority: "Medicaid SPA",
      changedDate: undefined,
      origin: "OneMAC",
      state: "MD",
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
      origin: "OneMAC",
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
      origin: "OneMAC",
      state: "MD",
      changelog: [
        {
          _id: `${CAPITATED_INITIAL_ITEM_ID}-0001`,
          _source: {
            id: `${CAPITATED_INITIAL_ITEM_ID}-0001`,
            event: "capitated-initial",
            packageId: CAPITATED_INITIAL_ITEM_ID,
          },
        },
      ],
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
      origin: "OneMAC",
      state: "MD",
      changelog: [
        {
          _id: `${CONTRACTING_INITIAL_ITEM_ID}-0001`,
          _source: {
            id: `${CONTRACTING_INITIAL_ITEM_ID}-0001`,
            event: "contracting-initial",
            packageId: CONTRACTING_INITIAL_ITEM_ID,
          },
        },
      ],
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
      origin: "OneMAC",
      state: "MD",
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
      state: "MD",
      origin: "OneMAC",
      changelog: [
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0001`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0001`,
            event: "capitated-amendment",
            attachments: [
              {
                key: "doc001",
                title: "Contract Amendment",
                filename: "contract_amendment_2024.pdf",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Amendment to the capitated contract terms for 2024.",
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
          },
        },
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0002`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0002`,
            event: "respond-to-rai",
            attachments: [
              {
                key: "rai002",
                title: "Response to RAI",
                filename: "rai_response.docx",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Detailed response to the request for additional information.",
            timestamp: 1675123200000, // Feb 1, 2023
          },
        },
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0003`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0003`,
            event: "upload-subsequent-documents",
            attachments: [
              {
                key: "subdoc003",
                title: "Follow-Up Documents",
                filename: "followup_docs.zip",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Supporting documents uploaded as follow-up.",
            timestamp: 1677715200000, // Mar 1, 2023
          },
        },
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0004`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0004`,
            event: "upload-subsequent-documents",
            attachments: [
              {
                key: "subdoc004",
                title: "Compliance Files",
                filename: "compliance_documents.xlsx",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Compliance review files uploaded.",
            timestamp: 1680307200000, // Apr 1, 2023
          },
        },
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0005`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0005`,
            event: "withdraw-rai",
            attachments: [
              {
                key: "withdraw005",
                title: "Withdrawal Notice",
                filename: "rai_withdrawal_notice.pdf",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Official notice of RAI withdrawal submitted.",
            timestamp: 1682899200000, // May 1, 2023
          },
        },
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0006`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0006`,
            event: "withdraw-package",
            attachments: [
              {
                key: "withdraw006",
                title: "Package Withdrawal",
                filename: "package_withdrawal_request.docx",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Package has been withdrawn from submission pipeline.",
            timestamp: 1685491200000, // Jun 1, 2023
          },
        },
        {
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0007`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0007`,
            event: undefined,
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: false,
          },
        },
      ],
    },
  },
  [INITIAL_RELEASE_APPK_ITEM_ID]: {
    _id: INITIAL_RELEASE_APPK_ITEM_ID,
    found: true,
    _source: {
      id: INITIAL_RELEASE_APPK_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      appkChildren: [
        {
          _source: {
            authority: "1915(c)",
            changedDate: "2024-01-01T00:00:00Z",
            title: "Initial release",
            seatoolStatus: SEATOOL_STATUS.PENDING,
            cmsStatus: "Pending",
            stateStatus: "Under Review",
          },
        },
      ],
    },
  },
  [EXISTING_ITEM_APPROVED_APPK_ITEM_ID]: {
    _id: EXISTING_ITEM_APPROVED_APPK_ITEM_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_APPROVED_APPK_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      appkChildren: [
        {
          _source: {
            changedDate: "2024-01-01T00:00:00Z",
            title: "Initial release",
            cmsStatus: "Pending",
            stateStatus: "Under Review",
          },
        },
        {
          _source: {
            changedDate: "2025-01-08T00:00:00Z",
            title: "Approved release",
            cmsStatus: "Approved",
            stateStatus: "Approved",
          },
        },
      ],
    },
  },
};

export const TEST_MED_SPA_ITEM = items[TEST_ITEM_ID] as opensearch.main.ItemResult;
export const TEST_CHIP_SPA_ITEM = items[WITHDRAWN_CHANGELOG_ITEM_ID] as opensearch.main.ItemResult;
export const TEST_1915B_ITEM = items[EXISTING_ITEM_APPROVED_NEW_ID] as opensearch.main.ItemResult;
export const TEST_1915C_ITEM = items[INITIAL_RELEASE_APPK_ITEM_ID] as opensearch.main.ItemResult;
export const TEST_ITEM_WITH_APPK = items[
  EXISTING_ITEM_APPROVED_APPK_ITEM_ID
] as opensearch.main.ItemResult;
export const TEST_ITEM_WITH_CHANGELOG = items[
  WITHDRAWN_CHANGELOG_ITEM_ID
] as opensearch.main.ItemResult;
export const TEST_TEMP_EXT_ITEM = items[
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID
] as opensearch.main.ItemResult;

export default items;
