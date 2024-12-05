import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  insertNewSeatoolRecordsFromKafkaIntoMako,
  insertOneMacRecordsFromKafkaIntoMako,
  syncSeatoolRecordDatesFromKafkaWithMako,
} from "./sinkMainProcessors";
import * as sinkLib from "libs";
import { Document, seatool } from "shared-types/opensearch/main";
import { offsetToUtc } from "shared-utils";

const convertObjToBase64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64");

describe("insertOneMacRecordsFromKafkaIntoMako", () => {
  const spiedOnBulkUpdateDataWrapper = vi.fn();
  const TOPIC = "--mako--branch-name--aws.onemac.migration.cdc";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.spyOn(sinkLib, "bulkUpdateDataWrapper").mockImplementation(spiedOnBulkUpdateDataWrapper);
    vi.stubEnv("osDomain", "osDomain");
    vi.stubEnv("indexNamespace", "indexNamespace");
  });

  it("handles valid kafka records", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            event: "new-medicaid-submission",
            attachments: {
              cmsForm179: {
                files: [
                  {
                    filename: "Screenshot 2024-07-08 at 11.42.35 AM.png",
                    title: "Screenshot 2024-07-08 at 11.42.35 AM",
                    bucket: "mako-refactor-tests-sink-attachments-635052997545",
                    key: "13513eea-ba62-4cba-af31-2ec3c160b5e1.png",
                    uploadDate: 1732645033529,
                  },
                ],
                label: "CMS Form 179",
              },
              spaPages: {
                files: [
                  {
                    filename: "Screenshot 2024-07-08 at 11.42.35 AM.png",
                    title: "Screenshot 2024-07-08 at 11.42.35 AM",
                    bucket: "mako-refactor-tests-sink-attachments-635052997545",
                    key: "bbdfa95f-f67c-4983-8517-2745cc08d3b6.png",
                    uploadDate: 1732645038805,
                  },
                ],
                label: "SPA Pages",
              },
              coverLetter: { label: "Cover Letter" },
              tribalEngagement: { label: "Document Demonstrating Good-Faith Tribal Engagement" },
              existingStatePlanPages: { label: "Existing State Plan Page(s)" },
              publicNotice: { label: "Public Notice" },
              sfq: { label: "Standard Funding Questions (SFQs)" },
              tribalConsultation: { label: "Tribal Consultation" },
              other: { label: "Other" },
            },
            authority: "Medicaid SPA",
            proposedEffectiveDate: 1732597200000,
            id: "MD-24-2300",
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: 1732645041526,
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          additionalInformation: undefined,
          authority: "Medicaid SPA",
          changedDate: "2024-11-26T18:17:21.526Z",
          cmsStatus: "Pending",
          description: null,
          id: "MD-24-2300",
          makoChangedDate: "2024-11-26T18:17:21.526Z",
          origin: "OneMAC",
          raiWithdrawEnabled: false,
          seatoolStatus: "Pending",
          state: "MD",
          stateStatus: "Under Review",
          statusDate: offsetToUtc(new Date(1732645041526)).toISOString(),
          proposedDate: 1732597200000,
          subject: null,
          submissionDate: "2024-11-26T00:00:00.000Z",
          submitterEmail: "george@example.com",
          submitterName: "George Harrison",
          initialIntakeNeeded: true,
        },
      ],
      "main",
    );
  });

  it("skips value-less kafka records", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: "", // <-- missing value
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid event name", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          // encoded string with `invalid-event-name` as 'record.event`
          value: convertObjToBase64({
            event: "invalid-event-name",
            attachments: {
              cmsForm179: {
                files: [
                  {
                    filename: "Screenshot 2024-07-08 at 11.42.35 AM.png",
                    title: "Screenshot 2024-07-08 at 11.42.35 AM",
                    bucket: "mako-refactor-tests-sink-attachments-635052997545",
                    key: "13513eea-ba62-4cba-af31-2ec3c160b5e1.png",
                    uploadDate: 1732645033529,
                  },
                ],
                label: "CMS Form 179",
              },
              spaPages: {
                files: [
                  {
                    filename: "Screenshot 2024-07-08 at 11.42.35 AM.png",
                    title: "Screenshot 2024-07-08 at 11.42.35 AM",
                    bucket: "mako-refactor-tests-sink-attachments-635052997545",
                    key: "bbdfa95f-f67c-4983-8517-2745cc08d3b6.png",
                    uploadDate: 1732645038805,
                  },
                ],
                label: "SPA Pages",
              },
              coverLetter: { label: "Cover Letter" },
              tribalEngagement: { label: "Document Demonstrating Good-Faith Tribal Engagement" },
              existingStatePlanPages: { label: "Existing State Plan Page(s)" },
              publicNotice: { label: "Public Notice" },
              sfq: { label: "Standard Funding Questions (SFQs)" },
              tribalConsultation: { label: "Tribal Consultation" },
              other: { label: "Other" },
            },
            authority: "Medicaid SPA",
            proposedEffectiveDate: 1732597200000,
            id: "MD-24-2300",
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: 1732645041526,
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid properties", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          // encoded string with `attachments` as an empty {}
          value: convertObjToBase64({
            event: "new-medicaid-submission",
            attachments: {},
            authority: "Medicaid SPA",
            proposedEffectiveDate: 1732597200000,
            id: "MD-24-2300",
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: 1732645041526,
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid JSON", () => {
    const spiedOnLogError = vi.spyOn(sinkLib, "logError").mockImplementation(vi.fn());

    insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 0,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: "bunch-of-gibberish",
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "badparse",
      error: expect.any(Object),
      metadata: expect.any(Object),
    });
  });
});

describe("insertNewSeatoolRecordsFromKafkaIntoMako", () => {
  // @ts-expect-error – cannot bother typing out unnecessary Document properties
  const spiedOnGetItems = vi.fn<() => Promise<Document[]>>(() =>
    Promise.resolve([
      {
        id: "MD-24-2300",
        changedDate: "2024-02-04 23:12:36",
      },
      {
        id: "WA-22-2100",
        changedDate: "2024-06-12 13:24:43",
      },
      {
        id: "NY-23-2200",
        changedDate: "2024-10-12 09:04:52",
      },
      {
        id: "WV-24-3230",
        changedDate: "2024-03-21 09:51:23",
      },
      {
        id: "IL-25-3130",
        changedDate: "2025-03-21 17:51:23",
      },
    ]),
  );
  const spiedOnBulkUpdateDataWrapper = vi.fn();
  const spiedOnLogError = vi.fn();
  const TOPIC = "--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(sinkLib, "getItems").mockImplementation(spiedOnGetItems);
    vi.spyOn(sinkLib, "bulkUpdateDataWrapper").mockImplementation(spiedOnBulkUpdateDataWrapper);
    vi.spyOn(sinkLib, "logError").mockImplementation(spiedOnLogError);

    vi.stubEnv("osDomain", "osDomain");
    vi.stubEnv("indexNamespace", "indexNamespace");
  });

  it("outputs kafka records into mako records", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2300",
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
            ACTIONTYPES: [{ ACTION_NAME: "Initial Review", ACTION_ID: 1, PLAN_TYPE_ID: 123 }],
            STATE_PLAN_SERVICETYPES: [{ SPA_TYPE_ID: 1, SPA_TYPE_NAME: "Type A" }],
            STATE_PLAN_SERVICE_SUBTYPES: [{ TYPE_ID: 1, TYPE_NAME: "SubType X" }],
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          actionType: "Initial Review",
          approvedEffectiveDate: "2024-02-04T23:12:36.000Z",
          authority: "1915(c)",
          changed_date: 1704163200000,
          cmsStatus: "Approved",
          description: "Sample summary",
          finalDispositionDate: "2024-01-03T00:00:00.000Z",
          id: "MD-24-2300",
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
          statusDate: "2024-01-03T00:00:00.000Z",
          subTypes: [
            {
              TYPE_ID: 1,
              TYPE_NAME: "SubType X",
            },
          ],
          subject: "Sample Title",
          submissionDate: "2024-01-04T00:00:00.000Z",
          types: [
            {
              SPA_TYPE_ID: 1,
              SPA_TYPE_NAME: "Type A",
            },
          ],
        },
      ],
      "main",
    );
  });

  it("skips newer mako records", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "V1YtMjQtMzIzMA==",
          value: convertObjToBase64({
            id: "WV-24-3230",
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
              APPROVED_EFFECTIVE_DATE: 1711065600000,
              CHANGED_DATE: 1711065600000,
              SUMMARY_MEMO: "1115 Demonstration Waiver Review",
              TITLE_NAME: "WV 1115 Medicaid Demonstration Project",
              STATUS_DATE: 1710979200000,
              SUBMISSION_DATE: 1711065600000,
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
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("tombstones records with no value property", async () => {
    const spiedOnTombstone = vi.spyOn(seatool, "tombstone");

    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TlktMjMtMjIwMA==",
          value: "", // <-- missing value
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnTombstone).toBeCalledWith("NY-23-2200");
    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          actionType: null,
          approvedEffectiveDate: null,
          authority: null,
          changedDate: null,
          cmsStatus: null,
          description: null,
          finalDispositionDate: null,
          id: "NY-23-2200",
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
      ],
      "main",
    );
  });

  it("skips over records with no key property", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
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
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips over records with invalid properties", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "V1YtMjQtMzIzMA==",
          // value is invalid JSON
          value: "bunch-of-gibberish",
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "badparse",
      metadata: expect.any(Object),
      error: expect.any(Object),
    });
  });

  it("skips over records with seatoolStatus:'Unknown' || authority: null property values", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2300",
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
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips over records that fail SEATOOL safeParse", async () => {
    await insertNewSeatoolRecordsFromKafkaIntoMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
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
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "validation",
      metadata: expect.any(Object),
      error: expect.any(Array),
    });
  });
});

describe("syncSeatoolRecordDatesFromKafkaWithMako", () => {
  const spiedOnBulkUpdateDataWrapper = vi.fn();
  const spiedOnLogError = vi.fn();

  const TOPIC = "--mako--branch-name--aws.seatool.debezium.changed_date.SEA.dbo.State_Plan";

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(sinkLib, "bulkUpdateDataWrapper").mockImplementation(spiedOnBulkUpdateDataWrapper);
    vi.spyOn(sinkLib, "logError").mockImplementation(spiedOnLogError);

    vi.stubEnv("osDomain", "osDomain");
    vi.stubEnv("indexNamespace", "indexNamespace");
  });

  it("processes a valid date change to mako", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            payload: { after: { ID_Number: "12345", Changed_Date: 1672531200000 } },
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          changedDate: "2023-01-01T00:00:00.000Z",
          id: "12345",
        },
      ],
      "main",
    );
  });

  it("processes a date change that's null to mako", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            payload: { after: { ID_Number: "67890", Changed_Date: null } },
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        {
          changedDate: null,
          id: "67890",
        },
      ],
      "main",
    );
  });

  it("skips records with no value property", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: "",
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips payloads that're null or undefined", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({ payload: { after: null } }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");

    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            payload: {
              after: undefined,
            },
          }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips payloads with missing Id property", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          // missing required Id property
          value: convertObjToBase64({ payload: { after: { Changed_Date: 1672531200000 } } }),
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "validation",
      error: expect.any(Object),
      metadata: expect.any(Object),
    });
  });

  it("skips payloads with invalid JSON", async () => {
    await syncSeatoolRecordDatesFromKafkaWithMako(
      [
        {
          topic: TOPIC,
          partition: 0,
          offset: 5,
          timestamp: 1732645041557,
          timestampType: "CREATE_TIME",
          key: "TUQtMjQtMjMwMA==",
          value: "bunch-of-gibberish",
          headers: {},
        },
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
    expect(spiedOnLogError).toBeCalledWith({
      type: "badparse",
      error: expect.any(Object),
      metadata: expect.any(Object),
    });
  });
});
