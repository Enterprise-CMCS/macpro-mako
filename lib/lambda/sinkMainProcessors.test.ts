import { describe, it, expect, vi } from "vitest";
import { insertOneMacRecordsFromKafkaIntoMako } from "../sinkMainProcessors";

vi.mock("../../libs/sink-lib", () => {
  return {
    logError: vi.fn(),
    bulkUpdateDataWrapper: vi.fn(() => Promise.resolve())
  };
});

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
        createKafkaRecord({
          topic: TOPIC,
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
        }),
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

  it("handles valid kafka admin records", () => {
    insertOneMacRecordsFromKafkaIntoMako(
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
            idToBeUpdated: "MD-24-2300",
          }),
        }),
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2301",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "title has been updated.",
            isAdminChange: true,
            adminChangeType: "update-values",
            title: "updated title",
          }),
        }),
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: convertObjToBase64({
            id: "MD-24-2301",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            isAdminChange: true,
            adminChangeType: "delete",
            deleted: true,
          }),
        }),
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith(
      [
        // record deleted
        {
          id: "MD-24-2301",
          submitterName: "George Harrison",
          submitterEmail: "george@example.com",
          changeMade: "ID has been updated.",
          isAdminChange: true,
          adminChangeType: "update-id",
          idToBeUpdated: "MD-24-2300",
        },
        // property updated
        {
          id: "MD-24-2301",
          submitterName: "George Harrison",
          submitterEmail: "george@example.com",
          changeMade: "title has been updated.",
          isAdminChange: true,
          adminChangeType: "update-values",
          title: "updated title",
        },
        // id updated
        {
          id: "MD-24-2301",
          submitterName: "George Harrison",
          submitterEmail: "george@example.com",
          isAdminChange: true,
          adminChangeType: "delete",
          deleted: true,
        },
      ],
      "main",
    );
  });

  it("skips value-less kafka records", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: "", // <-- missing value
        }),
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid event name", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
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
        }),
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid properties", () => {
    insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
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
        }),
      ],
      TOPIC,
    );

    expect(spiedOnBulkUpdateDataWrapper).toBeCalledWith([], "main");
  });

  it("skips kafka records with invalid JSON", () => {
    const spiedOnLogError = vi.spyOn(sinkLib, "logError").mockImplementation(vi.fn());

    insertOneMacRecordsFromKafkaIntoMako(
      [
        createKafkaRecord({
          topic: TOPIC,
          key: "TUQtMjQtMjMwMA==",
          value: "bunch-of-gibberish",
        }),
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
        key: "abc",
        value: "",
        timestamp: Date.now(),
        offset: 0,
        topic: "aws.onemac.migration.cdc",
        partition: 0,
        timestampType: "CREATE_TIME",
        headers: {}
      }
    ], "topic");
    // no throws is good
    expect(true).toBe(true);
  });

  it("should process a valid OneMAC event", async () => {
    await insertOneMacRecordsFromKafkaIntoMako([
      {
        key: Buffer.from("id").toString("base64"),
        value: Buffer.from(JSON.stringify({
          event: "new-medicaid-submission",
          origin: "mako",
          id: "CO-1234",
          makoChangedDate: "2024-10-01T00:00:00Z"
        })).toString("base64"),
        timestamp: Date.now(),
        offset: 0,
        topic: "aws.onemac.migration.cdc",
        partition: 0,
        timestampType: "CREATE_TIME",
        headers: {}
      }
    ], "topic");
    // Check that no error is thrown
    expect(true).toBe(true);
  });
});