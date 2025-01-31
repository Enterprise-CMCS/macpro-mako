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
export const TEST_SPA_ITEM_ID = "MD-11-2020";
export const TEST_PACKAGE_STATUS_ID = "MD-11-2021";
export const TEST_SPA_ITEM_TO_SPLIT = "MD-12-2020";
export const TEST_SPLIT_SPA_ITEM_ID = "MD-12-2020-Z";
export const EXISTING_ITEM_TEMPORARY_EXTENSION_ID = "MD-0005.R01.TE00";
export const HI_TEST_ITEM_ID = "HI-0000.R00.00";
export const CAPITATED_INITIAL_ITEM_ID = "SS-2234.R00.00";
export const CAPITATED_INITIAL_NEW_ITEM_ID = "SS-1235.R00.00";
export const ADMIN_ITEM_ID = "SS-1235.R00.01";
export const CAPITATED_AMEND_ITEM_ID = "VA-2234.R11.01";
export const SIMPLE_ID = "VA";
export const CONTRACTING_INITIAL_ITEM_ID = "MD-007.R00.00";
export const CONTRACTING_AMEND_ITEM_ID = "MD-007.R00.01";
export const MISSING_CHANGELOG_ITEM_ID = "MD-008.R00.00";
export const WITHDRAWN_CHANGELOG_ITEM_ID = "VA-11-2020";
export const INITIAL_RELEASE_APPK_ITEM_ID = "MD-010.R00.01";
export const WITHDRAW_APPK_ITEM_ID = "MD-010.R00.02";
export const EXISTING_ITEM_APPROVED_APPK_ITEM_ID = "MD-012.R00.01";
export const SUBMISSION_ERROR_ITEM_ID = "Throw Submission Error";
export const GET_ERROR_ITEM_ID = "Throw Get Item Error";
export const WITHDRAW_RAI_ITEM_B = "VA-2234.R11.02";
export const WITHDRAW_RAI_ITEM_C = "VA-2234.R11.03";

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
  [SIMPLE_ID]: {
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
  [ADMIN_ITEM_ID]: {
    _id: ADMIN_ITEM_ID,
    found: true,
    _source: {
      id: ADMIN_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      origin: "SEATool",
      state: "MD",
      changelog: [
        {
          _id: `${ADMIN_ITEM_ID}-0001`,
          _source: {
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0001`,
            event: "split-spa",
            changeMade: "add file",
            changeReason: "missing file",
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0002`,
          _source: {
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0002`,
            event: "NOSO",
            changeMade: "add file",
            changeReason: "missing file",
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0003`,
          _source: {
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0003`,
            event: "legacy-admin-change",
            changeMade: "add file",
            changeReason: "missing file",
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0004`,
          _source: {
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0004`,
            changeMade: "add file",
            changeReason: "missing file",
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0005`,
          _source: {
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0005`,
            submitterName: "Test person",
            event: "toggle-withdraw-rai",
            changeMade: "add file",
            changeReason: "missing file",
            raiWithdrawEnabled: true,
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0006`,
          _source: {
            timestamp: 1672531200000, // Jan 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0006`,
            submitterName: "Test person",
            event: "toggle-withdraw-rai",
            changeMade: "add file",
            changeReason: "missing file",
            raiWithdrawEnabled: false,
            attachments: [
              {
                key: "misc007",
                title: "Miscellaneous File",
                filename: "miscellaneous_info.txt",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
      ],
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
      authority: "1915(c)",
    },
  },
  [TEST_SPA_ITEM_ID]: {
    _id: TEST_SPA_ITEM_ID,
    found: true,
    _source: {
      id: TEST_SPA_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      changelog: [
        {
          _id: `${TEST_SPA_ITEM_ID}-001`,
          _source: {
            id: `${TEST_SPA_ITEM_ID}-0001`,
            event: "new-medicaid-submission",
            packageId: TEST_SPA_ITEM_ID,
          },
        },
      ],
      authority: "Medicaid SPA",
    },
  },
  [TEST_PACKAGE_STATUS_ID]: {
    _id: TEST_PACKAGE_STATUS_ID,
    found: true,
    _source: {
      id: TEST_PACKAGE_STATUS_ID,
      raiWithdrawEnabled: true,
      secondClock: true,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      changelog: [
        {
          _id: `${TEST_PACKAGE_STATUS_ID}-001`,
          _source: {
            id: `${TEST_PACKAGE_STATUS_ID}-0001`,
            event: "new-medicaid-submission",
            packageId: TEST_PACKAGE_STATUS_ID,
          },
        },
      ],
      authority: "Medicaid SPA",
    },
  },
  [TEST_SPA_ITEM_TO_SPLIT]: {
    _id: TEST_SPA_ITEM_TO_SPLIT,
    found: true,
    _source: {
      id: TEST_SPA_ITEM_TO_SPLIT,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      changelog: [
        {
          _id: `${TEST_SPA_ITEM_TO_SPLIT}-001`,
          _source: {
            id: `${TEST_SPA_ITEM_TO_SPLIT}-0001`,
            event: "new-medicaid-submission",
            packageId: TEST_SPA_ITEM_TO_SPLIT,
          },
        },
      ],
      authority: "Medicaid SPA",
    },
  },
  [TEST_SPLIT_SPA_ITEM_ID]: {
    _id: TEST_SPLIT_SPA_ITEM_ID,
    found: true,
    _source: {
      id: TEST_SPLIT_SPA_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      changelog: [
        {
          _id: `${TEST_SPLIT_SPA_ITEM_ID}-001`,
          _source: {
            id: `${TEST_SPLIT_SPA_ITEM_ID}-0001`,
            event: "new-medicaid-submission",
            packageId: TEST_SPLIT_SPA_ITEM_ID,
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
              {
                key: "doc002",
                title: "Contract Amendment2",
                filename: "contract_amendment_2024_2.pdf",
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
  [WITHDRAW_APPK_ITEM_ID]: {
    _id: WITHDRAW_APPK_ITEM_ID,
    found: true,
    _source: {
      id: WITHDRAW_APPK_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      changelog: [
        {
          _id: `${WITHDRAW_APPK_ITEM_ID}-0001`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0001`,
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
          _id: `${WITHDRAW_APPK_ITEM_ID}-0002`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0002`,
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
          _id: `${WITHDRAW_APPK_ITEM_ID}-0003`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0003`,
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
          _id: `${WITHDRAW_APPK_ITEM_ID}-0004`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0004`,
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
          _id: `${WITHDRAW_APPK_ITEM_ID}-0005`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0005`,
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
          _id: `${WITHDRAW_APPK_ITEM_ID}-0006`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0006`,
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
          _id: `${WITHDRAW_APPK_ITEM_ID}-0007`,
          _source: {
            packageId: WITHDRAW_APPK_ITEM_ID,
            id: `${WITHDRAW_APPK_ITEM_ID}-0007`,
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
      appkChildren: [
        {
          _id: "withdrawn",
          _source: {
            authority: "1915(c)",
            changedDate: "2024-01-01T00:00:00Z",
            title: "Initial release",
            seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
            cmsStatus: "Pending",
            stateStatus: "Under Review",
          },
        },
      ],
    },
  },
  [WITHDRAW_RAI_ITEM_B]: {
    _id: WITHDRAW_RAI_ITEM_B,
    found: true,
    _source: {
      id: WITHDRAW_RAI_ITEM_B,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      actionType: "respond-to-rai",
      authority: "1915(b)",
      state: "MD",
      origin: "OneMAC",
      changelog: [
        {
          _id: `${WITHDRAW_RAI_ITEM_B}-001`,
          _source: {
            id: `${WITHDRAW_RAI_ITEM_B}-0001`,
            event: "respond-to-rai",
            packageId: WITHDRAW_RAI_ITEM_B,
          },
        },
      ],
    },
  },
  [WITHDRAW_RAI_ITEM_C]: {
    _id: WITHDRAW_RAI_ITEM_C,
    found: true,
    _source: {
      id: WITHDRAW_RAI_ITEM_C,
      seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      actionType: "respond-to-rai",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      authority: "1915(c)",
      state: "MD",
      leadAnalystName: "lead test",
      leadAnalystEmail: "Lead test email",
      reviewTeam: [
        {
          name: "Test",
          email: "testemail",
        },
      ],
      origin: "OneMAC",
      changelog: [
        {
          _id: `${WITHDRAW_RAI_ITEM_C}-001`,
          _source: {
            id: `${WITHDRAW_RAI_ITEM_C}-0001`,
            submitterName: "Testmctex",
            submitterEmail: "fakeemail;",
            event: "respond-to-rai",
            packageId: WITHDRAW_RAI_ITEM_C,
          },
        },

        {
          _id: `${WITHDRAW_RAI_ITEM_C}-002`,
          _source: {
            id: `${WITHDRAW_RAI_ITEM_C}-0002`,
            submitterName: "Testmctex",
            submitterEmail: "fakeemail;",
            event: "withdraw-rai",
            packageId: WITHDRAW_RAI_ITEM_C,
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
export const TEST_PACKAGE_STATUS_ITEM = items[TEST_PACKAGE_STATUS_ID] as opensearch.main.ItemResult;
export const TEST_MED_SPA_ITEM = items[TEST_SPA_ITEM_ID] as opensearch.main.ItemResult;
export const TEST_CHIP_SPA_ITEM = items[WITHDRAWN_CHANGELOG_ITEM_ID] as opensearch.main.ItemResult;
export const TEST_1915B_ITEM = items[EXISTING_ITEM_APPROVED_NEW_ID] as opensearch.main.ItemResult;
export const TEST_1915C_ITEM = items[INITIAL_RELEASE_APPK_ITEM_ID] as opensearch.main.ItemResult;
export const WITHDRAW_APPK_ITEM = items[WITHDRAW_APPK_ITEM_ID] as opensearch.main.ItemResult;
export const ADMIN_CHANGE_ITEM = items[ADMIN_ITEM_ID] as opensearch.main.ItemResult;
export const TEST_ITEM_WITH_APPK = items[
  EXISTING_ITEM_APPROVED_APPK_ITEM_ID
] as opensearch.main.ItemResult;
export const TEST_ITEM_WITH_CHANGELOG = items[
  WITHDRAWN_CHANGELOG_ITEM_ID
] as opensearch.main.ItemResult;
export const TEST_TEMP_EXT_ITEM = items[
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID
] as opensearch.main.ItemResult;

export const itemList = Object.values(items);

export const getFilteredItemList = (filters: string[]): opensearch.main.ItemResult[] =>
  itemList
    .filter((item) => filters.includes(item?._source?.authority || ""))
    .map((item) => item as opensearch.main.ItemResult);

export const docList = Object.values(items).map(
  (item) => (item?._source || {}) as opensearch.main.Document,
);

export const getFilteredDocList = (filters: string[]): opensearch.main.Document[] =>
  docList.filter((item) => filters.includes(item?.authority || ""));

export default items;
