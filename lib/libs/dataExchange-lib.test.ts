import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OPENSEARCH_DOMAIN, OPENSEARCH_INDEX_NAMESPACE } from "mocks";
import { DataSinkDirection, DataSinkStatus, DataSinkSource, DataSinkRecordType } from "shared-types";

import * as os from "./opensearch-lib";
import {
  createOutboundEnvelope,
  getDataExchangeConfig,
  storeOutboundEvent,
  updateOutboundStatus,
  OutboundRecordInput,
} from "./dataExchange-lib";

// Mock opensearch-lib
vi.mock("./opensearch-lib", () => ({
  bulkUpdateData: vi.fn().mockResolvedValue(undefined),
  getItem: vi.fn().mockResolvedValue(null),
}));

describe("dataExchange-lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = OPENSEARCH_DOMAIN;
    process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.dataExchangeEndpoint;
    delete process.env.dataExchangeApiKey;
  });

  describe("getDataExchangeConfig", () => {
    it("returns null when endpoint is not configured", () => {
      delete process.env.dataExchangeEndpoint;
      const config = getDataExchangeConfig();
      expect(config).toBeNull();
    });

    it("returns null when endpoint is empty string", () => {
      process.env.dataExchangeEndpoint = "";
      const config = getDataExchangeConfig();
      expect(config).toBeNull();
    });

    it("returns config when endpoint is configured", () => {
      process.env.dataExchangeEndpoint = "https://mulesoft.example.com/dataExchange";
      const config = getDataExchangeConfig();
      expect(config).toEqual({
        endpoint: "https://mulesoft.example.com/dataExchange",
        apiKey: undefined,
        timeoutMs: 30000,
      });
    });

    it("includes apiKey when configured", () => {
      process.env.dataExchangeEndpoint = "https://mulesoft.example.com/dataExchange";
      process.env.dataExchangeApiKey = "test-api-key";
      const config = getDataExchangeConfig();
      expect(config).toEqual({
        endpoint: "https://mulesoft.example.com/dataExchange",
        apiKey: "test-api-key",
        timeoutMs: 30000,
      });
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
});
