import { UTCDate } from "@date-fns/utc";
import { startOfDay } from "date-fns";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import {
  convertObjToBase64,
  createKafkaRecord,
  errorOSMainMultiDocumentHandler,
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
  NOT_FOUND_ITEM_ID,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  RAI_WITHDRAWAL_ID,
  SUBMITTED_RAI_ID,
  TEST_ITEM_ID,
  WITHDRAWAL_REQUESTED_ID,
} from "mocks";
import {
  appkBase,
  capitatedAmendmentBase,
  capitatedInitial,
  capitatedRenewal,
  contractingAmendment,
  contractingInitial,
  contractingRenewal,
  newChipSubmission,
  newMedicaidSubmission,
  respondToRai,
  temporaryExtension,
  toggleWithdrawRai,
  uploadSubsequentDocuments,
  withdrawPackage,
  withdrawRai,
} from "mocks/data/submit/base";
import { mockedServiceServer as mockedServer } from "mocks/server";
import {
  SEATOOL_STATUS,
  SeatoolSpwStatusEnum,
  statusToDisplayToCmsUser,
  statusToDisplayToStateUser,
} from "shared-types";
import { seatool } from "shared-types/opensearch/main";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  insertNewSeatoolRecordsFromKafkaIntoMako,
  insertOneMacRecordsFromKafkaIntoMako,
  syncSeatoolRecordDatesFromKafkaWithMako,
} from "./sinkMainProcessors";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}main`;
const TEST_ITEM_KEY = Buffer.from(TEST_ITEM_ID).toString("base64");
const WITHDRAWAL_REQUESTED_KEY = Buffer.from(WITHDRAWAL_REQUESTED_ID).toString("base64");
const SUBMITTED_RAI_KEY = Buffer.from(SUBMITTED_RAI_ID).toString("base64");
const RAI_WITHDRAWAL_KEY = Buffer.from(RAI_WITHDRAWAL_ID).toString("base64");
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
      SEATOOL_STATUS.SUBMITTED,
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
      SEATOOL_STATUS.SUBMITTED,
      {
        proposedDate: capitatedInitial.proposedEffectiveDate,
        additionalInformation: capitatedInitial.additionalInformation,
        actionType: "New",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "capitated-amendment",
      capitatedAmendmentBase,
      SEATOOL_STATUS.SUBMITTED,
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
      SEATOOL_STATUS.SUBMITTED,
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
      SEATOOL_STATUS.SUBMITTED,
      {
        proposedDate: contractingInitial.proposedEffectiveDate,
        additionalInformation: contractingInitial.additionalInformation,
        actionType: "New",
        initialIntakeNeeded: true,
      } as BulkUpdateRequestBody,
    ],
    [
      "contracting-amendment",
      contractingAmendment,
      SEATOOL_STATUS.SUBMITTED,
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
      SEATOOL_STATUS.SUBMITTED,
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
      SEATOOL_STATUS.SUBMITTED,
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
      SEATOOL_STATUS.SUBMITTED,
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
        statusDate: startOfDay(new UTCDate(TIMESTAMP)).toISOString(),
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
        authority: "Medicaid SPA",
        raiReceivedDate: ISO_DATETIME,
        raiWithdrawEnabled: false,
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.SUBMITTED],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.SUBMITTED],
        initialIntakeNeeded: true,
        locked: true,
      },
    ],
    [
      "withdraw-rai",
      withdrawRai,
      {
        raiReceivedDate: null,
        seatoolStatus: SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED],
        secondClock: false,
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
        seatoolStatus: SEATOOL_STATUS.WITHDRAW_REQUESTED,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
        locked: true,
        secondClock: false,
        initialIntakeNeeded: true,
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
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
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
        makoChangedDate: TIMESTAMP,
        changedDate: TIMESTAMP,
        statusDate: TIMESTAMP,
        timestamp: TIMESTAMP,
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
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
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
        makoChangedDate: TIMESTAMP,
        changedDate: TIMESTAMP,
        statusDate: TIMESTAMP,
        timestamp: TIMESTAMP,
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
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
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
        makoChangedDate: TIMESTAMP,
        changedDate: TIMESTAMP,
        statusDate: TIMESTAMP,
        timestamp: TIMESTAMP,
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
  const TEST_TITLE = "Test Title";
  it.each([
    ["medicaidspa", "Medicaid SPA", {}, {}],
    ["chipspa", "CHIP SPA", {}, {}],
    ["waivernew", "1915(b)", {}, { actionType: "New" }],
    ["waiverrenewal", "1915(b)", {}, { actionType: "Renew" }],
    ["waiveramendment", "1915(b)", {}, { actionType: "Amend" }],
    ["waiverappk", "1915(c)", { title: TEST_TITLE }, { actionType: "Amend", title: TEST_TITLE }],
    // For waiverextension types, add a waiverNumber and override currentStatus.
    [
      "waiverextension",
      "1915(b)",
      { parentId: "W-12345" },
      {
        originalWaiverNumber: "W-12345",
        actionType: "Extend",
        cmsStatus: "Requested",
        stateStatus: "Submitted",
        currentStatus: "TE Requested",
        seatoolStatus: "Submitted",
        state: "MD",
      },
    ],
    [
      "waiverextensionb",
      "1915(b)",
      { parentId: "W-12345" },
      {
        originalWaiverNumber: "W-12345",
        actionType: "Extend",
        cmsStatus: "Requested",
        stateStatus: "Submitted",
        currentStatus: "TE Requested",
        seatoolStatus: "Submitted",
        state: "MD",
      },
    ],
    [
      "waiverextensionc",
      "1915(b)",
      { parentId: "W-12345" },
      {
        originalWaiverNumber: "W-12345",
        actionType: "Extend",
        cmsStatus: "Requested",
        stateStatus: "Submitted",
        currentStatus: "TE Requested",
        seatoolStatus: "Submitted",
        state: "MD",
      },
    ],
  ])(
    "should process a valid legacy record for %s",
    async (componentType, expectedAuthority, extraInput, expectedExtras) => {
      const record = {
        pk: "MD-12345", // This will yield state "MD"
        sk: "Package",
        GSI1pk: "OneMAC#spa",
        componentId: "MD-12345",
        additionalInformation: "info",
        lastEventTimestamp: TIMESTAMP,
        submissionTimestamp: TIMESTAMP,
        proposedEffectiveDate: "2025-03-10T00:00:00Z",
        submitterEmail: "tester@example.com",
        submitterName: "Tester",
        currentStatus: "Submitted",
        componentType,
        ...(componentType.startsWith("waiverextension") ? { currentStatus: "TE Requested" } : {}),
        ...extraInput,
      };

      const kafkaRecord = createKafkaRecord({
        topic: TOPIC,
        key: "some-key",
        value: convertObjToBase64({
          ...record,
          origin: "OneMACLegacy",
          submitterName: "Tester",
          submitterEmail: "tester@example.com",
          timestamp: TIMESTAMP,
        }),
        headers: [{ source: [111, 110, 101, 109, 97, 99] }], // "onemac"
      });

      await insertOneMacRecordsFromKafkaIntoMako([kafkaRecord], TOPIC);

      // Build the expected transformation
      const expectedRecord = {
        pk: "MD-12345",
        GSI1pk: "OneMAC#spa",
        componentId: "MD-12345",
        authority: expectedAuthority,
        additionalInformation: "info",
        lastEventTimestamp: TIMESTAMP,
        submissionTimestamp: TIMESTAMP,
        proposedEffectiveDate: null,
        currentStatus: "Submitted",
        changedDate: new Date(TIMESTAMP).toISOString(),
        id: "MD-12345",
        makoChangedDate: new Date(TIMESTAMP).toISOString(),
        state: "MD",
        origin: "OneMACLegacy",
        proposedDate: "2025-03-10T00:00:00Z",
        submissionDate: new Date(TIMESTAMP).toISOString(),
        submitterEmail: "tester@example.com",
        submitterName: "Tester",
        initialIntakeNeeded: true,
        raiWithdrawEnabled: false,
        raiReceivedDate: null,
        cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.SUBMITTED],
        stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.SUBMITTED],
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        statusDate: new Date(TIMESTAMP).toISOString(),
        ...expectedExtras,
      };

      expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
        expectedRecord,
      ]);
    },
  );
  it("should set date fields to null for legacy records when timestamps are 0", async () => {
    const record = {
      pk: "MD-00000",
      sk: "Package",
      GSI1pk: "OneMAC#spa",
      componentId: "MD-00000",
      additionalInformation: "info",
      lastEventTimestamp: 0,
      submissionTimestamp: 0,
      proposedEffectiveDate: "2025-03-10T00:00:00Z",
      submitterEmail: "tester@example.com",
      submitterName: "Tester",
      currentStatus: "Submitted",
      subStatus: "Normal",
      componentType: "medicaidspa",
    };

    const kafkaRecord = createKafkaRecord({
      topic: TOPIC,
      key: "some-key",
      value: convertObjToBase64({
        ...record,
        origin: "OneMACLegacy",
        submitterName: "Tester",
        submitterEmail: "tester@example.com",
        timestamp: TIMESTAMP,
      }),
      headers: [{ source: [111, 110, 101, 109, 97, 99] }], // "onemac"
    });

    await insertOneMacRecordsFromKafkaIntoMako([kafkaRecord], TOPIC);

    const expectedRecord = {
      additionalInformation: "info",
      changedDate: null, // due to lastEventTimestamp === 0
      id: "MD-00000",
      makoChangedDate: null, // due to lastEventTimestamp === 0
      origin: "OneMACLegacy",
      proposedDate: "2025-03-10T00:00:00Z",
      submissionDate: null, // due to submissionTimestamp === 0
      submitterEmail: "tester@example.com",
      submitterName: "Tester",
      initialIntakeNeeded: true,
      authority: "Medicaid SPA", // as defined in medicaid-spa transform
      cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.SUBMITTED],
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      state: "MD",
      stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.SUBMITTED],
      statusDate: null, // due to lastEventTimestamp === 0
    };

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      expect.objectContaining(expectedRecord),
    ]);
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
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });
  it("Fails to add kafka record missing memo", async () => {
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
              SPW_STATUS_ID: 1,
              APPROVED_EFFECTIVE_DATE: TIMESTAMP,
              CHANGED_DATE: EARLIER_TIMESTAMP,
              SUMMARY_MEMO: null,
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

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });
  it("Fails to add kafka record missing title", async () => {
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
              SPW_STATUS_ID: 1,
              APPROVED_EFFECTIVE_DATE: TIMESTAMP,
              CHANGED_DATE: EARLIER_TIMESTAMP,
              SUMMARY_MEMO: "Sample memo",
              TITLE_NAME: null,
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

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
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
    mockedServer.use(errorOSMainMultiDocumentHandler);

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

  it("tries to update a package with withdrawal requested", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: WITHDRAWAL_REQUESTED_KEY,
          value: convertObjToBase64({
            id: WITHDRAWAL_REQUESTED_ID,
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
        cmsStatus: "Submitted - Intake Needed",
        description: "Sample summary",
        finalDispositionDate: null,
        id: WITHDRAWAL_REQUESTED_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiRequestedDate: null,
        raiWithdrawEnabled: undefined,
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
        seatoolStatus: "Withdrawal Requested",
        secondClock: false,
        state: "10",
        stateStatus: "Withdrawal Requested",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });
  it("tries to tries to update a  package that already responded to an rai", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: SUBMITTED_RAI_KEY,
          value: convertObjToBase64({
            id: SUBMITTED_RAI_ID,
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
              SPW_STATUS_ID: SeatoolSpwStatusEnum.PendingRAI,
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
            RAI: [
              {
                RAI_RECEIVED_DATE: null,
                RAI_REQUESTED_DATE: 1675123200000,
                RAI_WITHDRAWN_DATE: null,
              },
            ],
            ACTIONTYPES: [
              { ACTION_NAME: "Respond to Formal RAI", ACTION_ID: 1, PLAN_TYPE_ID: 123 },
            ],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Respond to Formal RAI",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Submitted - Intake Needed",
        description: "Sample summary",
        finalDispositionDate: null,
        id: SUBMITTED_RAI_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiRequestedDate: "2023-01-31T00:00:00.000Z",
        raiWithdrawEnabled: undefined,
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
        seatoolStatus: "Submitted",
        secondClock: false,
        state: "10",
        stateStatus: "Submitted",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });
  it("tries to tries to update a  package that requested a RAI to be withdrawn", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: RAI_WITHDRAWAL_KEY,
          value: convertObjToBase64({
            id: RAI_WITHDRAWAL_ID,
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
              SPW_STATUS_ID: SeatoolSpwStatusEnum.Pending,
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
            RAI: [
              {
                RAI_RECEIVED_DATE: null,
                RAI_REQUESTED_DATE: 1675123200000,
                RAI_WITHDRAWN_DATE: null,
              },
            ],
            ACTIONTYPES: [
              { ACTION_NAME: "Respond to Formal RAI", ACTION_ID: 1, PLAN_TYPE_ID: 123 },
            ],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Respond to Formal RAI",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Formal RAI Response - Withdrawal Requested",
        description: "Sample summary",
        finalDispositionDate: null,
        id: RAI_WITHDRAWAL_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiRequestedDate: "2023-01-31T00:00:00.000Z",
        raiWithdrawEnabled: undefined,
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
        seatoolStatus: "Formal RAI Response - Withdrawal Requested",
        secondClock: false,
        state: "10",
        stateStatus: "Formal RAI Response - Withdrawal Requested",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });
  it("tries to tries to update a  package that requested a RAI to be withdrawn but was terminated", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: RAI_WITHDRAWAL_KEY,
          value: convertObjToBase64({
            id: RAI_WITHDRAWAL_ID,
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
              SPW_STATUS_ID: SeatoolSpwStatusEnum.Disapproved,
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
            RAI: [
              {
                RAI_RECEIVED_DATE: null,
                RAI_REQUESTED_DATE: 1675123200000,
                RAI_WITHDRAWN_DATE: null,
              },
            ],
            ACTIONTYPES: [
              { ACTION_NAME: "Respond to Formal RAI", ACTION_ID: 1, PLAN_TYPE_ID: 123 },
            ],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Respond to Formal RAI",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Disapproved",
        description: "Sample summary",
        finalDispositionDate: "2024-08-03T00:30:41.557Z",
        id: RAI_WITHDRAWAL_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiRequestedDate: "2023-01-31T00:00:00.000Z",
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
        seatoolStatus: "Disapproved",
        secondClock: false,
        state: "10",
        stateStatus: "Disapproved",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });
  it("tries to tries to update a  package that requested a RAI to be withdrawn but was withdrawn completely", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: RAI_WITHDRAWAL_KEY,
          value: convertObjToBase64({
            id: RAI_WITHDRAWAL_ID,
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
              SPW_STATUS_ID: SeatoolSpwStatusEnum.Withdrawn,
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
            RAI: [
              {
                RAI_RECEIVED_DATE: null,
                RAI_REQUESTED_DATE: 1675123200000,
                RAI_WITHDRAWN_DATE: null,
              },
            ],
            ACTIONTYPES: [
              { ACTION_NAME: "Respond to Formal RAI", ACTION_ID: 1, PLAN_TYPE_ID: 123 },
            ],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Respond to Formal RAI",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Package Withdrawn",
        description: "Sample summary",
        finalDispositionDate: "2024-08-03T00:30:41.557Z",
        id: RAI_WITHDRAWAL_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiRequestedDate: "2023-01-31T00:00:00.000Z",
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
        seatoolStatus: "Withdrawn",
        secondClock: false,
        state: "10",
        stateStatus: "Package Withdrawn",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
  });
  it("tries to tries to update a  package that requested a RAI to be withdrawn but was terminated", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: RAI_WITHDRAWAL_KEY,
          value: convertObjToBase64({
            id: RAI_WITHDRAWAL_ID,
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
              SPW_STATUS_ID: SeatoolSpwStatusEnum.Terminated,
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
            RAI: [
              {
                RAI_RECEIVED_DATE: null,
                RAI_REQUESTED_DATE: 1675123200000,
                RAI_WITHDRAWN_DATE: null,
              },
            ],
            ACTIONTYPES: [
              { ACTION_NAME: "Respond to Formal RAI", ACTION_ID: 1, PLAN_TYPE_ID: 123 },
            ],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
        }),
      ],
      TOPIC,
    );

    expect(bulkUpdateDataSpy).toBeCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        actionType: "Respond to Formal RAI",
        approvedEffectiveDate: ISO_DATETIME,
        authority: "1915(c)",
        changed_date: EARLIER_TIMESTAMP,
        cmsStatus: "Terminated",
        description: "Sample summary",
        finalDispositionDate: "2024-08-03T00:30:41.557Z",
        id: RAI_WITHDRAWAL_ID,
        initialIntakeNeeded: false,
        leadAnalystEmail: "michael.chen@cms.hhs.gov",
        leadAnalystName: "Michael Chen",
        leadAnalystOfficerId: 67890,
        locked: false,
        proposedDate: null,
        raiRequestedDate: "2023-01-31T00:00:00.000Z",
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
        seatoolStatus: "Terminated",
        secondClock: false,
        state: "10",
        stateStatus: "Terminated",
        statusDate: EARLIER_ISO_DATETIME,
        subTypes: [
          {
            TYPE_ID: 1,
            TYPE_NAME: "SubType X",
          },
        ],
        subject: "Sample Title",
        types: [
          {
            SPA_TYPE_ID: 1,
            SPA_TYPE_NAME: "Type A",
          },
        ],
      },
    ]);
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
