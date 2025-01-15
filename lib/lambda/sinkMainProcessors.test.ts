import { describe, expect, it, vi, afterEach } from "vitest";
import {
  insertNewSeatoolRecordsFromKafkaIntoMako,
  insertOneMacRecordsFromKafkaIntoMako,
  syncSeatoolRecordDatesFromKafkaWithMako,
} from "./sinkMainProcessors";
import { seatool } from "shared-types/opensearch/main";
import { offsetToUtc } from "shared-utils";
import { SEATOOL_STATUS, statusToDisplayToCmsUser, statusToDisplayToStateUser } from "shared-types";
import * as sink from "libs/sink-lib";
import * as os from "libs/opensearch-lib";
import {
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  TEST_ITEM_ID,
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
  NOT_FOUND_ITEM_ID,
  convertObjToBase64,
  createKafkaRecord,
  errorMainMultiDocumentHandler,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import {
  appkBase,
  capitatedInitial,
  capitatedAmendmentBase,
  capitatedRenewal,
  contractingInitial,
  contractingAmendment,
  contractingRenewal,
  newChipSubmission,
  newMedicaidSubmission,
  uploadSubsequentDocuments,
  temporaryExtension,
  respondToRai,
  toggleWithdrawRai,
  withdrawPackage,
  withdrawRai,
} from "mocks/data/submit/base";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}main`;
const TEST_ITEM_KEY = Buffer.from(TEST_ITEM_ID).toString("base64");
const TIMESTAMP = 1732645041557;
const ISO_DATETIME = "2024-11-26T18:17:21.557Z";
const EARLIER_TIMESTAMP = 1722645041557;
const EARLIER_ISO_DATETIME = "2024-08-03T00:30:41.557Z";
const LATER_TIMESTAMP = 1742645041557;
const LATER_ISO_DATETIME = "2025-03-22T12:04:01.557Z";

const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
const logErrorSpy = vi.spyOn(sink, "logError");

describe("insertOneMacRecordsFromKafkaIntoMako", () => {
  const TOPIC = "--mako--branch-name--aws.onemac.migration.cdc";

  afterEach(() => {
    vi.clearAllMocks();
  });

  type BulkUpdateRequestBody = {
    initialIntakeNeeded: boolean;
    actionType?: string;
    title?: string;
    additionalInformation?: string;
    originalWaiverNumber?: string;
    cmsStatus?: string;
    stateStatus?: string;
  };

  it.each([
    [
      "app-k",
      appkBase,
      SEATOOL_STATUS.PENDING,
      {
        title: appkBase.title,
        proposedDate: appkBase.proposedEffectiveDate,
        additionalInformation: appkBase.additionalInformation,
        actionType: "Amend",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "capitated-initial",
      capitatedInitial,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: capitatedInitial.proposedEffectiveDate,
        additionalInformation: capitatedInitial.additionalInformation,
        actionType: "Initial",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "capitated-amendment",
      capitatedAmendmentBase,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: capitatedAmendmentBase.proposedEffectiveDate,
        additionalInformation: capitatedAmendmentBase.additionalInformation,
        actionType: "Amend",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "capitated-renewal",
      capitatedRenewal,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: capitatedRenewal.proposedEffectiveDate,
        additionalInformation: capitatedRenewal.additionalInformation,
        actionType: "Renew",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "contracting-initial",
      contractingInitial,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: contractingInitial.proposedEffectiveDate,
        additionalInformation: contractingInitial.additionalInformation,
        actionType: "Initial",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "contracting-amendment",
      contractingAmendment,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: contractingAmendment.proposedEffectiveDate,
        additionalInformation: contractingAmendment.additionalInformation,
        actionType: "Amend",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "contracting-renewal",
      contractingRenewal,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: contractingRenewal.proposedEffectiveDate,
        additionalInformation: contractingRenewal.additionalInformation,
        actionType: "Renew",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "new-chip-submission",
      newChipSubmission,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: newChipSubmission.proposedEffectiveDate,
        additionalInformation: newChipSubmission.additionalInformation,
        actionType: "Amend",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "new-medicaid-submission",
      newMedicaidSubmission,
      SEATOOL_STATUS.PENDING,
      {
        proposedDate: newMedicaidSubmission.proposedEffectiveDate,
        additionalInformation: newMedicaidSubmission.additionalInformation,
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "temporary-extension",
      temporaryExtension,
      SEATOOL_STATUS.PENDING,
      {
        originalWaiverNumber: temporaryExtension.waiverNumber,
        additionalInformation: temporaryExtension.additionalInformation,
        actionType: "Extend",
        initialIntakeNeeded: false,
        cmsStatus: "Requested",
        stateStatus: "Submitted",
      } as BulkUpdateRequestBody,
    ],
  ])("should handle valid kafka records for %s", async (_, event, seatoolStatus, expectation) => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            ...event,
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...expectation,
        id: event.id,
        authority: event.authority,
        seatoolStatus,
        cmsStatus: expectation.cmsStatus || statusToDisplayToCmsUser[seatoolStatus],
        stateStatus: expectation.stateStatus || statusToDisplayToStateUser[seatoolStatus],
        changedDate: ISO_DATETIME,
        makoChangedDate: ISO_DATETIME,
        statusDate: offsetToUtc(new Date(TIMESTAMP)).toISOString(),
        submissionDate: ISO_DATETIME,
        state: "VA",
        origin: "OneMAC",
        raiWithdrawEnabled: false,
        description: null,
        subject: null,
        submitterEmail: "george@example.com",
        submitterName: "George Harrison",
      },
    ]);
  });

  it.each([
    ["upload-subsequent-documents", uploadSubsequentDocuments, {}],
    [
      "respond-to-rai",
      respondToRai,
      {
        raiReceivedDate: ISO_DATETIME,
        raiWithdrawEnabled: false,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
        locked: true,
      },
    ],
    [
      "withdraw-rai",
      withdrawRai,
      {
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
        raiWithdrawEnabled: false,
        locked: true,
      },
    ],
    [
      "toggle-withdraw-rai",
      toggleWithdrawRai,
      {
        raiWithdrawEnabled: true,
      },
    ],
    [
      "withdraw-package",
      withdrawPackage,
      {
        seatoolStatus: SEATOOL_STATUS.WITHDRAWN,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.WITHDRAWN],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.WITHDRAWN],
        locked: true,
        finalDispositionDate: ISO_DATETIME,
        initialIntakeNeeded: false,
        raiWithdrawEnabled: false,
      },
    ],
  ])("should handle valid kafka records for %s", async (_, event, expectation) => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            ...event,
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...expectation,
        id: event.id,
        makoChangedDate: ISO_DATETIME,
      },
    ]);
  });

  it("handles valid kafka admin record to update id", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2301",
            isAdminChange: true,
            adminChangeType: "update-id",
            idToBeUpdated: "MD-24-2300",
            changeMade: "ID has been updated.",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: "MD-24-2301",
        isAdminChange: true,
        adminChangeType: "update-id",
        idToBeUpdated: "MD-24-2300",
        changeMade: "ID has been updated.",
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
      },
    ]);
  });

  it("handles valid kafka admin record to update value", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2301",
            isAdminChange: true,
            adminChangeType: "update-values",
            title: "updated title",
            changeMade: "title has been updated.",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: "MD-24-2301",
        isAdminChange: true,
        adminChangeType: "update-values",
        title: "updated title",
        changeMade: "title has been updated.",
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
      },
    ]);
  });

  it("handles valid kafka admin record to delete", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2301",
            isAdminChange: true,
            adminChangeType: "delete",
            deleted: false,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: "MD-24-2301",
        isAdminChange: true,
        adminChangeType: "delete",
        deleted: false,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
      },
    ]);
  });

  it("skips invalid kafka admin records", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2301",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "ID has been updated.",
            isAdminChange: true,
            adminChangeType: "update-id",
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips value-less kafka records", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: "", // <-- missing value
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips kafka records with invalid event name", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          // encoded string with `invalid-event-name` as 'record.event`
          value: convertObjToBase64({
            ...newMedicaidSubmission,
            event: "invalid-event-name",
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips kafka records with invalid properties", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          // encoded string with `attachments` as an empty {}
          value: convertObjToBase64({
            ...newMedicaidSubmission,
            attachments: {},
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips kafka records with invalid JSON", async () => {
    const logErrorSpy = vi.spyOn(sink, "logError");

    await insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: "bunch-of-gibberish",
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toBeCalledWith({
      type: "badparse",
      error: expect.any(Object),
      metadata: expect.any(Object),
    });
  });
});

describe("insertNewSeatoolRecordsFromKafkaIntoMako", () => {
  const TOPIC = "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan";

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("outputs kafka records into mako records", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "John",
                LAST_NAME: "Doe",
                EMAIL: "john.doe@medicaid.gov",
                OFFICER_ID: 12345,
                DEPARTMENT: "State Plan Review",
                PHONE: "202-555-1234",
              },
              {
                FIRST_NAME: "Emily",
                LAST_NAME: "Rodriguez",
                EMAIL: "emily.rodriguez@medicaid.gov",
                OFFICER_ID: 12346,
                DEPARTMENT: "Compliance Division",
                PHONE: "202-555-5678",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Michael",
                LAST_NAME: "Chen",
                EMAIL: "michael.chen@cms.hhs.gov",
                OFFICER_ID: 67890,
                DEPARTMENT: "Medicaid Innovation Center",
                PHONE: "202-555-9012",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 123,
              SPW_STATUS_ID: 4,
              APPROVED_EFFECTIVE_DATE: TIMESTAMP,
              CHANGED_DATE: EARLIER_TIMESTAMP,
              SUMMARY_MEMO: "Sample summary",
              TITLE_NAME: "Sample Title",
              STATUS_DATE: EARLIER_TIMESTAMP,
              SUBMISSION_DATE: TIMESTAMP,
              LEAD_ANALYST_ID: 67890,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "10",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1, PLAN_TYPE_ID: 123 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Initial Review",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Approved",
        description: "Sample summary",
        finalDispositionDate: EARLIER_ISO_DATETIME,
        id: TEST_ITEM_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiReceivedDate: null,
        raiRequestedDate: null,
        raiWithdrawEnabled: false,
        raiWithdrawnDate: null,
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
        seatoolStatus: "Approved",
        secondClock: false,
        state: "10",
        stateStatus: "Approved",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        submissionDate: ISO_DATETIME,
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });

  it("outputs kafka records into mako records if mako record is not found", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: Buffer.from(NOT_FOUND_ITEM_ID).toString("base64"),
          value: convertObjToBase64({
            id: NOT_FOUND_ITEM_ID,
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "John",
                LAST_NAME: "Doe",
                EMAIL: "john.doe@medicaid.gov",
                OFFICER_ID: 12345,
                DEPARTMENT: "State Plan Review",
                PHONE: "202-555-1234",
              },
              {
                FIRST_NAME: "Emily",
                LAST_NAME: "Rodriguez",
                EMAIL: "emily.rodriguez@medicaid.gov",
                OFFICER_ID: 12346,
                DEPARTMENT: "Compliance Division",
                PHONE: "202-555-5678",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Michael",
                LAST_NAME: "Chen",
                EMAIL: "michael.chen@cms.hhs.gov",
                OFFICER_ID: 67890,
                DEPARTMENT: "Medicaid Innovation Center",
                PHONE: "202-555-9012",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 123,
              SPW_STATUS_ID: 4,
              APPROVED_EFFECTIVE_DATE: TIMESTAMP,
              CHANGED_DATE: EARLIER_TIMESTAMP,
              SUMMARY_MEMO: "Sample summary",
              TITLE_NAME: "Sample Title",
              STATUS_DATE: EARLIER_TIMESTAMP,
              SUBMISSION_DATE: TIMESTAMP,
              LEAD_ANALYST_ID: 67890,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "10",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1, PLAN_TYPE_ID: 123 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Initial Review",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Approved",
        description: "Sample summary",
        finalDispositionDate: EARLIER_ISO_DATETIME,
        id: NOT_FOUND_ITEM_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiReceivedDate: null,
        raiRequestedDate: null,
        raiWithdrawEnabled: false,
        raiWithdrawnDate: null,
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
        seatoolStatus: "Approved",
        secondClock: false,
        state: "10",
        stateStatus: "Approved",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        submissionDate: ISO_DATETIME,
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });

  it("outputs kafka records into mako records without changedDates", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: Buffer.from(EXISTING_ITEM_TEMPORARY_EXTENSION_ID).toString("base64"),
          value: convertObjToBase64({
            id: EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "John",
                LAST_NAME: "Doe",
                EMAIL: "john.doe@medicaid.gov",
                OFFICER_ID: 12345,
                DEPARTMENT: "State Plan Review",
                PHONE: "202-555-1234",
              },
              {
                FIRST_NAME: "Emily",
                LAST_NAME: "Rodriguez",
                EMAIL: "emily.rodriguez@medicaid.gov",
                OFFICER_ID: 12346,
                DEPARTMENT: "Compliance Division",
                PHONE: "202-555-5678",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Michael",
                LAST_NAME: "Chen",
                EMAIL: "michael.chen@cms.hhs.gov",
                OFFICER_ID: 67890,
                DEPARTMENT: "Medicaid Innovation Center",
                PHONE: "202-555-9012",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 123,
              SPW_STATUS_ID: 4,
              APPROVED_EFFECTIVE_DATE: TIMESTAMP,
              CHANGED_DATE: EARLIER_TIMESTAMP,
              SUMMARY_MEMO: "Sample summary",
              TITLE_NAME: "Sample Title",
              STATUS_DATE: EARLIER_TIMESTAMP,
              SUBMISSION_DATE: TIMESTAMP,
              LEAD_ANALYST_ID: 67890,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "10",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1, PLAN_TYPE_ID: 123 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Initial Review",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Approved",
        description: "Sample summary",
        finalDispositionDate: EARLIER_ISO_DATETIME,
        id: EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiReceivedDate: null,
        raiRequestedDate: null,
        raiWithdrawEnabled: false,
        raiWithdrawnDate: null,
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
        seatoolStatus: "Approved",
        secondClock: false,
        state: "10",
        stateStatus: "Approved",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        submissionDate: ISO_DATETIME,
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });

  it("handles errors in getting mako timestamps", async () => {
    mockedServer.use(errorMainMultiDocumentHandler);

    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "John",
                LAST_NAME: "Doe",
                EMAIL: "john.doe@medicaid.gov",
                OFFICER_ID: 12345,
                DEPARTMENT: "State Plan Review",
                PHONE: "202-555-1234",
              },
              {
                FIRST_NAME: "Emily",
                LAST_NAME: "Rodriguez",
                EMAIL: "emily.rodriguez@medicaid.gov",
                OFFICER_ID: 12346,
                DEPARTMENT: "Compliance Division",
                PHONE: "202-555-5678",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Michael",
                LAST_NAME: "Chen",
                EMAIL: "michael.chen@cms.hhs.gov",
                OFFICER_ID: 67890,
                DEPARTMENT: "Medicaid Innovation Center",
                PHONE: "202-555-9012",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 123,
              SPW_STATUS_ID: 4,
              APPROVED_EFFECTIVE_DATE: TIMESTAMP,
              CHANGED_DATE: EARLIER_TIMESTAMP,
              SUMMARY_MEMO: "Sample summary",
              TITLE_NAME: "Sample Title",
              STATUS_DATE: EARLIER_TIMESTAMP,
              SUBMISSION_DATE: TIMESTAMP,
              LEAD_ANALYST_ID: 67890,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "10",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1, PLAN_TYPE_ID: 123 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Initial Review",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Approved",
        description: "Sample summary",
        finalDispositionDate: EARLIER_ISO_DATETIME,
        id: TEST_ITEM_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiReceivedDate: null,
        raiRequestedDate: null,
        raiWithdrawEnabled: false,
        raiWithdrawnDate: null,
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
        seatoolStatus: "Approved",
        secondClock: false,
        state: "10",
        stateStatus: "Approved",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        submissionDate: ISO_DATETIME,
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });

  it("skips newer mako records", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "Lisa",
                LAST_NAME: "Thompson",
                EMAIL: "lisa.thompson@medicaid.gov",
                OFFICER_ID: 78901,
                DEPARTMENT: "Rural Health Services",
                PHONE: "202-555-3456",
              },
              {
                FIRST_NAME: "Kevin",
                LAST_NAME: "Anderson",
                EMAIL: "kevin.anderson@medicaid.gov",
                OFFICER_ID: 78902,
                DEPARTMENT: "Financial Planning",
                PHONE: "202-555-7890",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Elizabeth",
                LAST_NAME: "Kim",
                EMAIL: "elizabeth.kim@cms.hhs.gov",
                OFFICER_ID: 23456,
                DEPARTMENT: "Policy Integration",
                PHONE: "202-555-2345",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 121,
              SPW_STATUS_ID: 11,
              APPROVED_EFFECTIVE_DATE: LATER_TIMESTAMP,
              CHANGED_DATE: LATER_TIMESTAMP,
              SUMMARY_MEMO: "1115 Demonstration Waiver Review",
              TITLE_NAME: "WV 1115 Medicaid Demonstration Project",
              STATUS_DATE: LATER_TIMESTAMP,
              SUBMISSION_DATE: LATER_TIMESTAMP,
              LEAD_ANALYST_ID: 23456,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "40",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Pending Approval", ACTION_ID: 4, PLAN_TYPE_ID: 121 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 4, SPA_TYPE_NAME: "Type D" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 4, TYPE_NAME: "SubType W" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("tombstones records with no value property", async () => {
    const tombstoneSpy = vi.spyOn(seatool, "tombstone");

    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: "", // <-- missing value
        }),
      ],
      TOPIC,
    );

    expect(tombstoneSpy).toBeCalledWith(TEST_ITEM_ID);
    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: null,
        approvedEffectiveDate: null,
        authority: null,
        changedDate: null,
        cmsStatus: null,
        description: null,
        finalDispositionDate: null,
        id: TEST_ITEM_ID,
        leadAnalystName: null,
        leadAnalystOfficerId: null,
        proposedDate: null,
        raiReceivedDate: null,
        raiRequestedDate: null,
        raiWithdrawnDate: null,
        reviewTeam: null,
        seatoolStatus: null,
        state: null,
        stateStatus: null,
        statusDate: null,
        subTypes: null,
        subject: null,
        submissionDate: null,
        types: null,
      },
    ]);
  });

  it("skips over records with no key property", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "", // <-- missing key
          value: convertObjToBase64({
            id: "IL-25-3130",
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "Amanda",
                LAST_NAME: "Brown",
                EMAIL: "amanda.brown@medicaid.gov",
                OFFICER_ID: 89012,
                DEPARTMENT: "Strategic Initiatives",
                PHONE: "202-555-5678",
              },
              {
                FIRST_NAME: "Carlos",
                LAST_NAME: "Mendez",
                EMAIL: "carlos.mendez@medicaid.gov",
                OFFICER_ID: 89013,
                DEPARTMENT: "Program Evaluation",
                PHONE: "202-555-8901",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Daniel",
                LAST_NAME: "Park",
                EMAIL: "daniel.park@cms.hhs.gov",
                OFFICER_ID: 34567,
                DEPARTMENT: "Innovative Solutions",
                PHONE: "202-555-3456",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 124,
              SPW_STATUS_ID: 10,
              APPROVED_EFFECTIVE_DATE: 1740624000000,
              CHANGED_DATE: 1740624000000,
              SUMMARY_MEMO: "CHIP State Plan Amendment Review",
              TITLE_NAME: "IL CHIP Program Financial Strategy",
              STATUS_DATE: 1740537600000,
              SUBMISSION_DATE: 1740624000000,
              LEAD_ANALYST_ID: 34567,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "50",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Financial Review", ACTION_ID: 5, PLAN_TYPE_ID: 124 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 5, SPA_TYPE_NAME: "Type E" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 5, TYPE_NAME: "SubType V" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips over records with invalid properties", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "V1YtMjQtMzIzMA==",
          // value is invalid JSON
          value: "bunch-of-gibberish",
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toBeCalledWith({
      type: "badparse",
      metadata: expect.any(Object),
      error: expect.any(Object),
    });
  });

  it("skips over records with seatoolStatus:'Unknown' || authority: null property values", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "John",
                LAST_NAME: "Doe",
                EMAIL: "john.doe@medicaid.gov",
                OFFICER_ID: 12345,
                DEPARTMENT: "State Plan Review",
                PHONE: "202-555-1234",
              },
              {
                FIRST_NAME: "Emily",
                LAST_NAME: "Rodriguez",
                EMAIL: "emily.rodriguez@medicaid.gov",
                OFFICER_ID: 12346,
                DEPARTMENT: "Compliance Division",
                PHONE: "202-555-5678",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Michael",
                LAST_NAME: "Chen",
                EMAIL: "michael.chen@cms.hhs.gov",
                OFFICER_ID: 67890,
                DEPARTMENT: "Medicaid Innovation Center",
                PHONE: "202-555-9012",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 999,
              SPW_STATUS_ID: 999,
              APPROVED_EFFECTIVE_DATE: 1707088356000,
              CHANGED_DATE: 1704163200000,
              SUMMARY_MEMO: "Sample summary",
              TITLE_NAME: "Sample Title",
              STATUS_DATE: 1704240000000,
              SUBMISSION_DATE: 1704326400000,
              LEAD_ANALYST_ID: 67890,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "10",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1, PLAN_TYPE_ID: 123 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips over records that fail SEATOOL safeParse", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            ACTION_OFFICERS: [
              {
                FIRST_NAME: "John",
                LAST_NAME: "Doe",
                EMAIL: "john.doe@medicaid.gov",
                OFFICER_ID: 12345,
                DEPARTMENT: "State Plan Review",
                PHONE: "202-555-1234",
              },
              {
                FIRST_NAME: "Emily",
                LAST_NAME: "Rodriguez",
                EMAIL: "emily.rodriguez@medicaid.gov",
                OFFICER_ID: 12346,
                DEPARTMENT: "Compliance Division",
                PHONE: "202-555-5678",
              },
            ],
            LEAD_ANALYST: [
              {
                FIRST_NAME: "Michael",
                LAST_NAME: "Chen",
                EMAIL: "michael.chen@cms.hhs.gov",
                OFFICER_ID: 67890,
                DEPARTMENT: "Medicaid Innovation Center",
                PHONE: "202-555-9012",
              },
            ],
            STATE_PLAN: {
              PLAN_TYPE: 123,
              SPW_STATUS_ID: 4,
              APPROVED_EFFECTIVE_DATE: 1707088356000,
              CHANGED_DATE: 1704163200000,
              SUMMARY_MEMO: "Sample summary",
              TITLE_NAME: "Sample Title",
              STATUS_DATE: 1704240000000,
              SUBMISSION_DATE: 1704326400000,
              LEAD_ANALYST_ID: 67890,
              ACTUAL_EFFECTIVE_DATE: null,
              PROPOSED_DATE: null,
              STATE_CODE: "10",
            },
            RAI: [],
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toBeCalledWith({
      type: "validation",
      metadata: expect.any(Object),
      error: expect.any(Array),
    });
  });
});

describe("syncSeatoolRecordDatesFromKafkaWithMako", () => {
  const TOPIC = "--mako--branch-name--aws.seatool.debezium.changed_date.SEA.dbo.State_Plan";

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("processes a valid date change to mako", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            payload: { after: { ID_Number: "12345", Changed_Date: LATER_TIMESTAMP } },
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        changedDate: LATER_ISO_DATETIME,
        id: "12345",
      },
    ]);
  });

  it("processes a date change that is null to mako", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            payload: { after: { ID_Number: "67890", Changed_Date: null } },
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        changedDate: null,
        id: "67890",
      },
    ]);
  });

  it("skips records with no value property", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: "",
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips payloads that are null or undefined", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({ payload: { after: null } }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);

    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            payload: {
              after: undefined,
            },
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("skips payloads with missing Id property", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          // missing required Id property
          value: convertObjToBase64({ payload: { after: { Changed_Date: LATER_TIMESTAMP } } }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toBeCalledWith({
      type: "validation",
      error: expect.any(Object),
      metadata: expect.any(Object),
    });
  });

  it("skips payloads with invalid JSON", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: TEST_ITEM_KEY,
          value: "bunch-of-gibberish",
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toBeCalledWith({
      type: "badparse",
      error: expect.any(Object),
      metadata: expect.any(Object),
    });
  });
});
