import {
  opensearch,
  SEATOOL_STATUS,
  statusToDisplayToCmsUser,
  statusToDisplayToStateUser,
} from "shared-types";

import { ATTACHMENT_BUCKET_NAME } from "../consts";
import type { TestItemResult } from "../index.d";
export const EXISTING_ITEM_PENDING_ID = "MD-0002.R00.00";
export const EXISTING_ITEM_APPROVED_NEW_ID = "MD-0000.R00.00";
export const DELETED_ITEM_ID = "MD-0000.R00.00-del";
export const VALID_ITEM_TEMPORARY_EXTENSION_ID = "MD-0000.R00.TE00";
export const VALID_ITEM_EXTENSION_ID = "VA-1111.R11.00";
export const EXISTING_ITEM_APPROVED_AMEND_ID = "MD-0000.R00.01";
export const EXISTING_ITEM_APPROVED_RENEW_ID = "MD-0000.R01.00";
export const EXISTING_ITEM_ID = "MD-00-0000";
export const NOT_FOUND_ITEM_ID = "MD-0004.R00.00";
export const NOT_EXISTING_ITEM_ID = "MD-11-0000";
export const TEST_ITEM_ID = "MD-0005.R01.00";
export const WITHDRAWAL_REQUESTED_ID = "MD-0005.R01.05";
export const SUBMITTED_RAI_ID = "MD-0005.R01.06";
export const RAI_WITHDRAWAL_ID = "MD-0005.R01.07";
export const TEST_SPA_ITEM_ID = "MD-11-2020";
export const TEST_SPA_ITEM_RAI_ID = "MD-11-2022";
export const NEW_CHIP_ITEM_ID = "MD-12-2024";
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
export const WITHDRAW_EMAIL_SENT = "VA-2234.R11.50";
export const CONTRACTING_INITIAL_ITEM_ID = "MD-007.R00.00";
export const CONTRACTING_AMEND_ITEM_ID = "MD-007.R00.01";
export const MISSING_CHANGELOG_ITEM_ID = "MD-008.R00.00";
export const CAP_INIT_1915B_ITEM_ID = "MD-009.R00.00";
export const APP_K_1915C_ITEM_ID = "MD-010.R00.00";
export const WITHDRAWN_CHANGELOG_ITEM_ID = "VA-11-2020";
export const INITIAL_RELEASE_APPK_ITEM_ID = "MD-010.R00.01";
export const WITHDRAW_APPK_ITEM_ID = "MD-010.R00.02";
export const EXISTING_ITEM_APPROVED_APPK_ITEM_ID = "MD-012.R00.01";
export const SUBMISSION_ERROR_ITEM_ID = "Throw Submission Error";
export const GET_ERROR_ITEM_ID = "MD-Throw Get Item Error";
export const WITHDRAW_RAI_ITEM_B = "VA-2234.R11.02";
export const WITHDRAW_RAI_ITEM_C = "VA-2234.R11.03";
export const WITHDRAW_RAI_ITEM_D = "VA-12-2020";
export const WITHDRAW_RAI_ITEM_E = "MD-13-2020";
export const LEGACY_TIMESTAMP_ID = "1666885236740";
export const LEGACY_PREVIOUS_ENTRY = "MD-22-0029";
const items: Record<string, TestItemResult> = {
  [EXISTING_ITEM_ID]: {
    _id: EXISTING_ITEM_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      statusDate: "2024-05-26T09:17:21.557Z",
      changedDate: "2024-05-26T09:17:21.557Z",
      makoChangedDate: "2024-05-26T09:17:21.557Z",
    },
  },
  [DELETED_ITEM_ID]: {
    _id: DELETED_ITEM_ID,
    found: true,
    _source: {
      id: DELETED_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      submitterName: "BOB SMITH",
      submitterEmail: "BOBSMITH@MEDICAIDFAKE.gov",
      id: EXISTING_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      actionType: "New",
      submissionDate: "2024-12-01T09:17:21.557Z",
      raiRequestedDate: "2024-12-25T09:17:21.557Z",
      statusDate: "2024-12-25T09:17:21.557Z",
      changedDate: "2024-12-25T09:17:21.557Z",
      makoChangedDate: "2024-12-25T09:17:21.557Z",
    },
  },
  [WITHDRAW_EMAIL_SENT]: {
    _id: WITHDRAW_EMAIL_SENT,
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
      withdrawEmailSent: true,
      submitterName: "BOB SMITH",
      submitterEmail: "BOBSMITH@MEDICAIDFAKE.gov",
      id: WITHDRAW_EMAIL_SENT,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      makoChangedDate: "2024-12-25T09:17:21.557Z",
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      changelog: [
        {
          _id: `${WITHDRAW_EMAIL_SENT}-001`,
        },
      ],
    },
  },
  [EXISTING_ITEM_APPROVED_NEW_ID]: {
    _id: EXISTING_ITEM_APPROVED_NEW_ID,
    found: true,
    _source: {
      id: EXISTING_ITEM_APPROVED_NEW_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "Amend",
      authority: "1915(c)",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
      actionType: "New",
      origin: "SEATool",
      state: "MD",
      statusDate: "2023-11-26T17:17:21.557Z",
      changedDate: "2023-11-26T17:17:21.557Z",
      makoChangedDate: "2023-11-26T17:17:21.557Z",
    },
  },
  [CAPITATED_AMEND_ITEM_ID]: {
    _id: CAPITATED_AMEND_ITEM_ID,
    found: true,
    _source: {
      id: CAPITATED_AMEND_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
      actionType: "New",
      origin: "SEATool",
      state: "MD",
      changelog: [
        {
          _id: `${CAPITATED_AMEND_ITEM_ID}-001`,
          _source: {
            id: `${CAPITATED_AMEND_ITEM_ID}-0001`,
            event: "upload-subsequent-documents",
            packageId: CAPITATED_AMEND_ITEM_ID,
            authority: "Medicaid SPA",
            attachments: [
              {
                key: "subdoc001",
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
          _id: `${CAPITATED_AMEND_ITEM_ID}-003`,
          _source: {
            id: `${CAPITATED_AMEND_ITEM_ID}-0003`,
            event: "upload-subsequent-documents",
            packageId: CAPITATED_AMEND_ITEM_ID,
            authority: "Medicaid SPA",
            attachments: [
              {
                key: "subdoc003",
                title: "Follow-Up Documents",
                filename: "followup_docs.zip",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Supporting documents uploaded as follow-up.",
            timestamp: 1678715205000, // Mar 13, 2023
          },
        },
        {
          _id: `${CAPITATED_AMEND_ITEM_ID}-002`,
          _source: {
            id: `${CAPITATED_AMEND_ITEM_ID}-0002`,
            event: "upload-subsequent-documents",
            packageId: CAPITATED_AMEND_ITEM_ID,
            authority: "Medicaid SPA",
            attachments: [
              {
                key: "subdoc002",
                title: "Follow-Up Documents",
                filename: "followup_docs.zip",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Supporting documents uploaded as follow-up.",
            timestamp: 1678515205000, // Mar 11, 2023
          },
        },
        {
          _id: `${CAPITATED_AMEND_ITEM_ID}-004`,
        },
      ],
    },
  },
  [LEGACY_PREVIOUS_ENTRY]: {
    _id: LEGACY_PREVIOUS_ENTRY,
    found: true,
    _source: {
      id: LEGACY_PREVIOUS_ENTRY,
      seatoolStatus: SEATOOL_STATUS.PENDING,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
      actionType: "New",
      origin: "SEATool",
      state: "MD",
      changelog: [
        {
          _id: "MD-22-0030-1666885236740",

          _source: {
            id: "MD-22-0030-1666885236740",
            packageId: LEGACY_PREVIOUS_ENTRY,
            timestamp: 1666885236740,
            event: "new-medicaid-submission",
            attachments: [
              {
                title: "CMS Form 179",
                filename: "15MB.pdf",
                uploadDate: 1666885211577,
                bucket: "uploads-develop-attachments-116229642442",
                key: "protected/us-east-1:86a190fe-b195-42bf-9685-9761bf0ff14b/1666885211577/15MB.pdf",
              },
              {
                title: "SPA Pages",
                filename: "adobe.pdf",
                uploadDate: 1666885211579,
                bucket: "uploads-develop-attachments-116229642442",
                key: "protected/us-east-1:86a190fe-b195-42bf-9685-9761bf0ff14b/1666885211579/adobe.pdf",
              },
            ],
            additionalInformation: "This is just a test",
            submitterEmail: "statesubmitter@nightwatch.test",
            submitterName: "Statesubmitter Nightwatch",
          },
        },
      ],
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
            timestamp: 1672581600000, // Jan 1, 2023, in milliseconds
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
            timestamp: 1677679200000, // Mar 1, 2023, in milliseconds
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
            timestamp: 1685624400000, // Jun 1, 2023, in milliseconds
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
            timestamp: 1693573200000, // Sep 1, 2023, in milliseconds
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
            timestamp: 1701439200000, // Dec 1, 2023, in milliseconds
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
        {
          _id: `${ADMIN_ITEM_ID}-0007`,
          _source: {
            timestamp: 1701439200000, // Dec 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0007`,
            submitterName: "Test person",
            event: "legacy-admin-change",
            changeMade:
              "Systemadmin Nightwatch has disabled State package action to withdraw Formal RAI Response",
            changeReason: "missing file",
            raiWithdrawEnabled: false,

            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0008`,
          _source: {
            timestamp: 1701439200000, // Dec 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0008`,
            submitterName: "Test person",
            event: "legacy-admin-change",
            changeMade:
              "Systemadmin Nightwatch has enabled State package action to withdraw Formal RAI Response",
            changeReason: "missing file",
            raiWithdrawEnabled: false,

            additionalInformation: "Uncategorized file upload.",
            isAdminChange: true,
          },
        },
        {
          _id: `${ADMIN_ITEM_ID}-0009`,
          _source: {
            timestamp: 1701439200000, // Dec 1, 2023, in milliseconds
            packageId: ADMIN_ITEM_ID,
            id: `${ADMIN_ITEM_ID}-0009`,
            submitterName: "Test person",
            event: "legacy-admin-change",
            changeMade: "ID changed from one to another",
            changeReason: "missing file",
            raiWithdrawEnabled: false,

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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      statusDate: "2024-11-26T18:17:21.557Z",
      changedDate: "2024-11-26T18:17:21.557Z",
      makoChangedDate: "2024-11-26T18:17:21.557Z",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      submissionDate: "2024-10-27T18:17:21.557Z",
      changedDate: "2024-11-26T18:17:21.557Z",
      makoChangedDate: "2024-11-26T18:17:21.557Z",
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
  [NEW_CHIP_ITEM_ID]: {
    _id: NEW_CHIP_ITEM_ID,
    found: true,
    _source: {
      id: NEW_CHIP_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      submissionDate: "2024-10-27T18:17:21.557Z",
      changedDate: "2024-11-26T18:17:21.557Z",
      makoChangedDate: "2024-11-26T18:17:21.557Z",
      changelog: [
        {
          _id: `${NEW_CHIP_ITEM_ID}-001`,
          _source: {
            id: `${NEW_CHIP_ITEM_ID}-0001`,
            event: "new-chip-submission",
            packageId: NEW_CHIP_ITEM_ID,
          },
        },
      ],
      authority: "CHIP SPA",
    },
  },
  [CAP_INIT_1915B_ITEM_ID]: {
    _id: CAP_INIT_1915B_ITEM_ID,
    found: true,
    _source: {
      id: CAP_INIT_1915B_ITEM_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      authority: "1915(b)",
      origin: "OneMAC",
      state: "MD",
      changelog: [
        {
          _id: `${CAP_INIT_1915B_ITEM_ID}-001`,
          _source: {
            id: `${CAP_INIT_1915B_ITEM_ID}-0001`,
            event: "capitated-initial",
            proposedEffectiveDate: 1677715200000, // Mar 1, 2023
            attachments: [],
          },
        },
      ],
    },
  },
  [APP_K_1915C_ITEM_ID]: {
    _id: APP_K_1915C_ITEM_ID,
    found: true,
    _source: {
      id: WITHDRAWAL_REQUESTED_ID,
      seatoolStatus: SEATOOL_STATUS.WITHDRAW_REQUESTED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      changelog: [
        {
          _id: `${APP_K_1915C_ITEM_ID}-001`,
          _source: {
            id: `${APP_K_1915C_ITEM_ID}-0001`,
            event: "app-k",
            packageId: APP_K_1915C_ITEM_ID,
            proposedEffectiveDate: 1677715200000, // Mar 1, 2023
            attachments: [],
            additionalInformation: "Supporting documents uploaded as follow-up.",
            timestamp: 1677715200000, // Mar 1, 2023
          },
        },
      ],
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
  [TEST_SPA_ITEM_RAI_ID]: {
    _id: TEST_SPA_ITEM_RAI_ID,
    found: true,
    _source: {
      id: TEST_SPA_ITEM_RAI_ID,
      seatoolStatus: SEATOOL_STATUS.APPROVED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      submissionDate: "2024-10-27T18:17:21.557Z",
      changedDate: "2024-11-26T18:17:21.557Z",
      makoChangedDate: "2024-11-26T18:17:21.557Z",
      appkParent: true,
      appkChildren: [
        {
          _source: {
            // @ts-ignore appk is legacy and will not continue to be supported
            appkParentId: TEST_SPA_ITEM_RAI_ID,
            seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
            stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
            cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
            actionType: "respond-to-rai",
            raiRequestedDate: "2024-01-01T00:00:00.100Z",
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
          },
        },
      ],
      changelog: [
        {
          _id: `${TEST_SPA_ITEM_RAI_ID}-001`,
          _source: {
            id: `${TEST_SPA_ITEM_RAI_ID}-0001`,
            event: "new-medicaid-submission",
            packageId: TEST_SPA_ITEM_RAI_ID,
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      makoChangedDate: "2024-11-26T18:17:21.557Z",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      state: "MD",
      origin: "OneMAC",
      changedDate: "2024-11-26T18:17:21.557Z",
      makoChangedDate: "2024-11-26T18:17:21.557Z",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "Extend",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "Amend",
      authority: "1915(b)",
      origin: "OneMAC",
      state: "MD",
      statusDate: "2025-06-10T13:17:21.557Z",
      changedDate: "2025-06-10T13:17:21.557Z",
      makoChangedDate: "2025-06-10T13:17:21.557Z",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.WITHDRAWN],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.WITHDRAWN],
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
            submitterName: "BOB SMITH",
            submitterEmail: "BOBSMITH@MEDICAIDFAKE.gov",
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
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0006`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0006`,
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
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0007`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0007`,
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
          _id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0008`,
          _source: {
            packageId: WITHDRAWN_CHANGELOG_ITEM_ID,
            id: `${WITHDRAWN_CHANGELOG_ITEM_ID}-0008`,
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
  [RAI_WITHDRAWAL_ID]: {
    _id: RAI_WITHDRAWAL_ID,
    found: true,
    _source: {
      id: RAI_WITHDRAWAL_ID,
      seatoolStatus: SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED],
      actionType: "Respond to Formal RAI",
      authority: "CHIP SPA",
      state: "MD",
      origin: "OneMAC",
      submissionDate: "2023-12-31T00:00:00.000Z",
      changelog: [
        {
          _id: `${RAI_WITHDRAWAL_ID}-0001`,
          _source: {
            packageId: RAI_WITHDRAWAL_ID,
            id: `${RAI_WITHDRAWAL_ID}-0001`,
            event: "respond-to-rai",
            attachments: [
              {
                key: "rai001",
                title: "Response to RAI",
                filename: "rai_response.docx",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Detailed response to the request for additional information.",
            timestamp: 1675123200000, // Feb 1, 2023
          },
        },
      ],
    },
  },
  [SUBMITTED_RAI_ID]: {
    _id: SUBMITTED_RAI_ID,
    found: true,
    _source: {
      id: SUBMITTED_RAI_ID,
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.SUBMITTED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.SUBMITTED],
      actionType: "Respond to Formal RAI",
      authority: "CHIP SPA",
      state: "MD",
      origin: "OneMAC",
      submissionDate: "2023-01-01T00:00:00.000Z",
      raiRequestedDate: "2023-01-15T00:00:00.000Z",
      // @ts-ignore Type is messed up
      raiReceivedDate: "2023-02-01T00:00:00.000Z",
      changelog: [
        {
          _id: `${SUBMITTED_RAI_ID}-0001`,
          _source: {
            packageId: SUBMITTED_RAI_ID,
            id: `${SUBMITTED_RAI_ID}-0001`,
            event: "respond-to-rai",
            attachments: [
              {
                key: "rai001",
                title: "Response to RAI",
                filename: "rai_response.docx",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Detailed response to the request for additional information.",
            timestamp: 1675123200000, // Feb 1, 2023
          },
        },
      ],
    },
  },
  [WITHDRAWAL_REQUESTED_ID]: {
    _id: WITHDRAWAL_REQUESTED_ID,
    found: true,
    _source: {
      id: WITHDRAWAL_REQUESTED_ID,
      seatoolStatus: SEATOOL_STATUS.WITHDRAW_REQUESTED,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      submissionDate: "2023-12-31T00:00:00.000Z",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      // @ts-ignore Type is messed up
      raiReceivedDate: "2024-01-03T00:00:00.000Z",
      changelog: [
        {
          _id: `${WITHDRAWAL_REQUESTED_ID}-0001`,
          _source: {
            packageId: WITHDRAWAL_REQUESTED_ID,
            id: `${WITHDRAWAL_REQUESTED_ID}-0001`,
            event: "respond-to-rai",
            attachments: [
              {
                key: "rai001",
                title: "Response to RAI",
                filename: "rai_response.docx",
                bucket: ATTACHMENT_BUCKET_NAME,
              },
            ],
            additionalInformation: "Detailed response to the request for additional information.",
            timestamp: 1675123200000, // Feb 1, 2023
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      appkChildren: [
        {
          _source: {
            authority: "1915(c)",
            changedDate: "2024-01-01T00:00:00Z",
            makoChangedDate: "2024-01-01T00:00:00Z",
            title: "Initial release",
            seatoolStatus: SEATOOL_STATUS.PENDING,
            stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
            cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
            submitterName: "Bob Smith",
            submitterEmail: "bob@mail.com",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
      actionType: "respond-to-rai",
      authority: "1915(b)",
      submissionDate: "2023-12-31T00:00:00.000Z",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
      actionType: "respond-to-rai",
      submissionDate: "2023-12-31T00:00:00.000Z",
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
  [WITHDRAW_RAI_ITEM_D]: {
    _id: WITHDRAW_RAI_ITEM_D,
    found: true,
    _source: {
      id: WITHDRAW_RAI_ITEM_D,
      seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
      actionType: "respond-to-rai",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      authority: "CHIP SPA",
      state: "VA",
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
          _id: `${WITHDRAW_RAI_ITEM_D}-001`,
          _source: {
            id: `${WITHDRAW_RAI_ITEM_D}-0001`,
            submitterName: "Testmctex",
            submitterEmail: "fakeemail;",
            event: "respond-to-rai",
            packageId: WITHDRAW_RAI_ITEM_C,
          },
        },
      ],
    },
  },
  [WITHDRAW_RAI_ITEM_E]: {
    _id: WITHDRAW_RAI_ITEM_E,
    found: true,
    _source: {
      id: WITHDRAW_RAI_ITEM_E,
      seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
      actionType: "respond-to-rai",
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
      authority: "Medicaid SPA",
      state: "VA",
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
          _id: `${WITHDRAW_RAI_ITEM_E}-001`,
          _source: {
            id: `${WITHDRAW_RAI_ITEM_E}-0001`,
            submitterName: "Testmctex",
            submitterEmail: "fakeemail;",
            event: "respond-to-rai",
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
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.APPROVED],
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.APPROVED],
      actionType: "New",
      authority: "1915(c)",
      state: "MD",
      origin: "OneMAC",
      appkChildren: [
        {
          _source: {
            changedDate: "2024-01-01T00:00:00Z",
            makoChangedDate: "2024-01-01T00:00:00Z",
            title: "Initial release",
            cmsStatus: "Pending",
            stateStatus: "Under Review",
          },
        },
        {
          _source: {
            changedDate: "2025-01-08T00:00:00Z",
            makoChangedDate: "2025-01-08T00:00:00Z",
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
export const TEST_MED_SPA_RAI_ITEM = items[TEST_SPA_ITEM_RAI_ID] as opensearch.main.ItemResult;
export const TEST_CHIP_SPA_ITEM = items[NEW_CHIP_ITEM_ID] as opensearch.main.ItemResult;
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

export const docList = itemList.map((item) => (item?._source || {}) as opensearch.main.Document);

export const getFilteredDocList = (filters: string[]): opensearch.main.Document[] =>
  docList.filter((item) => filters.includes(item?.authority || ""));

export default items;
