import { describe, expect, it, vi, afterEach } from "vitest";
import { handler } from "./sinkChangelog";
import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import {
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  WITHDRAWN_CHANGELOG_ITEM_ID as TEST_ITEM_ID,
  convertObjToBase64,
  createKafkaEvent,
  createKafkaRecord,
} from "mocks";
import items from "mocks/data/items";
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
} from "mocks/data/submit/changelog";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}changelog`;
const TOPIC = "aws.onemac.migration.cdc";
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
      [`${TOPIC}-02`]: [
        createKafkaRecord({
          topic: `${TOPIC}-01`,
          key: TEST_ITEM_UPDATE_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_UPDATE_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update id of the change",
            isAdminChange: true,
            adminChangeType: "update-id",
            idToBeUpdated: TEST_ITEM_ID,
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
      [`${TOPIC}-02`]: [
        createKafkaRecord({
          topic: `${TOPIC}-02`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update additional information of the change",
            isAdminChange: true,
            adminChangeType: "update-values",
            additionalInformation: "changed additional information",
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
        event: "update-values",
        id: `${TEST_ITEM_ID}-3`,
        packageId: TEST_ITEM_ID,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        additionalInformation: "changed additional information",
        timestamp: expect.any(Number),
      },
    ]);
  });

  it("should handle a valid admin value and id update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-02`]: [
        createKafkaRecord({
          topic: `${TOPIC}-02`,
          key: TEST_ITEM_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update additional information of the change",
            isAdminChange: true,
            adminChangeType: "update-values",
            additionalInformation: "changed additional information",
            timestamp: TIMESTAMP,
          }),
          offset: 3,
        }),
        createKafkaRecord({
          topic: `${TOPIC}-02`,
          key: TEST_ITEM_UPDATE_KEY,
          value: convertObjToBase64({
            id: TEST_ITEM_UPDATE_ID,
            submitterName: "George Harrison",
            submitterEmail: "george@example.com",
            changeMade: "update id of the change",
            isAdminChange: true,
            adminChangeType: "update-id",
            idToBeUpdated: TEST_ITEM_ID,
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
        event: "update-values",
        id: `${TEST_ITEM_ID}-3`,
        packageId: TEST_ITEM_ID,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        additionalInformation: "changed additional information",
        timestamp: expect.any(Number),
      },
      {
        ...changes,
        isAdminChange: true,
        adminChangeType: "update-values",
        changeMade: "update additional information of the change",
        event: "update-values",
        id: `${TEST_ITEM_UPDATE_ID}-3`,
        packageId: TEST_ITEM_UPDATE_ID,
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
        additionalInformation: "changed additional information",
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
      [`${TOPIC}-02`]: [
        createKafkaRecord({
          topic: `${TOPIC}-02`,
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
        submitterName: "George Harrison",
        submitterEmail: "george@example.com",
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
          // @ts-expect-error - value must be undefined for this test
          value: undefined,
        },
      ],
    });
    await handler(event, {} as Context, vi.fn());
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
  });

  it("should skip invalid admin id update", async () => {
    const event = createKafkaEvent({
      [`${TOPIC}-02`]: [
        createKafkaRecord({
          topic: `${TOPIC}-02`,
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
