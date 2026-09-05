import { readFileSync } from "node:fs";

import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { convertObjToBase64, createKafkaEvent, createKafkaRecord } from "mocks/helpers/kafka.utils";
import { SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as processEmails from "./processEmails";
import * as sinkChangelog from "./sinkChangelog";
import * as sinkMainProcessors from "./sinkMainProcessors";
import { handler, parseSmartKafkaRecord, parseSmartOnemacEvent } from "./sinkSmart";
import * as mspManualRecordCreatedModule from "./smart/mspManualRecordCreated";
import * as publishSmartIngestErrorModule from "./smart/publishSmartIngestError";

const TOPIC = "aws.mulesoft.onemac.events";
const TOPIC_PARTITION = `${TOPIC}-0`;

const smartEvent = {
  spaWaiverId: "a0ncp000006Wdh7AAC",
  id: "AL-26-0817-0001",
  correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
  origin: "SMART",
  authority: "Medicaid SPA",
  status: "Intake Needed",
  createdAt: "2026-08-17T16:54:33.000Z",
  createdByUserId: "005cp00000Jqq9HAAR",
  createdByName: "Alice Jones",
  createdByEmail: "alice.j@globalalliantinc.com",
  operationType: "MSP_MANUAL_RECORD_CREATED",
  creationContext: "MANUAL",
  state: "Alabama",
  initialSubmissionDate: "2026-08-17",
};

const createSmartRecord = (
  payload: Record<string, unknown> = smartEvent,
  key = String(payload.id),
) =>
  createKafkaRecord({
    topic: TOPIC,
    key: Buffer.from(key).toString("base64"),
    value: convertObjToBase64(payload),
  });

const createSmartEvent = (...records: ReturnType<typeof createSmartRecord>[]) =>
  createKafkaEvent({ [TOPIC_PARTITION]: records });

const invokeHandler = (event = createSmartEvent(createSmartRecord())) =>
  handler(event, {} as Context, vi.fn());

const logErrorSpy = vi.spyOn(sink, "logError").mockImplementation(() => undefined);
const publishSmartIngestErrorSpy = vi
  .spyOn(publishSmartIngestErrorModule, "publishSmartIngestError")
  .mockResolvedValue(undefined);
const getItemSpy = vi.spyOn(os, "getItem");
const searchSpy = vi.spyOn(os, "search").mockResolvedValue({ hits: { hits: [] } });
const createItemSpy = vi.spyOn(os, "createItem");
const updateItemSpy = vi.spyOn(os, "updateItem");
const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
const transformMspManualRecordCreatedSpy = vi.spyOn(
  mspManualRecordCreatedModule,
  "transformMspManualRecordCreated",
);

afterEach(() => {
  vi.clearAllMocks();
});

describe("SMART Kafka envelope parsing", () => {
  it("decodes a base64 Kafka record when its key equals payload.id", () => {
    expect(parseSmartKafkaRecord(createSmartRecord(), TOPIC_PARTITION)).toEqual(smartEvent);
  });

  it.each([
    [
      "malformed value encoding",
      createKafkaRecord({
        topic: TOPIC,
        key: Buffer.from(smartEvent.id).toString("base64"),
        value: "%%%",
      }),
      sink.ErrorType.BADPARSE,
      "BADPARSE",
    ],
    [
      "invalid JSON",
      createKafkaRecord({
        topic: TOPIC,
        key: Buffer.from(smartEvent.id).toString("base64"),
        value: Buffer.from("{not-json").toString("base64"),
      }),
      sink.ErrorType.BADPARSE,
      "BADPARSE",
    ],
  ])(
    "logs and publishes %s without rejecting the batch",
    async (_caseName, invalidRecord, errorType, errorCode) => {
      await expect(invokeHandler(createSmartEvent(invalidRecord))).resolves.toBeUndefined();

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: errorType,
        }),
      );
      expect(publishSmartIngestErrorSpy).toHaveBeenCalledTimes(1);
      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode,
          topicPartition: TOPIC_PARTITION,
          topic: TOPIC,
        }),
      );
      expect(publishSmartIngestErrorSpy.mock.calls[0]?.[0]).not.toHaveProperty("payload");
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["a key that differs from payload.id", createSmartRecord(smartEvent, "AL-26-0817-9999")],
    [
      "an undecodable key",
      createKafkaRecord({
        topic: TOPIC,
        key: "not-base64%%%",
        value: convertObjToBase64(smartEvent),
      }),
    ],
  ])("processes a valid payload with %s", async (_caseName, record) => {
    expect(parseSmartKafkaRecord(record, TOPIC_PARTITION)).toEqual(smartEvent);
    createItemSpy.mockResolvedValueOnce({ created: true });

    await expect(invokeHandler(createSmartEvent(record))).resolves.toBeUndefined();

    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
    expect(getItemSpy).toHaveBeenCalled();
  });

  it.each(["spaWaiverId", "id", "correlationId", "origin", "authority", "status", "createdAt"])(
    "requires %s",
    async (requiredField) => {
      const payload: Record<string, unknown> = { ...smartEvent };
      delete payload[requiredField];

      expect(parseSmartOnemacEvent(payload)).toBeUndefined();
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: sink.ErrorType.VALIDATION,
        }),
      );

      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload, smartEvent.id))),
      ).resolves.toBeUndefined();
      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "VALIDATION",
          topic: TOPIC,
          topicPartition: TOPIC_PARTITION,
          kafkaKey: smartEvent.id,
          payload,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it.each(["smart", "Smart"])(
    "rejects origin casing %s and publishes VALIDATION",
    async (origin) => {
      expect(parseSmartOnemacEvent({ ...smartEvent, origin })).toBeUndefined();
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: sink.ErrorType.VALIDATION,
        }),
      );

      await expect(
        invokeHandler(createSmartEvent(createSmartRecord({ ...smartEvent, origin }))),
      ).resolves.toBeUndefined();
      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "VALIDATION",
          topic: TOPIC,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it("rejects an invalid createdAt and publishes VALIDATION", async () => {
    const payload = { ...smartEvent, createdAt: "08/17/2026 16:54:33" };

    expect(parseSmartOnemacEvent(payload)).toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );

    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(payload))),
    ).resolves.toBeUndefined();
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        topic: TOPIC,
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it.each(["2026-13-40T25:61:61Z", "2026-02-31T16:54:33.000Z"])(
    "rejects semantically invalid createdAt %s and publishes VALIDATION",
    async (createdAt) => {
      const payload = { ...smartEvent, createdAt };

      expect(parseSmartOnemacEvent(payload)).toBeUndefined();
      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload))),
      ).resolves.toBeUndefined();

      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "VALIDATION",
          topic: TOPIC,
          payload,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it.each(["spaWaiverId", "id", "authority", "status"])(
    "rejects empty required field %s and publishes VALIDATION",
    async (requiredField) => {
      const payload = { ...smartEvent, [requiredField]: "" };

      expect(parseSmartOnemacEvent(payload)).toBeUndefined();
      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload, smartEvent.id))),
      ).resolves.toBeUndefined();

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: sink.ErrorType.VALIDATION,
        }),
      );
      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "VALIDATION",
          topic: TOPIC,
          topicPartition: TOPIC_PARTITION,
          payload,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it.each(["spaWaiverId", "id", "authority", "status"])(
    "rejects whitespace-only required field %s and publishes VALIDATION",
    async (requiredField) => {
      const payload = { ...smartEvent, [requiredField]: "   " };

      expect(parseSmartOnemacEvent(payload)).toBeUndefined();
      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload, smartEvent.id))),
      ).resolves.toBeUndefined();

      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "VALIDATION",
          topic: TOPIC,
          payload,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it("trims required envelope strings before dispatch", () => {
    expect(
      parseSmartOnemacEvent({
        ...smartEvent,
        spaWaiverId: ` ${smartEvent.spaWaiverId} `,
        id: ` ${smartEvent.id} `,
        authority: ` ${smartEvent.authority} `,
        status: ` ${smartEvent.status} `,
        createdAt: ` ${smartEvent.createdAt} `,
      }),
    ).toEqual(
      expect.objectContaining({
        spaWaiverId: smartEvent.spaWaiverId,
        id: smartEvent.id,
        authority: smartEvent.authority,
        status: smartEvent.status,
        createdAt: smartEvent.createdAt,
      }),
    );
  });

  it("accepts a required correlationId with a blank value", async () => {
    const payload = { ...smartEvent, correlationId: "" };
    createItemSpy.mockResolvedValueOnce({ created: true });

    expect(parseSmartOnemacEvent(payload)).toEqual(expect.objectContaining(payload));
    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(payload))),
    ).resolves.toBeUndefined();

    expect(createItemSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/main$/),
      expect.objectContaining({ correlationId: "" }),
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("rejects source in place of origin and publishes VALIDATION", async () => {
    const { origin: _origin, ...payload } = smartEvent;
    const sourcePayload = { ...payload, source: "SMART" };

    expect(parseSmartOnemacEvent(sourcePayload)).toBeUndefined();
    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(sourcePayload, smartEvent.id))),
    ).resolves.toBeUndefined();

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        topic: TOPIC,
        topicPartition: TOPIC_PARTITION,
        payload: sourcePayload,
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("accepts exact SMART origin and retains extra properties", () => {
    const parsed = parseSmartOnemacEvent({ ...smartEvent, zzzUnknown: "still-here" });

    expect(parsed).toEqual(
      expect.objectContaining({
        origin: "SMART",
        creationContext: "MANUAL",
        state: "Alabama",
        initialSubmissionDate: "2026-08-17",
        zzzUnknown: "still-here",
      }),
    );
  });

  it("accepts null optional effective dates for SMART snapshot events", () => {
    const payload = {
      ...smartEvent,
      approvedEffectiveDate: null,
      proposedEffectiveDate: null,
    };

    expect(parseSmartOnemacEvent(payload)).toEqual(expect.objectContaining(payload));
  });

  it.each(["spaWaiverId", "id", "correlationId", "authority", "status", "createdAt"])(
    "rejects null required field %s and publishes VALIDATION",
    async (requiredField) => {
      const payload = { ...smartEvent, [requiredField]: null };

      expect(parseSmartOnemacEvent(payload)).toBeUndefined();
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: sink.ErrorType.VALIDATION,
        }),
      );

      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload, smartEvent.id))),
      ).resolves.toBeUndefined();
      expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "VALIDATION",
          topic: TOPIC,
          topicPartition: TOPIC_PARTITION,
          kafkaKey: smartEvent.id,
          payload,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );
});

describe("SMART operation dispatch", () => {
  beforeEach(() => {
    getItemSpy.mockReset();
    searchSpy.mockReset();
    createItemSpy.mockReset();
    updateItemSpy.mockReset();
    bulkUpdateDataSpy.mockReset();
    getItemSpy.mockResolvedValue(undefined);
    searchSpy.mockResolvedValue({ hits: { hits: [] } });
    createItemSpy.mockResolvedValue({ created: true });
    updateItemSpy.mockResolvedValue(undefined);
    bulkUpdateDataSpy.mockResolvedValue(undefined);
  });

  it("processes MSP_MANUAL_RECORD_CREATED without rejecting or publishing to BigMAC", async () => {
    await expect(invokeHandler()).resolves.toBeUndefined();

    expect(logErrorSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("accepts null optional creator fields and dispatches a manual record creation", async () => {
    const payload = {
      ...smartEvent,
      createdByName: null,
      createdByEmail: null,
    };

    expect(parseSmartOnemacEvent(payload)).toEqual(expect.objectContaining(payload));
    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(payload))),
    ).resolves.toBeUndefined();

    expect(createItemSpy).toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("consumes MSP_SPLIT_SPA_CREATED using the parent external identifier", async () => {
    const originalSpaId = "AL-26-1111";
    const splitSpaId = "AL-26-1111-TEST";
    const originalSpaWaiverId = "a0ncp000006UfblAAC";
    const splitSpaWaiverId = "a0ncp000006WdfVAAS";
    const splitPayload = {
      ...smartEvent,
      correlationId: "",
      spaWaiverId: splitSpaWaiverId,
      id: splitSpaId,
      status: "Intake Needed",
      createdAt: "2026-08-17T16:37:12.000Z",
      splitSpaId,
      splitSpaWaiverId,
      originalSpaWaiverId,
      originalSpaId,
      splitReason: "Testing Split for Allie",
      operationType: "MSP_SPLIT_SPA_CREATED",
    };
    const parentDocument = {
      id: originalSpaId,
      origin: "OneMAC",
      authority: "Medicaid SPA",
      state: "AL",
      seatoolStatus: SEATOOL_STATUS.PENDING,
      cmsStatus: "Pending",
      stateStatus: "Under Review",
      submissionDate: "2026-07-01T12:00:00.000Z",
      makoChangedDate: "2026-07-02T12:00:00.000Z",
      changedDate: "2026-07-02T12:00:00.000Z",
      statusDate: "2026-07-02T12:00:00.000Z",
      spaWaiverId: originalSpaWaiverId,
      deleted: false,
    };
    searchSpy.mockImplementation(async (_domain, index, query) => {
      const serializedQuery = JSON.stringify(query);
      if (String(index).endsWith("main") && serializedQuery.includes(originalSpaWaiverId)) {
        return { hits: { hits: [{ _id: originalSpaId, _source: parentDocument }] } };
      }
      if (String(index).endsWith("changelog") && serializedQuery.includes(originalSpaId)) {
        return {
          hits: {
            hits: [
              {
                _id: `${originalSpaId}-0001`,
                _source: {
                  id: `${originalSpaId}-0001`,
                  packageId: originalSpaId,
                  event: "new-medicaid-submission",
                  timestamp: 1782907200000,
                },
              },
            ],
          },
        };
      }
      return { hits: { hits: [] } };
    });

    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(splitPayload, originalSpaId))),
    ).resolves.toBeUndefined();

    expect(createItemSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/main$/),
      expect.objectContaining({
        id: splitSpaId,
        origin: "SMART",
        smartRecordType: SMART_RECORD_TYPE.PACKAGE,
        spaWaiverId: splitSpaWaiverId,
        originalSpaId,
        originalSpaWaiverId,
        seatoolStatus: SEATOOL_STATUS.PENDING,
      }),
    );
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/changelog$/),
      expect.arrayContaining([
        expect.objectContaining({
          packageId: splitSpaId,
          event: "split-spa",
          timestamp: Date.parse(splitPayload.createdAt),
          isAdminChange: true,
        }),
      ]),
      { throwOnBulkError: true },
    );
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it("preserves the actual Kafka key and record metadata for Split SPA business failures", async () => {
    const originalSpaId = "AL-26-1111";
    const splitSpaId = "AL-26-1111-TEST";
    const kafkaKey = "PARENT-KAFKA-KEY";
    const record = createSmartRecord(
      {
        ...smartEvent,
        correlationId: "",
        spaWaiverId: "a0ncp000006WdfVAAS",
        id: splitSpaId,
        splitSpaId,
        splitSpaWaiverId: "a0ncp000006WdfVAAS",
        originalSpaWaiverId: "a0ncp000006UfblAAC",
        originalSpaId,
        splitReason: "Testing Split for Allie",
        operationType: "MSP_SPLIT_SPA_CREATED",
      },
      kafkaKey,
    );

    await expect(invokeHandler(createSmartEvent(record))).resolves.toBeUndefined();

    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        kafkaKey,
        kafkaOffset: record.offset,
        kafkaTimestamp: record.timestamp,
      }),
    );
  });

  it("consumes MSP_RAI_WITHDRAWAL_TOGGLED for an existing package", async () => {
    const packageId = "AL-26-0001-GATT";
    const spaWaiverId = "a0ncp000006RG8TAAW";
    const raiId = "a0qcp000005GbK5AAK";
    const toggleDate = "2026-08-17T16:11:46.000Z";
    const raiTogglePayload = {
      ...smartEvent,
      spaWaiverId,
      id: packageId,
      correlationId: "",
      authority: "Medicaid SPA",
      status: "Pending Second Clock",
      createdAt: toggleDate,
      operationType: "MSP_RAI_WITHDRAWAL_TOGGLED",
      raiId,
      raiName: `${packageId}-RAI`,
      raiWithdrawnToggle: true,
      raiWithdrawnToggleDate: toggleDate,
    };
    const existingPackage = {
      id: packageId,
      origin: "OneMAC",
      authority: "Medicaid SPA",
      state: "AL",
      seatoolStatus: SEATOOL_STATUS.PENDING,
      cmsStatus: "Pending",
      stateStatus: "Under Review",
      raiRequestedDate: "2026-07-01T12:00:00.000Z",
      raiReceivedDate: "2026-08-01T12:00:00.000Z",
      raiWithdrawEnabled: false,
      spaWaiverId,
      deleted: false,
    };
    getItemSpy.mockResolvedValue({
      found: true,
      _id: packageId,
      _source: existingPackage,
    } as Awaited<ReturnType<typeof os.getItem>>);
    searchSpy.mockImplementation(async (_domain, index) =>
      String(index).endsWith("main")
        ? { hits: { hits: [{ _id: packageId, _source: existingPackage }] } }
        : { hits: { hits: [] } },
    );

    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(raiTogglePayload, packageId))),
    ).resolves.toBeUndefined();

    expect(updateItemSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/main$/),
      packageId,
      expect.objectContaining({
        raiWithdrawEnabled: true,
        raiId,
        raiWithdrawnToggleDate: toggleDate,
      }),
    );
    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/changelog$/),
      [
        expect.objectContaining({
          packageId,
          event: "toggle-withdraw-rai",
          timestamp: Date.parse(toggleDate),
          isAdminChange: true,
          raiWithdrawEnabled: true,
        }),
      ],
      { throwOnBulkError: true },
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
  });

  it.each(["MSP_MANUAL_RECORD_CREATED", "MSP_ASSIGNMENT_UPDATED", "NOT_A_REAL_TYPE", undefined])(
    "creates a default OneMAC-shaped document for operationType %s when the ID is missing",
    async (operationType) => {
      const payload = { ...smartEvent, operationType, id: smartEvent.id.toLowerCase() };

      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload))),
      ).resolves.toBeUndefined();

      expect(getItemSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/main$/),
        smartEvent.id,
      );
      expect(createItemSpy).toHaveBeenCalledOnce();
      expect(createItemSpy.mock.calls[0][2]).toMatchObject({
        id: smartEvent.id,
        origin: "SMART",
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        state: "AL",
        spaWaiverId: smartEvent.spaWaiverId,
        correlationId: smartEvent.correlationId,
      });
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it.each(["MSP_MANUAL_RECORD_CREATED", "MSP_ASSIGNMENT_UPDATED", "NOT_A_REAL_TYPE", undefined])(
    "updates only SMART identity fields for operationType %s when the ID exists",
    async (operationType) => {
      const payload = { ...smartEvent, operationType, id: smartEvent.id.toLowerCase() };
      getItemSpy.mockResolvedValueOnce({
        found: true,
        _id: smartEvent.id,
        _source: {
          id: smartEvent.id,
          origin: "OneMAC",
          seatoolStatus: "Under Review",
          submitterName: "Existing Submitter",
        },
      } as Awaited<ReturnType<typeof os.getItem>>);

      await expect(
        invokeHandler(createSmartEvent(createSmartRecord(payload))),
      ).resolves.toBeUndefined();

      expect(getItemSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/main$/),
        smartEvent.id,
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(transformMspManualRecordCreatedSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).toHaveBeenCalledOnce();
      expect(updateItemSpy.mock.calls[0][3]).toEqual({
        spaWaiverId: smartEvent.spaWaiverId,
        correlationId: smartEvent.correlationId,
      });
    },
  );

  it("does not erase an existing correlation ID when SMART sends a blank value", async () => {
    const payload = { ...smartEvent, correlationId: "" };
    getItemSpy.mockResolvedValueOnce({
      found: true,
      _id: smartEvent.id,
      _source: {
        id: smartEvent.id,
        origin: "OneMAC",
        correlationId: "existing-correlation-id",
      },
    } as Awaited<ReturnType<typeof os.getItem>>);

    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(payload))),
    ).resolves.toBeUndefined();

    expect(updateItemSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/main$/),
      smartEvent.id,
      { spaWaiverId: smartEvent.spaWaiverId },
    );
  });

  it("checks for an existing ID before mapping or creating a new document", async () => {
    const payload = { ...smartEvent, id: smartEvent.id.toLowerCase() };

    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(payload))),
    ).resolves.toBeUndefined();

    expect(getItemSpy.mock.invocationCallOrder[0]).toBeLessThan(
      transformMspManualRecordCreatedSpy.mock.invocationCallOrder[0],
    );
    expect(getItemSpy.mock.invocationCallOrder[0]).toBeLessThan(
      createItemSpy.mock.invocationCallOrder[0],
    );
  });

  it("logs and publishes BigMAC for a package ID that does not start with a known state code", async () => {
    await expect(
      invokeHandler(
        createSmartEvent(
          createSmartRecord({ ...smartEvent, id: "XX-26-0817-0001" }, "XX-26-0817-0001"),
        ),
      ),
    ).resolves.toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        kafkaKey: "XX-26-0817-0001",
      }),
    );
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("publishes BigMAC without reading or updating an existing invalid package ID", async () => {
    getItemSpy.mockResolvedValueOnce({
      found: true,
      _id: "XX-26-0817-0001",
      _source: {
        id: "XX-26-0817-0001",
        origin: "OneMAC",
      },
    } as Awaited<ReturnType<typeof os.getItem>>);

    await expect(
      invokeHandler(
        createSmartEvent(
          createSmartRecord({ ...smartEvent, id: "XX-26-0817-0001" }, "XX-26-0817-0001"),
        ),
      ),
    ).resolves.toBeUndefined();

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        kafkaKey: "XX-26-0817-0001",
      }),
    );
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it("continues processing a valid record after an invalid record", async () => {
    const invalidRecord = createSmartRecord({ ...smartEvent, origin: "smart" });
    const validRecord = createSmartRecord();

    await expect(
      invokeHandler(createSmartEvent(invalidRecord, validRecord)),
    ).resolves.toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalledTimes(1);
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledTimes(1);
    expect(publishSmartIngestErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "VALIDATION",
        topic: TOPIC,
      }),
    );
  });

  it("rethrows OpenSearch failures so the event source mapping can retry", async () => {
    const outage = new Error("OpenSearch unavailable");
    getItemSpy.mockRejectedValueOnce(outage);

    await expect(invokeHandler()).rejects.toThrow(outage);
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.UNKNOWN,
        error: outage,
      }),
    );
  });

  it("rethrows BigMAC publish failures so the event source mapping can retry", async () => {
    const outage = new Error("SQS unavailable");
    publishSmartIngestErrorSpy.mockRejectedValueOnce(outage);
    const invalidRecord = createSmartRecord({ ...smartEvent, origin: "smart" });

    await expect(invokeHandler(createSmartEvent(invalidRecord))).rejects.toThrow(outage);
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.UNKNOWN,
        error: outage,
      }),
    );
  });

  it("does not invoke CDC, changelog, or email processors", async () => {
    const cdcProcessorSpy = vi
      .spyOn(sinkMainProcessors, "insertOneMacRecordsFromKafkaIntoMako")
      .mockResolvedValue(undefined);
    const changelogProcessorSpy = vi.spyOn(sinkChangelog, "handler");
    const emailProcessorSpy = vi.spyOn(processEmails, "handler");

    await invokeHandler();

    expect(cdcProcessorSpy).not.toHaveBeenCalled();
    expect(changelogProcessorSpy).not.toHaveBeenCalled();
    expect(emailProcessorSpy).not.toHaveBeenCalled();

    const source = readFileSync(new URL("./sinkSmart.ts", import.meta.url), "utf8");
    expect(source).not.toContain("./sinkMainProcessors");
    expect(source).not.toContain("./sinkChangelog");
    expect(source).not.toContain("./processEmails");
  });
});
