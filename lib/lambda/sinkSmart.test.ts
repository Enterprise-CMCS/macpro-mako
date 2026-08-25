import { readFileSync } from "node:fs";

import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "libs/sink-lib";
import { convertObjToBase64, createKafkaEvent, createKafkaRecord } from "mocks/helpers/kafka.utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as processEmails from "./processEmails";
import * as sinkChangelog from "./sinkChangelog";
import * as sinkMainProcessors from "./sinkMainProcessors";
import { handler, parseSmartKafkaRecord, parseSmartOnemacEvent } from "./sinkSmart";
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
const createItemSpy = vi.spyOn(os, "createItem");
const updateItemSpy = vi.spyOn(os, "updateItem");

afterEach(() => {
  vi.clearAllMocks();
});

describe("SMART Kafka envelope parsing", () => {
  it("decodes a base64 Kafka record when its key equals payload.id", () => {
    expect(parseSmartKafkaRecord(createSmartRecord(), TOPIC_PARTITION)).toEqual(smartEvent);
  });

  it.each([
    [
      "malformed key encoding",
      createKafkaRecord({
        topic: TOPIC,
        key: "not-base64%%%",
        value: convertObjToBase64(smartEvent),
      }),
      sink.ErrorType.BADPARSE,
      "BADPARSE",
    ],
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
    [
      "key/id mismatch",
      createSmartRecord(smartEvent, "AL-26-0817-9999"),
      sink.ErrorType.VALIDATION,
      "VALIDATION",
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
    },
  );

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
  });

  it("rejects an empty id", () => {
    expect(parseSmartOnemacEvent({ ...smartEvent, id: "" })).toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
  });

  it("rejects source in place of origin", () => {
    const { origin: _origin, ...payload } = smartEvent;

    expect(parseSmartOnemacEvent({ ...payload, source: "SMART" })).toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
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
});

describe("SMART operation dispatch", () => {
  beforeEach(() => {
    getItemSpy.mockResolvedValue(undefined);
    createItemSpy.mockResolvedValue({ created: true });
    updateItemSpy.mockResolvedValue(undefined);
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

  it.each(["MSP_STATUS_UPDATED", "NOT_A_REAL_TYPE"])(
    "logs and skips unknown operationType %s",
    async (operationType) => {
      await expect(
        invokeHandler(createSmartEvent(createSmartRecord({ ...smartEvent, operationType }))),
      ).resolves.toBeUndefined();

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: sink.ErrorType.VALIDATION,
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
    },
  );

  it.each(["MSP_RAI_WITHDRAWAL_TOGGLED", "MSP_SPLIT_SPA_CREATED", "MSP_ASSIGNMENT_UPDATED"])(
    "logs and skips stub operationType %s without OpenSearch writes",
    async (operationType) => {
      await expect(
        invokeHandler(createSmartEvent(createSmartRecord({ ...smartEvent, operationType }))),
      ).resolves.toBeUndefined();

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: sink.ErrorType.VALIDATION,
          metadata: expect.objectContaining({
            operationType,
            reason: "handler not implemented",
          }),
        }),
      );
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).not.toHaveBeenCalled();
      expect(publishSmartIngestErrorSpy).not.toHaveBeenCalled();
    },
  );

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
  });

  it("logs and skips a missing operationType", async () => {
    const { operationType: _operationType, ...payload } = smartEvent;

    await expect(
      invokeHandler(createSmartEvent(createSmartRecord(payload))),
    ).resolves.toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.VALIDATION,
      }),
    );
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
