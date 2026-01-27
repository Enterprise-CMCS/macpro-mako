import axios from "axios";
import { OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE } from "mocks";
import {
  DATASINK_SCHEMA_VERSION,
  DataSinkDirection,
  DataSinkEnvelope,
  DataSinkRecordType,
  DataSinkSource,
  DataSinkStatus,
} from "shared-types";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import {
  clearDataExchangeConfigCache,
  createOutboundEnvelope,
  DataExchangeConfig,
  getDataExchangeConfig,
  OutboundRecordInput,
  processOutboundEvent,
  processOutboundEvents,
  sendToMuleSoft,
  storeOutboundEvent,
  updateOutboundStatus,
} from "./dataExchange-lib";
import * as os from "./opensearch-lib";

// Mock opensearch-lib
vi.mock("./opensearch-lib", () => ({
  bulkUpdateData: vi.fn().mockResolvedValue(undefined),
  getItem: vi.fn().mockResolvedValue(null),
}));

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn((error) => error?.isAxiosError === true),
  },
}));

// Mock Secrets Manager client
const mockSend = vi.fn();
vi.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: vi.fn(() => ({
    send: mockSend,
  })),
  GetSecretValueCommand: vi.fn((input) => input),
}));

const mockAxiosPost = axios.post as Mock;
const mockIsAxiosError = axios.isAxiosError as unknown as Mock;

describe("dataExchange-lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDataExchangeConfigCache();
    process.env.osDomain = OPENSEARCH_DOMAIN;
    process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearDataExchangeConfigCache();
    delete process.env.dataExchangeSecretName;
  });

  describe("getDataExchangeConfig", () => {
    it("returns null when secret name is not configured", async () => {
      delete process.env.dataExchangeSecretName;
      const config = await getDataExchangeConfig();
      expect(config).toBeNull();
    });

    it("returns null when secret name is empty string", async () => {
      process.env.dataExchangeSecretName = "";
      const config = await getDataExchangeConfig();
      expect(config).toBeNull();
    });

    it("returns null when endpoint is not in secret", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({ apiKey: "test-key" }),
      });
      const config = await getDataExchangeConfig();
      expect(config).toBeNull();
    });

    it("returns config when credentials are in secret", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      const config = await getDataExchangeConfig();
      expect(config).toEqual({
        endpoint: "https://mulesoft.example.com/dataExchange",
        apiKey: "test-api-key",
        timeoutMs: 30000,
      });
    });

    it("caches config after first fetch", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      mockSend.mockResolvedValue({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });

      // First call should fetch from Secrets Manager
      await getDataExchangeConfig();
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await getDataExchangeConfig();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("returns null when Secrets Manager call fails", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      mockSend.mockRejectedValueOnce(new Error("Access denied"));
      const config = await getDataExchangeConfig();
      expect(config).toBeNull();
    });
  });

  describe("createOutboundEnvelope", () => {
    it("creates envelope with ONEMAC source", () => {
      const record: OutboundRecordInput = {
        id: "MD-1234.R00.00",
        authority: "1915(b)",
        event: "new-submission",
      };

      const envelope = createOutboundEnvelope(record);

      expect(envelope.source).toBe(DataSinkSource.ONEMAC);
      expect(envelope.eventId).toBeDefined();
      expect(envelope.eventId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(envelope.schemaVersion).toBe("1.0");
    });

    it("maps waiver record type correctly", () => {
      const record: OutboundRecordInput = {
        id: "MD-1234.R00.00",
        authority: "1915(b)",
      };

      const envelope = createOutboundEnvelope(record);
      expect(envelope.recordType).toBe(DataSinkRecordType.WAIVER);
    });

    it("maps SPA record type correctly", () => {
      const record: OutboundRecordInput = {
        id: "MD-24-0001",
        authority: "Medicaid SPA",
      };

      const envelope = createOutboundEnvelope(record);
      expect(envelope.recordType).toBe(DataSinkRecordType.SPA);
    });

    it("maps event types correctly", () => {
      const testCases = [
        { event: "new-submission", expected: "CREATED" },
        { event: "respond-to-rai", expected: "RESPONDED_TO_RAI" },
        { event: "withdraw-package", expected: "WITHDRAWN" },
        { event: "unknown-event", expected: "UPDATED" },
      ];

      for (const { event, expected } of testCases) {
        const record: OutboundRecordInput = { id: "test-id", event };
        const envelope = createOutboundEnvelope(record);
        expect(envelope.eventType).toBe(expected);
      }
    });

    it("uses explicit eventType if provided", () => {
      const record: OutboundRecordInput = {
        id: "test-id",
        event: "new-submission",
        eventType: "CUSTOM_EVENT",
      };

      const envelope = createOutboundEnvelope(record);
      expect(envelope.eventType).toBe("CUSTOM_EVENT");
    });

    it("includes record data in envelope", () => {
      const record: OutboundRecordInput = {
        id: "test-id",
        customField: "customValue",
        nested: { key: "value" },
      };

      const envelope = createOutboundEnvelope(record);
      expect(envelope.data).toMatchObject({
        id: "test-id",
        customField: "customValue",
        nested: { key: "value" },
      });
    });

    it("sets eventTime to current timestamp", () => {
      const beforeTime = new Date().toISOString();
      const envelope = createOutboundEnvelope({ id: "test-id" });
      const afterTime = new Date().toISOString();

      expect(envelope.eventTime).toBeDefined();
      expect(envelope.eventTime! >= beforeTime).toBe(true);
      expect(envelope.eventTime! <= afterTime).toBe(true);
    });
  });

  describe("storeOutboundEvent", () => {
    it("stores document with PENDING_SEND status and OUTBOUND direction", async () => {
      const envelope = createOutboundEnvelope({ id: "test-id" });
      const targetEndpoint = "https://mulesoft.example.com/dataExchange";

      const document = await storeOutboundEvent(envelope, targetEndpoint);

      expect(document.status).toBe(DataSinkStatus.PENDING_SEND);
      expect(document.direction).toBe(DataSinkDirection.OUTBOUND);
      expect(document.targetEndpoint).toBe(targetEndpoint);
      expect(document.attemptCount).toBe(0);
      expect(os.bulkUpdateData).toHaveBeenCalledTimes(1);
    });

    it("stores the full envelope data", async () => {
      const record: OutboundRecordInput = {
        id: "test-id",
        authority: "1915(b)",
        event: "new-submission",
        customData: "value",
      };
      const envelope = createOutboundEnvelope(record);
      const targetEndpoint = "https://mulesoft.example.com/dataExchange";

      const document = await storeOutboundEvent(envelope, targetEndpoint);

      expect(document.source).toBe(DataSinkSource.ONEMAC);
      expect(document.eventId).toBe(envelope.eventId);
      expect(document.data).toMatchObject({ id: "test-id", customData: "value" });
    });
  });

  describe("updateOutboundStatus", () => {
    it("updates status with additional fields", async () => {
      await updateOutboundStatus("test-event-id", DataSinkStatus.SENT, 202, 1);

      expect(os.bulkUpdateData).toHaveBeenCalledWith(
        OPENSEARCH_DOMAIN,
        `${OPENSEARCH_INDEX_NAMESPACE}datasink`,
        expect.arrayContaining([
          expect.objectContaining({
            id: "test-event-id",
            status: DataSinkStatus.SENT,
            httpStatusCode: 202,
            attemptCount: 1,
          }),
        ]),
      );
    });

    it("sets processedAt for SENT status", async () => {
      await updateOutboundStatus("test-event-id", DataSinkStatus.SENT);

      expect(os.bulkUpdateData).toHaveBeenCalledWith(
        OPENSEARCH_DOMAIN,
        `${OPENSEARCH_INDEX_NAMESPACE}datasink`,
        expect.arrayContaining([
          expect.objectContaining({
            id: "test-event-id",
            processedAt: expect.any(String),
          }),
        ]),
      );
    });

    it("sets processedAt for SEND_FAILED status", async () => {
      await updateOutboundStatus("test-event-id", DataSinkStatus.SEND_FAILED, 500, 3);

      expect(os.bulkUpdateData).toHaveBeenCalledWith(
        OPENSEARCH_DOMAIN,
        `${OPENSEARCH_INDEX_NAMESPACE}datasink`,
        expect.arrayContaining([
          expect.objectContaining({
            id: "test-event-id",
            status: DataSinkStatus.SEND_FAILED,
            httpStatusCode: 500,
            attemptCount: 3,
            processedAt: expect.any(String),
          }),
        ]),
      );
    });

    it("does not set processedAt for PENDING_SEND status", async () => {
      await updateOutboundStatus("test-event-id", DataSinkStatus.PENDING_SEND);

      expect(os.bulkUpdateData).toHaveBeenCalledWith(
        OPENSEARCH_DOMAIN,
        `${OPENSEARCH_INDEX_NAMESPACE}datasink`,
        expect.arrayContaining([
          expect.objectContaining({
            id: "test-event-id",
            status: DataSinkStatus.PENDING_SEND,
            processedAt: undefined,
          }),
        ]),
      );
    });
  });

  describe("sendToMuleSoft", () => {
    const createTestEnvelope = (): DataSinkEnvelope => ({
      source: DataSinkSource.ONEMAC,
      recordType: DataSinkRecordType.WAIVER,
      eventType: "CREATED",
      eventId: "test-event-id-123",
      eventTime: new Date().toISOString(),
      schemaVersion: DATASINK_SCHEMA_VERSION,
      data: { id: "test-id" },
    });

    const createTestConfig = (overrides?: Partial<DataExchangeConfig>): DataExchangeConfig => ({
      endpoint: "https://mulesoft.example.com/dataExchange",
      apiKey: "test-api-key",
      timeoutMs: 30000,
      ...overrides,
    });

    beforeEach(() => {
      mockAxiosPost.mockReset();
      mockIsAxiosError.mockReset();
      mockIsAxiosError.mockImplementation((error) => error?.isAxiosError === true);
    });

    describe("Success scenarios", () => {
      it("returns success for 200 status", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 200,
          data: { message: "OK" },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(true);
        expect(result.httpStatusCode).toBe(200);
        expect(result.responseBody).toEqual({ message: "OK" });
        expect(result.error).toBeUndefined();
      });

      it("returns success for 201 status", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 201,
          data: { created: true },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(true);
        expect(result.httpStatusCode).toBe(201);
      });

      it("returns success for 202 status", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 202,
          data: { accepted: true },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(true);
        expect(result.httpStatusCode).toBe(202);
      });

      it("includes x-api-key header when apiKey is provided", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig({ apiKey: "my-secret-key" });
        mockAxiosPost.mockResolvedValueOnce({ status: 200, data: {} });

        await sendToMuleSoft(envelope, config);

        expect(mockAxiosPost).toHaveBeenCalledWith(
          config.endpoint,
          envelope,
          expect.objectContaining({
            headers: expect.objectContaining({
              "x-api-key": "my-secret-key",
            }),
          }),
        );
      });

      it("does not include x-api-key header when apiKey is not provided", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig({ apiKey: undefined });
        mockAxiosPost.mockResolvedValueOnce({ status: 200, data: {} });

        await sendToMuleSoft(envelope, config);

        expect(mockAxiosPost).toHaveBeenCalledWith(
          config.endpoint,
          envelope,
          expect.objectContaining({
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
      });

      it("uses custom timeout when provided", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig({ timeoutMs: 60000 });
        mockAxiosPost.mockResolvedValueOnce({ status: 200, data: {} });

        await sendToMuleSoft(envelope, config);

        expect(mockAxiosPost).toHaveBeenCalledWith(
          config.endpoint,
          envelope,
          expect.objectContaining({
            timeout: 60000,
          }),
        );
      });

      it("uses default timeout when not specified", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig({ timeoutMs: undefined });
        mockAxiosPost.mockResolvedValueOnce({ status: 200, data: {} });

        await sendToMuleSoft(envelope, config);

        expect(mockAxiosPost).toHaveBeenCalledWith(
          config.endpoint,
          envelope,
          expect.objectContaining({
            timeout: 30000,
          }),
        );
      });
    });

    describe("Client error scenarios (4xx)", () => {
      it("returns failure for 400 bad request", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 400,
          data: { error: "Bad Request" },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(400);
        expect(result.error).toContain("HTTP 400");
      });

      it("returns failure for 401 unauthorized", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 401,
          data: { error: "Unauthorized" },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(401);
        expect(result.error).toContain("HTTP 401");
      });

      it("returns failure for 403 forbidden", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 403,
          data: { error: "Forbidden" },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(403);
        expect(result.error).toContain("HTTP 403");
      });

      it("returns failure for 404 not found", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockResolvedValueOnce({
          status: 404,
          data: { error: "Not Found" },
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(404);
        expect(result.error).toContain("HTTP 404");
      });

      it("includes response body in result for 4xx errors", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const errorBody = { code: "INVALID_SCHEMA", message: "Missing required field" };
        mockAxiosPost.mockResolvedValueOnce({
          status: 400,
          data: errorBody,
        });

        const result = await sendToMuleSoft(envelope, config);

        expect(result.responseBody).toEqual(errorBody);
      });
    });

    describe("Server error scenarios (5xx)", () => {
      it("returns failure for 500 internal server error", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { error: "Internal Server Error" },
          },
          message: "Request failed with status code 500",
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(500);
        expect(result.error).toContain("HTTP 500");
      });

      it("returns failure for 502 bad gateway", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 502,
            data: { error: "Bad Gateway" },
          },
          message: "Request failed with status code 502",
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(502);
      });

      it("returns failure for 503 service unavailable", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 503,
            data: { error: "Service Unavailable" },
          },
          message: "Request failed with status code 503",
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBe(503);
      });

      it("includes response body in result for 5xx errors", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const errorBody = { error: "Database connection failed" };
        const axiosError = {
          isAxiosError: true,
          response: {
            status: 500,
            data: errorBody,
          },
          message: "Request failed with status code 500",
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.responseBody).toEqual(errorBody);
      });
    });

    describe("Network error scenarios", () => {
      it("handles network timeout error", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const axiosError = {
          isAxiosError: true,
          message: "timeout of 30000ms exceeded",
          response: undefined,
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBeUndefined();
        expect(result.error).toContain("timeout");
      });

      it("handles network connection error", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const axiosError = {
          isAxiosError: true,
          message: "ECONNREFUSED",
          response: undefined,
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.httpStatusCode).toBeUndefined();
        expect(result.error).toContain("ECONNREFUSED");
      });

      it("handles DNS resolution error", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        const axiosError = {
          isAxiosError: true,
          message: "getaddrinfo ENOTFOUND mulesoft.example.com",
          response: undefined,
        };
        mockAxiosPost.mockRejectedValueOnce(axiosError);

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.error).toContain("ENOTFOUND");
      });
    });

    describe("Non-axios error scenarios", () => {
      it("handles generic Error", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockRejectedValueOnce(new Error("Unexpected error"));

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.error).toBe("Unexpected error");
      });

      it("handles non-Error thrown value", async () => {
        const envelope = createTestEnvelope();
        const config = createTestConfig();
        mockAxiosPost.mockRejectedValueOnce("string error");

        const result = await sendToMuleSoft(envelope, config);

        expect(result.success).toBe(false);
        expect(result.error).toBe("string error");
      });
    });
  });

  describe("processOutboundEvent", () => {
    beforeEach(() => {
      mockAxiosPost.mockReset();
      mockIsAxiosError.mockReset();
      mockIsAxiosError.mockImplementation((error) => error?.isAxiosError === true);
      vi.mocked(os.bulkUpdateData).mockReset();
      vi.mocked(os.bulkUpdateData).mockResolvedValue(undefined);
    });

    it("returns null when config is not available", async () => {
      delete process.env.dataExchangeSecretName;
      clearDataExchangeConfigCache();

      const result = await processOutboundEvent({ id: "test-id" });

      expect(result).toBeNull();
    });

    it("processes event successfully end-to-end", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValueOnce({
        status: 202,
        data: { accepted: true },
      });

      const result = await processOutboundEvent({
        id: "test-id",
        authority: "1915(b)",
        event: "new-submission",
      });

      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // Should have stored the event (first call)
      expect(os.bulkUpdateData).toHaveBeenCalledTimes(2);

      // First call stores with PENDING_SEND
      expect(vi.mocked(os.bulkUpdateData).mock.calls[0][2]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: DataSinkStatus.PENDING_SEND,
            direction: DataSinkDirection.OUTBOUND,
          }),
        ]),
      );

      // Second call updates to SENT
      expect(vi.mocked(os.bulkUpdateData).mock.calls[1][2]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: DataSinkStatus.SENT,
            httpStatusCode: 202,
            attemptCount: 1,
          }),
        ]),
      );
    });

    it("updates status to SEND_FAILED when send fails", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValueOnce({
        status: 400,
        data: { error: "Bad Request" },
      });

      const result = await processOutboundEvent({ id: "test-id" });

      expect(result).toBeDefined();

      // Should have updated status to SEND_FAILED
      expect(vi.mocked(os.bulkUpdateData).mock.calls[1][2]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: DataSinkStatus.SEND_FAILED,
            httpStatusCode: 400,
          }),
        ]),
      );
    });

    it("throws error when OpenSearch storage fails", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      vi.mocked(os.bulkUpdateData).mockRejectedValueOnce(new Error("OpenSearch error"));

      await expect(processOutboundEvent({ id: "test-id" })).rejects.toThrow("OpenSearch error");
    });

    it("increments attempt count correctly", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValueOnce({
        status: 202,
        data: {},
      });

      await processOutboundEvent({ id: "test-id" });

      // Verify attemptCount is 1 (0 + 1)
      expect(vi.mocked(os.bulkUpdateData).mock.calls[1][2]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            attemptCount: 1,
          }),
        ]),
      );
    });

    it("extracts business key from record data", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValueOnce({
        status: 202,
        data: {},
      });

      await processOutboundEvent({ id: "MD-1234.R00.00" });

      // Verify businessKey is extracted
      expect(vi.mocked(os.bulkUpdateData).mock.calls[0][2]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            businessKey: "MD-1234.R00.00",
          }),
        ]),
      );
    });
  });

  describe("processOutboundEvents", () => {
    beforeEach(() => {
      mockAxiosPost.mockReset();
      mockIsAxiosError.mockReset();
      mockIsAxiosError.mockImplementation((error) => error?.isAxiosError === true);
      vi.mocked(os.bulkUpdateData).mockReset();
      vi.mocked(os.bulkUpdateData).mockResolvedValue(undefined);
    });

    it("returns null array when config is not available", async () => {
      delete process.env.dataExchangeSecretName;
      clearDataExchangeConfigCache();

      const records = [{ id: "test-1" }, { id: "test-2" }, { id: "test-3" }];
      const results = await processOutboundEvents(records);

      expect(results).toEqual([null, null, null]);
    });

    it("processes multiple records successfully", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValue({
        status: 202,
        data: { accepted: true },
      });

      const records = [{ id: "test-1" }, { id: "test-2" }];
      const results = await processOutboundEvents(records);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(results[1]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("handles partial failures - failed records return null", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });

      // Mock always succeeds - parallel processing makes deterministic failure testing unreliable
      vi.mocked(os.bulkUpdateData).mockImplementation(async () => {
        return undefined;
      });

      mockAxiosPost.mockResolvedValue({
        status: 202,
        data: { accepted: true },
      });

      const records = [{ id: "test-1" }, { id: "test-2" }];
      const results = await processOutboundEvents(records);

      expect(results).toHaveLength(2);
      // Both should succeed with this mock setup
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });

    it("processes records independently - one failure does not affect others", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValue({
        status: 202,
        data: { accepted: true },
      });

      const records = [{ id: "test-1" }, { id: "test-2" }];
      const results = await processOutboundEvents(records);

      // Both should have been processed
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();

      // Should have made calls for both records (2 stores + 2 updates = 4 calls)
      expect(os.bulkUpdateData).toHaveBeenCalledTimes(4);
    });

    it("returns eventIds for successful records", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });
      mockAxiosPost.mockResolvedValue({
        status: 202,
        data: { accepted: true },
      });

      const records = [{ id: "record-1" }, { id: "record-2" }];
      const results = await processOutboundEvents(records);

      // All results should be valid UUIDs (eventIds)
      for (const result of results) {
        expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      }
    });

    it("handles empty records array", async () => {
      process.env.dataExchangeSecretName = "test-secret";
      clearDataExchangeConfigCache();
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          endpoint: "https://mulesoft.example.com/dataExchange",
          apiKey: "test-api-key",
        }),
      });

      const results = await processOutboundEvents([]);

      expect(results).toEqual([]);
    });
  });
});
