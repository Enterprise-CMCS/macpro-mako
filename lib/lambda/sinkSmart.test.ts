import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { KafkaEvent, KafkaRecord, DATASINK_SCHEMA_VERSION } from "shared-types";

import { handler } from "./sinkSmart";
import * as sinkSmartProcessors from "./sinkSmartProcessors";

// Mock the processors module
vi.mock("./sinkSmartProcessors", () => ({
  processSmartEvent: vi.fn(),
}));

const mockProcessSmartEvent = sinkSmartProcessors.processSmartEvent as Mock;

/**
 * Helper to create a base64 encoded string
 */
function toBase64(str: string): string {
  return Buffer.from(str).toString("base64");
}

/**
 * Helper to create a valid SMART event envelope as a Kafka record
 */
function createSmartKafkaRecord(
  eventId: string = "c0a8012e-7b6f-4c2f-a9b1-8fdc1cbb2b4a",
  overrides: Record<string, unknown> = {},
): KafkaRecord {
  const envelope = {
    source: "SMART",
    recordType: "WAIVER",
    eventType: "ISSUED_RAI",
    eventId,
    eventTime: "2026-01-20T18:41:05Z",
    correlationId: "0f9b3b6f1cbe4a1b",
    schemaVersion: DATASINK_SCHEMA_VERSION,
    data: {
      STATE_PLAN: {
        ID_NUMBER: "MN-4128.R08.04",
      },
    },
    ...overrides,
  };

  return {
    topic: "aws.smart.inbound.events",
    partition: 0,
    offset: 1,
    timestamp: Date.now(),
    timestampType: "CREATE_TIME",
    key: toBase64(eventId),
    headers: [{ source: Array.from(Buffer.from("smart")) }],
    value: toBase64(JSON.stringify(envelope)),
  };
}

/**
 * Helper to create a Kafka event
 */
function createKafkaEvent(records: KafkaRecord[]): KafkaEvent {
  return {
    eventSource: "SelfManagedKafka",
    bootstrapServers: "localhost:9092",
    records: {
      "aws.smart.inbound.events-0": records,
    },
  };
}

describe("sinkSmart Lambda handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "https://test-opensearch.com";
    process.env.indexNamespace = "test-";
  });

  it("should process SMART events from Kafka", async () => {
    const record = createSmartKafkaRecord();
    const event = createKafkaEvent([record]);

    mockProcessSmartEvent.mockResolvedValueOnce({
      success: true,
      eventId: "c0a8012e-7b6f-4c2f-a9b1-8fdc1cbb2b4a",
      action: "upserted",
    });

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).toHaveBeenCalledTimes(1);
    expect(mockProcessSmartEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "SMART",
        recordType: "WAIVER",
        eventType: "ISSUED_RAI",
        eventId: "c0a8012e-7b6f-4c2f-a9b1-8fdc1cbb2b4a",
      }),
    );
  });

  it("should process multiple SMART events", async () => {
    const record1 = createSmartKafkaRecord("event-1");
    const record2 = createSmartKafkaRecord("event-2");
    const event = createKafkaEvent([record1, record2]);

    mockProcessSmartEvent
      .mockResolvedValueOnce({ success: true, eventId: "event-1", action: "upserted" })
      .mockResolvedValueOnce({ success: true, eventId: "event-2", action: "upserted" });

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).toHaveBeenCalledTimes(2);
  });

  it("should handle records with no value", async () => {
    const record = createSmartKafkaRecord();
    record.value = "";
    const event = createKafkaEvent([record]);

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).not.toHaveBeenCalled();
  });

  it("should handle invalid JSON in record value", async () => {
    const record = createSmartKafkaRecord();
    record.value = toBase64("not valid json");
    const event = createKafkaEvent([record]);

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).not.toHaveBeenCalled();
  });

  it("should handle records missing required fields", async () => {
    const record = createSmartKafkaRecord();
    record.value = toBase64(JSON.stringify({ someField: "value" }));
    const event = createKafkaEvent([record]);

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).not.toHaveBeenCalled();
  });

  it("should continue processing even if one record fails", async () => {
    const record1 = createSmartKafkaRecord("event-1");
    const record2 = createSmartKafkaRecord("event-2");
    const event = createKafkaEvent([record1, record2]);

    mockProcessSmartEvent
      .mockRejectedValueOnce(new Error("Processing failed"))
      .mockResolvedValueOnce({ success: true, eventId: "event-2", action: "upserted" });

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).toHaveBeenCalledTimes(2);
  });

  it("should handle SPA record type", async () => {
    const record = createSmartKafkaRecord("spa-event", { recordType: "SPA" });
    const event = createKafkaEvent([record]);

    mockProcessSmartEvent.mockResolvedValueOnce({
      success: true,
      eventId: "spa-event",
      action: "upserted",
    });

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        recordType: "SPA",
      }),
    );
  });

  it("should handle different event types", async () => {
    const record = createSmartKafkaRecord("created-event", { eventType: "CREATED" });
    const event = createKafkaEvent([record]);

    mockProcessSmartEvent.mockResolvedValueOnce({
      success: true,
      eventId: "created-event",
      action: "upserted",
    });

    await handler(event, {} as any, () => {});

    expect(mockProcessSmartEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "CREATED",
      }),
    );
  });
});
