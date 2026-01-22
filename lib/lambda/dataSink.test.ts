import { APIGatewayProxyEvent } from "aws-lambda";
import { beforeEach, describe, expect, it, vi, Mock } from "vitest";

import { handler, resetKafkaProducer } from "./dataSink";
import * as dataSinkLib from "../libs/dataSink-lib";
import {
  DataSinkEnvelope,
  DataSinkErrorCode,
  DATASINK_SCHEMA_VERSION,
  IdempotencyRecord,
} from "shared-types";

// Mock the dataSink-lib module
vi.mock("../libs/dataSink-lib", () => ({
  checkIdempotency: vi.fn(),
  updateIdempotencyStatus: vi.fn(),
  resetDynamoClient: vi.fn(),
}));

// Mock kafkajs
vi.mock("kafkajs", () => ({
  Kafka: vi.fn(() => ({
    producer: vi.fn(() => ({
      connect: vi.fn(),
      send: vi.fn(() => Promise.resolve([{ partition: 0, offset: "1" }])),
      disconnect: vi.fn(),
    })),
  })),
}));

const mockCheckIdempotency = dataSinkLib.checkIdempotency as Mock;
const mockUpdateIdempotencyStatus = dataSinkLib.updateIdempotencyStatus as Mock;

/**
 * Helper to create a valid DataSink envelope
 */
function createValidEnvelope(overrides: Partial<DataSinkEnvelope> = {}): DataSinkEnvelope {
  return {
    source: "SMART",
    recordType: "WAIVER",
    eventType: "ISSUED_RAI",
    eventId: "c0a8012e-7b6f-4c2f-a9b1-8fdc1cbb2b4a",
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
}

/**
 * Helper to create an API Gateway event
 */
function createApiEvent(body: unknown): APIGatewayProxyEvent {
  return {
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": "test-api-key",
    },
    httpMethod: "POST",
    path: "/dataSink",
    pathParameters: null,
    queryStringParameters: null,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: "123456789012",
      apiId: "test-api-id",
      authorizer: null,
      protocol: "HTTP/1.1",
      httpMethod: "POST",
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: "127.0.0.1",
        user: null,
        userAgent: "test-agent",
        userArn: null,
      },
      path: "/dataSink",
      stage: "test",
      requestId: "test-request-id",
      requestTimeEpoch: Date.now(),
      resourceId: "test-resource-id",
      resourcePath: "/dataSink",
    },
    resource: "/dataSink",
    isBase64Encoded: false,
  };
}

/**
 * Helper to create an idempotency record
 */
function createIdempotencyRecord(
  envelope: DataSinkEnvelope,
  status: IdempotencyRecord["status"] = "RECEIVED",
): IdempotencyRecord {
  return {
    eventId: envelope.eventId,
    receivedAt: new Date().toISOString(),
    status,
    source: envelope.source,
    recordType: envelope.recordType,
    eventType: envelope.eventType,
    correlationId: envelope.correlationId,
    expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };
}

describe("dataSink Lambda handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetKafkaProducer();

    // Set required environment variables
    process.env.idempotencyTableName = "test-idempotency-table";
    process.env.smartTopicName = "test-smart-topic";
    process.env.brokerString = "localhost:9092";
  });

  describe("Request validation", () => {
    it("should return 400 when body is missing", async () => {
      const event = createApiEvent("");
      event.body = null;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.VALIDATION_ERROR);
      expect(body.error.message).toContain("body is required");
    });

    it("should return 413 when payload is too large", async () => {
      const largeData = "x".repeat(201 * 1024); // > 200KB
      const event = createApiEvent(largeData);

      const result = await handler(event);

      expect(result.statusCode).toBe(413);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.PAYLOAD_TOO_LARGE);
    });

    it("should return 400 when body is invalid JSON", async () => {
      const event = createApiEvent("not valid json {");

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.PARSE_ERROR);
      expect(body.error.message).toContain("Invalid JSON");
    });

    it("should return 400 when source is missing", async () => {
      const envelope = createValidEnvelope();
      // @ts-expect-error - intentionally removing source
      delete envelope.source;
      const event = createApiEvent(envelope);

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.VALIDATION_ERROR);
      expect(body.error.message).toContain("source");
    });

    it("should return 400 when eventId is missing", async () => {
      const envelope = createValidEnvelope();
      // @ts-expect-error - intentionally removing eventId
      delete envelope.eventId;
      const event = createApiEvent(envelope);

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.VALIDATION_ERROR);
      expect(body.error.message).toContain("eventId");
    });

    it("should return 400 when eventId is not a valid UUID", async () => {
      const envelope = createValidEnvelope({ eventId: "not-a-uuid" });
      const event = createApiEvent(envelope);

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.VALIDATION_ERROR);
    });

    it("should return 400 when schemaVersion is not 1.0", async () => {
      const envelope = createValidEnvelope();
      // @ts-expect-error - intentionally setting wrong version
      envelope.schemaVersion = "2.0";
      const event = createApiEvent(envelope);

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.VALIDATION_ERROR);
    });

    it("should return 400 when recordType is invalid", async () => {
      const envelope = createValidEnvelope();
      // @ts-expect-error - intentionally setting invalid recordType
      envelope.recordType = "INVALID";
      const event = createApiEvent(envelope);

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.VALIDATION_ERROR);
    });
  });

  describe("Idempotency handling", () => {
    it("should return 202 with message when duplicate event is detected", async () => {
      const envelope = createValidEnvelope();
      const existingRecord = createIdempotencyRecord(envelope, "PUBLISHED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: true,
        record: existingRecord,
      });

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(202);
      const body = JSON.parse(result.body);
      expect(body.eventId).toBe(envelope.eventId);
      expect(body.correlationId).toBe(envelope.correlationId);
      expect(body.data.message).toBe("Event previously received");
      expect(body.data.originalReceivedAt).toBeDefined();

      // Should not attempt to update status for duplicate
      expect(mockUpdateIdempotencyStatus).not.toHaveBeenCalled();
    });

    it("should return 503 when DynamoDB idempotency check fails", async () => {
      const envelope = createValidEnvelope();

      mockCheckIdempotency.mockRejectedValueOnce(new Error("DynamoDB error"));

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(503);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.SERVICE_UNAVAILABLE);
      expect(body.error.message).toContain("Idempotency service");
    });
  });

  describe("Successful event processing", () => {
    it("should return 202 and publish to Kafka for new event", async () => {
      const envelope = createValidEnvelope();
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });
      mockUpdateIdempotencyStatus.mockResolvedValueOnce(undefined);

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(202);
      const body = JSON.parse(result.body);
      expect(body.eventId).toBe(envelope.eventId);
      expect(body.correlationId).toBe(envelope.correlationId);
      expect(body.schemaVersion).toBe(DATASINK_SCHEMA_VERSION);
      expect(body.data.message).toBe("Event accepted for processing");

      // Should update status to PUBLISHED
      expect(mockUpdateIdempotencyStatus).toHaveBeenCalledWith(envelope.eventId, "PUBLISHED");
    });

    it("should process event without correlationId", async () => {
      const envelope = createValidEnvelope({ correlationId: undefined });
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });
      mockUpdateIdempotencyStatus.mockResolvedValueOnce(undefined);

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(202);
      const body = JSON.parse(result.body);
      expect(body.eventId).toBe(envelope.eventId);
      expect(body.correlationId).toBeUndefined();
    });

    it("should process SPA recordType", async () => {
      const envelope = createValidEnvelope({ recordType: "SPA" });
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });
      mockUpdateIdempotencyStatus.mockResolvedValueOnce(undefined);

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(202);
    });

    it("should process ONEMAC source", async () => {
      const envelope = createValidEnvelope({ source: "ONEMAC" });
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });
      mockUpdateIdempotencyStatus.mockResolvedValueOnce(undefined);

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(202);
    });
  });

  describe("Error scenarios", () => {
    it("should return 503 when Kafka publish fails", async () => {
      const envelope = createValidEnvelope();
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });

      // Force Kafka to fail by not setting brokerString
      delete process.env.brokerString;

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(503);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe(DataSinkErrorCode.SERVICE_UNAVAILABLE);
      expect(body.error.message).toContain("publishing service");

      // Should update status to FAILED
      expect(mockUpdateIdempotencyStatus).toHaveBeenCalledWith(envelope.eventId, "FAILED");
    });

    it("should include correlationId in error response when available", async () => {
      const envelope = createValidEnvelope();

      mockCheckIdempotency.mockRejectedValueOnce(new Error("DynamoDB error"));

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.statusCode).toBe(503);
      const body = JSON.parse(result.body);
      expect(body.correlationId).toBe(envelope.correlationId);
    });
  });

  describe("Response format", () => {
    it("should include CORS headers in response", async () => {
      const envelope = createValidEnvelope();
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });
      mockUpdateIdempotencyStatus.mockResolvedValueOnce(undefined);

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(result.headers).toBeDefined();
      expect(result.headers!["Access-Control-Allow-Origin"]).toBe("*");
      expect(result.headers!["Access-Control-Allow-Methods"]).toContain("POST");
      expect(result.headers!["Content-Type"]).toBe("application/json");
    });

    it("should return valid JSON in response body", async () => {
      const envelope = createValidEnvelope();
      const newRecord = createIdempotencyRecord(envelope, "RECEIVED");

      mockCheckIdempotency.mockResolvedValueOnce({
        isDuplicate: false,
        record: newRecord,
      });
      mockUpdateIdempotencyStatus.mockResolvedValueOnce(undefined);

      const event = createApiEvent(envelope);
      const result = await handler(event);

      expect(() => JSON.parse(result.body)).not.toThrow();
    });
  });
});
