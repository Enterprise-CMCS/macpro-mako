import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("@aws-sdk/client-sqs", () => ({
  SendMessageCommand: class SendMessageCommand {
    input: Record<string, unknown>;

    constructor(input: Record<string, unknown>) {
      this.input = input;
    }
  },
  SQSClient: class SQSClient {
    send = send;
  },
}));

import { ErrorType } from "libs/sink-lib";

import {
  ONEMAC_VALIDATION_ERROR_LOCATION,
  ONEMAC_VALIDATION_ERROR_SOURCE,
  ONEMAC_VALIDATION_ERROR_TYPE,
} from "./bigmacValidationErrorContract";
import { publishSmartIngestError } from "./publishSmartIngestError";

const QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123456789012/bigmac-master-queue";

describe("publishSmartIngestError", () => {
  const originalQueueUrl = process.env.BIGMAC_ERROR_QUEUE_URL;
  const originalStage = process.env.stage;

  beforeEach(() => {
    process.env.BIGMAC_ERROR_QUEUE_URL = QUEUE_URL;
    process.env.stage = "main";
    send.mockResolvedValue({});
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T22:00:00.000Z"));
  });

  afterEach(() => {
    process.env.BIGMAC_ERROR_QUEUE_URL = originalQueueUrl;
    process.env.stage = originalStage;
    send.mockReset();
    vi.useRealTimers();
  });

  it("sends the BigMAC validation-error contract to the primary queue", async () => {
    await publishSmartIngestError({
      errorCode: "VALIDATION",
      error: new Error('origin: Invalid literal value, expected "SMART"'),
      topic: "aws.mulesoft.onemac.events",
      topicPartition: "aws.mulesoft.onemac.events-0",
      kafkaKey: "AL-26-0817-0001",
      correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
      payload: { origin: "smart" },
    });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0]?.[0] as { input: Record<string, unknown> };
    expect(command.input.QueueUrl).toBe(QUEUE_URL);
    expect(command.input.QueueUrl).not.toMatch(/dlq/i);
    expect(command.input).not.toHaveProperty("MessageGroupId");
    expect(command.input.MessageAttributes).toEqual({
      source: { DataType: "String", StringValue: ONEMAC_VALIDATION_ERROR_SOURCE },
      errorType: { DataType: "String", StringValue: ONEMAC_VALIDATION_ERROR_TYPE },
      environment: { DataType: "String", StringValue: "dev" },
    });

    const body = JSON.parse(String(command.input.MessageBody)) as Record<string, unknown>;
    expect(body).toMatchObject({
      source: ONEMAC_VALIDATION_ERROR_SOURCE,
      errorType: ONEMAC_VALIDATION_ERROR_TYPE,
      environment: "dev",
      location: ONEMAC_VALIDATION_ERROR_LOCATION,
      nature: "schema-mismatch",
      message: expect.stringContaining("A validation error occurred."),
      occurredAt: "2026-08-24T22:00:00.000Z",
      details: {
        errorCode: "VALIDATION",
        topic: "aws.mulesoft.onemac.events",
        topicPartition: "aws.mulesoft.onemac.events-0",
        kafkaKey: "AL-26-0817-0001",
        correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
        payload: { origin: "smart" },
      },
    });
    expect(String(body.message)).toContain("origin");
  });

  it("redacts creator PII from the payload while preserving ingest details", async () => {
    await publishSmartIngestError({
      errorCode: "VALIDATION",
      error: new Error("authority: Required"),
      topic: "aws.mulesoft.onemac.events",
      topicPartition: "aws.mulesoft.onemac.events-0",
      kafkaKey: "AL-26-0817-0001",
      correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
      payload: {
        id: "AL-26-0817-0001",
        createdByEmail: "alice@example.com",
        createdByName: "Alice Jones",
        createdByUserId: "005cp00000Jqq9HAAR",
      },
    });

    const command = send.mock.calls[0]?.[0] as { input: Record<string, unknown> };
    const body = JSON.parse(String(command.input.MessageBody)) as {
      message: string;
      details: Record<string, unknown>;
    };

    expect(body.message).toContain("authority: Required");
    expect(body.details).toMatchObject({
      errorCode: "VALIDATION",
      topic: "aws.mulesoft.onemac.events",
      kafkaKey: "AL-26-0817-0001",
      correlationId: "fb6c75a4-c545-4f81-bb7b-a2e8609c978f",
      payload: { id: "AL-26-0817-0001" },
    });
    expect(body.details.payload).not.toHaveProperty("createdByEmail");
    expect(body.details.payload).not.toHaveProperty("createdByName");
    expect(body.details.payload).not.toHaveProperty("createdByUserId");
  });

  it("maps BADPARSE to an unparseable-record nature while keeping errorType=validation", async () => {
    await publishSmartIngestError({
      errorCode: "BADPARSE",
      error: new Error("Kafka record contains invalid base64"),
      topicPartition: "aws.mulesoft.onemac.events-0",
      kafkaKey: "AL-26-0817-0001",
      payload: { key: "%%%", topic: "aws.mulesoft.onemac.events" },
    });

    const command = send.mock.calls[0]?.[0] as { input: Record<string, unknown> };
    expect(command.input.QueueUrl).toBe(QUEUE_URL);
    expect(command.input.QueueUrl).not.toMatch(/dlq/i);
    expect(command.input.MessageAttributes).toMatchObject({
      source: { StringValue: ONEMAC_VALIDATION_ERROR_SOURCE },
      errorType: { StringValue: ONEMAC_VALIDATION_ERROR_TYPE },
    });
    const body = JSON.parse(String(command.input.MessageBody)) as Record<string, unknown>;
    expect(body.errorType).toBe(ONEMAC_VALIDATION_ERROR_TYPE);
    expect(body.nature).toBe("unparseable-record");
    expect(body.message).toEqual(
      expect.stringContaining("An error occurred while parsing the record."),
    );
    expect(String(body.message)).toContain("invalid base64");
    expect(body.details).toMatchObject({ errorCode: "BADPARSE" });
  });

  it.each([
    ["val", "val"],
    ["production", "prod"],
    ["main", "dev"],
  ] as const)("labels OneMAC stage %s as BigMAC environment %s", async (stage, environment) => {
    process.env.stage = stage;

    await publishSmartIngestError({
      errorCode: "VALIDATION",
      topicPartition: "aws.mulesoft.onemac.events-0",
    });

    const command = send.mock.calls[0]?.[0] as { input: Record<string, unknown> };
    expect(command.input.MessageAttributes).toMatchObject({
      environment: { DataType: "String", StringValue: environment },
    });
    const body = JSON.parse(String(command.input.MessageBody)) as Record<string, unknown>;
    expect(body.environment).toBe(environment);
  });

  it("skips SendMessage without throwing when the queue URL is missing", async () => {
    delete process.env.BIGMAC_ERROR_QUEUE_URL;

    await expect(
      publishSmartIngestError({
        errorCode: "VALIDATION",
        topicPartition: "aws.mulesoft.onemac.events-0",
        payload: { origin: "smart" },
      }),
    ).resolves.toBeUndefined();

    expect(send).not.toHaveBeenCalled();
  });

  it("rethrows when SQS publish fails", async () => {
    const outage = new Error("SQS unavailable");
    send.mockRejectedValueOnce(outage);

    await expect(
      publishSmartIngestError({
        errorCode: ErrorType.VALIDATION.toUpperCase() as "VALIDATION",
        topicPartition: "aws.mulesoft.onemac.events-0",
        payload: { id: "AL-26-0817-0001" },
      }),
    ).rejects.toThrow(outage);
  });
});
