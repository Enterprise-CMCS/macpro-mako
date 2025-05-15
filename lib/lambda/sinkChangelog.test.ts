import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import {
  convertObjToBase64,
  createKafkaEvent,
  createKafkaRecord,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  WITHDRAWN_CHANGELOG_ITEM_ID as TEST_ITEM_ID,
} from "mocks";
import items from "mocks/data/items";
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
} from "mocks/data/submit/changelog";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./sinkChangelog";

// Onemac charcode used for header
const oneMacCode = [111, 110, 101, 109, 97, 99];
const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}changelog`;
const TOPIC = "--mako--branch-name--aws.onemac.migration.cdc";
const TEST_ITEM = items[TEST_ITEM_ID];
const TEST_ITEM_KEY = Buffer.from(TEST_ITEM_ID).toString("base64");
const TEST_ITEM_UPDATE_ID = "MD-0005.R01.01";
const TEST_ITEM_UPDATE_KEY = Buffer.from(TEST_ITEM_UPDATE_ID).toString("base64");
const TIMESTAMP = 1732645041557;

describe("syncing Changelog events", () => {
  const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
  const logErrorSpy = vi.spyOn(sink, "logError");

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    [
      "app-k",
      appkBase,
      {
        actionType: "Amend",
      },
    ],
    [
      "capitated-initial",
      capitatedInitial,
      {
        actionType: "Initial",
      },
    ],
    [
      "capitated-amend",
      capitatedAmendmentBase,
      {
        actionType: "Amend",
      },
    ],
    [
      "capitated-renew",
      capitatedRenewal,
      {
        actionType: "Renew",
      },
    ],
    [
      "contracting-initial",
      contractingInitial,
      {
        actionType: "Initial",
      },
    ],
    [
      "contracting-amendment",
      contractingAmendment,
      {
        actionType: "Amend",
      },
    ],
    [
      "contracting-renewal",
      contractingRenewal,
      {
        actionType: "Renew",
      },
    ],
    [
      "new-chip-submission",
      newChipSubmission,
      {
        actionType: "Amend",
      },
    ],
    ["new-medicaid-submission", newMedicaidSubmission, {}],
    ["upload-subsequent-documents", uploadSubsequentDocuments, {}],
    [
      "temporary-extension",
      temporaryExtension,
      {
        actionType: "Extend",
      },
    ],
    ["respond-to-rai", respondToRai, {}],
    ["withdraw-package", withdrawPackage, {}],
    ["withdraw-rai", withdrawRai, {}],
  ])("should handle valid changelog event for %s", async (_, log, expectations) => {
    const event = createKafkaEvent({
      [`${TOPIC}-01`]: [
        createKafkaRecord({
          topic: `${TOPIC}-01`,
          key: Buffer.from(log.id).toString("base64"),
          value: convertObjToBase64({
            ...log,
            packageId: log.id,
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
          offset: 1,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());
    const files: object[] = Object.values(log?.attachments).reduce((acc: object[], curr) => {
      return acc.concat(
        curr.files.map((file) => ({
          ...file,
          title: curr.label,
        })),
      );
    }, []);
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...log,
        ...expectations,
        attachments: files,
        id: `${log.id}-1`,
        packageId: log.id,
        origin: "mako",
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        timestamp: TIMESTAMP,
      },
    ]);
  });
  it("should handle a valid admin id update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-03`]: [
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_UPDATE_KEY,
          headers: [{ source: oneMacCode }],
          value: convertObjToBase64({
            additionalInformation: "This is just a test",
            componentType: "medicaidspa",
            attachments: [
              {
                s3Key: "1666885211577/15MB.pdf",
                filename: "15MB.pdf",
                title: "CMS Form 179",
                contentType: "application/pdf",
                url: "https://fake.pdf",
              },
              {
                s3Key: "1666885211579/adobe.pdf",
                filename: "adobe.pdf",
                title: "SPA Pages",
                contentType: "application/pdf",
                url: "https://fake.pdf",
              },
            ],
            componentId: "MD-22-0030",
            currentStatus: "Submitted",
            convertTimestamp: 1673973227043,
            submissionTimestamp: 1666885236740,
            clockEndTimestamp: 1674664836740,
            proposedEffectiveDate: "none",
            GSI1pk: "OneMAC#submitmedicaidspa",
            adminChanges: [
              {
                changeTimestamp: 1746798111690,
                changeReason: "test update from 29 to 30",
                changeMade: "ID changed from MD-22-0029 to MD-22-0030",
              },
            ],
            GSI1sk: "MD-22-0030",
            sk: "OneMAC#1666885236740",
            pk: "MD-22-0030",
            submitterName: "Statesubmitter Nightwatch",
            originallyFrom: "cms-spa-form-develop-change-requests",
            eventTimestamp: 1666885236740,
            submitterEmail: "statesubmitter@nightwatch.test",
          }),
          offset: 3,
        }),
      ],
    });
    const attachments = [
      {
        bucket: "uploads-develop-attachments-116229642442",
        filename: "15MB.pdf",
        key: "protected/us-east-1:86a190fe-b195-42bf-9685-9761bf0ff14b/1666885211577/15MB.pdf",
        title: "CMS Form 179",
        uploadDate: 1666885211577,
      },
      {
        bucket: "uploads-develop-attachments-116229642442",
        filename: "adobe.pdf",
        key: "protected/us-east-1:86a190fe-b195-42bf-9685-9761bf0ff14b/1666885211579/adobe.pdf",
        title: "SPA Pages",
        uploadDate: 1666885211579,
      },
    ];
    const expectedChangelogs = [
      {
        id: "MD-22-0030-undefined",
        packageId: "MD-22-0030",
        timestamp: 1666885236740,
        event: "new-medicaid-submission",
        attachments: attachments,
        additionalInformation: "This is just a test",
        submitterEmail: "statesubmitter@nightwatch.test",
        submitterName: "Statesubmitter Nightwatch",
      },
      {
        id: "MD-22-0030-1666885236740",
        packageId: "MD-22-0029-del",
        timestamp: 1666885236740,
        event: "new-medicaid-submission",
        attachments: attachments,
        additionalInformation: "This is just a test",
        submitterEmail: "statesubmitter@nightwatch.test",
        submitterName: "Statesubmitter Nightwatch",
      },
      {
        id: "MD-22-0030-legacy-admin-change-1746798111690",
        packageId: "MD-22-0030",
        timestamp: 1746798111690,
        actionType: "legacy-admin-change",
        changeType: undefined,
        changeMade: "ID changed from MD-22-0029 to MD-22-0030",
        changeReason: "test update from 29 to 30",
        isAdminChange: true,
        event: "legacy-admin-change",
      },
    ];

    await handler(event, {} as Context, vi.fn());

    expect(bulkUpdateDataSpy).toBeCalledTimes(1);
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      OPENSEARCH_DOMAIN,
      OPENSEARCH_INDEX,
      expectedChangelogs,
    );
  });
  it("should handle a valid admin id update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-03`]: [
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_UPDATE_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_UPDATE_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update id of the change",
            changeReason: "additional information of the change",
            isAdminChange: true,
            adminChangeType: "update-id",
            idToBeUpdated: TEST_ITEM_ID,
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
          }),
          offset: 3,
        }),
      ],
    });

    const changelogs = TEST_ITEM._source!.changelog!;
    const expectedChangelogs = changelogs.map((log) => ({
      ...log?._source,
      id: log?._id?.replace(TEST_ITEM_ID, TEST_ITEM_UPDATE_ID),
      packageId: TEST_ITEM_UPDATE_ID,
    }));

    await handler(event, {} as Context, vi.fn());
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      OPENSEARCH_DOMAIN,
      OPENSEARCH_INDEX,
      expectedChangelogs,
    );
  });

  it("should handle a valid admin value update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-03`]: [
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update additional information of the change",
            changeReason: "additional information of the change",
            isAdminChange: true,
            adminChangeType: "update-values",
            additionalInformation: "changed additional information",
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
          }),
          offset: 3,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());

    const { attachments: _, ...changes } = TEST_ITEM?._source?.changelog?.[3]?._source || {};
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...changes,
        isAdminChange: true,
        adminChangeType: "update-values",
        changeMade: "update additional information of the change",
        changeReason: "additional information of the change",
        event: "update-values",
        submissionDate: null,
        proposedDate: null,
        id: `${TEST_ITEM_ID}-3`,
        packageId: TEST_ITEM_ID,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        additionalInformation: "changed additional information",
        makoChangedDate: expect.any(Number),
        changedDate: expect.any(Number),
        statusDate: expect.any(Number),
        timestamp: expect.any(Number),
      },
    ]);
  });

  it("should handle a valid admin value and id update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-03`]: [
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update additional information of the change",
            changeReason: "additional information of the change",
            isAdminChange: true,
            adminChangeType: "update-values",
            additionalInformation: "changed additional information",
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
          }),
          offset: 3,
        }),
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_UPDATE_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_UPDATE_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update id of the change",
            changeReason: "additional information of the change",
            isAdminChange: true,
            adminChangeType: "update-id",
            idToBeUpdated: TEST_ITEM_ID,
            makoChangedDate: TIMESTAMP,
            changedDate: TIMESTAMP,
            statusDate: TIMESTAMP,
            timestamp: TIMESTAMP,
          }),
          offset: 3,
        }),
      ],
    });

    const changelogs = TEST_ITEM._source!.changelog!;
    const expectedChangelogs = changelogs.map((log) => ({
      ...log?._source,
      id: log?._id?.replace(TEST_ITEM_ID, TEST_ITEM_UPDATE_ID),
      packageId: TEST_ITEM_UPDATE_ID,
    }));

    await handler(event, {} as Context, vi.fn());

    const { attachments: _, ...changes } = TEST_ITEM?._source?.changelog?.[3]?._source || {};
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...changes,
        isAdminChange: true,
        adminChangeType: "update-values",
        changeMade: "update additional information of the change",
        changeReason: "additional information of the change",
        event: "update-values",
        id: `${TEST_ITEM_ID}-3`,
        packageId: TEST_ITEM_ID,
        submissionDate: null,
        proposedDate: null,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        additionalInformation: "changed additional information",
        makoChangedDate: expect.any(Number),
        changedDate: expect.any(Number),
        statusDate: expect.any(Number),
        timestamp: expect.any(Number),
      },
      {
        ...changes,
        isAdminChange: true,
        adminChangeType: "update-id",
        changeMade: "update id of the change",
        changeReason: "additional information of the change",
        event: "update-id",
        submissionDate: null,
        proposedDate: null,
        id: `${TEST_ITEM_UPDATE_ID}-3`,
        packageId: TEST_ITEM_UPDATE_ID,
        deleted: false,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        additionalInformation: "changed additional information",
        makoChangedDate: expect.any(Number),
        changedDate: expect.any(Number),
        statusDate: expect.any(Number),
        timestamp: expect.any(Number),
      },
      ...expectedChangelogs,
    ]);
  });

  it("should handle a valid admin toggle withdraw rai", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-01`]: [
        createKafkaRecord({
          topic: `${TOPIC}-01`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            ...toggleWithdrawRai,
            packageId: toggleWithdrawRai.id,
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
          offset: 1,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...toggleWithdrawRai,
        id: `${toggleWithdrawRai.id}-1`,
        packageId: toggleWithdrawRai.id,
        origin: "mako",
        isAdminChange: true,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        timestamp: TIMESTAMP,
      },
    ]);
  });

  it("should handle a valid admin delete", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-03`]: [
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
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
          offset: 3,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());

    const {
      attachments: _a,
      additionalInformation: _ai,
      ...changes
    } = TEST_ITEM?._source?.changelog?.[3]?._source || {};
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...changes,
        isAdminChange: true,
        adminChangeType: "delete",
        event: "delete",
        deleted: false,
        id: `${TEST_ITEM_ID}-3`,
        packageId: TEST_ITEM_ID,
        submissionDate: null,
        proposedDate: null,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        makoChangedDate: expect.any(Number),
        changedDate: expect.any(Number),
        statusDate: expect.any(Number),
        timestamp: expect.any(Number),
      },
    ]);
  });

  it("should throw an error if the topic is undefined", async () => {
    const event = createKafkaEvent({
      undefined: [
        createKafkaRecord({
          // @ts-expect-error ignore topic undefined
          topic: undefined,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            isAdminChange: true,
            adminChangeType: "delete",
            deleted: false,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
          }),
          offset: 3,
        }),
      ],
    });

    await expect(() => handler(event, {} as Context, vi.fn())).rejects.toThrowError(
      "topic (undefined) is invalid",
    );

    expect(logErrorSpy).toHaveBeenCalledWith({
      type: sink.ErrorType.BADTOPIC,
    });

    expect(logErrorSpy).toHaveBeenCalledWith({
      type: sink.ErrorType.UNKNOWN,
      metadata: {
        event: {
          eventSource: "SelfManagedKafka",
          bootstrapServers: "kafka",
          records: "too large to display",
        },
      },
    });
  });

  it("should throw an error if the topic is invalid", async () => {
    const event = createKafkaEvent({
      "invalid-topic": [
        createKafkaRecord({
          topic: "invalid-topic",
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            isAdminChange: true,
            adminChangeType: "delete",
            deleted: false,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
          }),
          offset: 3,
        }),
      ],
    });

    await expect(() => handler(event, {} as Context, vi.fn())).rejects.toThrowError(
      "topic (invalid-topic) is invalid",
    );

    expect(logErrorSpy).toHaveBeenCalledWith({
      type: sink.ErrorType.BADTOPIC,
    });

    expect(logErrorSpy).toHaveBeenCalledWith({
      type: sink.ErrorType.UNKNOWN,
      metadata: {
        event: {
          eventSource: "SelfManagedKafka",
          bootstrapServers: "kafka",
          records: "too large to display",
        },
      },
    });
  });

  it("should skip updates for legacy tombstone", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-02`]: [
        {
          key: TEST_ITEM_KEY,
          offset: 15,
          headers: [],
          value: undefined,
        },
      ],
    } as any);
    await handler(event, {} as Context, vi.fn());
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("should skip invalid admin id update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-03`]: [
        createKafkaRecord({
          topic: `${TOPIC}-03`,
          key: TEST_ITEM_UPDATE_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_UPDATE_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update id of the change",
            isAdminChange: true,
            adminChangeType: "update-id",
            timestamp: TIMESTAMP,
          }),
          offset: 3,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should skip non-mako updates", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-01`]: [
        createKafkaRecord({
          topic: `${TOPIC}-01`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            packageId: TEST_ITEM_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
          offset: 1,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should skip invalid update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-01`]: [
        createKafkaRecord({
          topic: `${TOPIC}-01`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            ...appkBase,
            id: TEST_ITEM_ID,
            packageId: TEST_ITEM_ID,
            title: undefined,
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
          offset: 1,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
  });

  it("should handle errors in update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-01`]: [
        createKafkaRecord({
          topic: `${TOPIC}-01`,
          key: TEST_ITEM_KEY,
          value: JSON.stringify({
            ...appkBase,
            id: TEST_ITEM_ID,
            packageId: TEST_ITEM_ID,
            title: undefined,
            origin: "mako",
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            timestamp: TIMESTAMP,
          }),
          offset: 1,
        }),
      ],
    });

    await handler(event, {} as Context, vi.fn());

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.BADPARSE,
      }),
    );
  });
});
