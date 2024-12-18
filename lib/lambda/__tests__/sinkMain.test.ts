import { describe, it, expect, vi } from "vitest";
import { handler as sinkMainHandler } from "../sinkMain";

vi.mock("../sinkMainProcessors", () => {
  return {
    insertOneMacRecordsFromKafkaIntoMako: vi.fn(() => Promise.resolve()),
    insertNewSeatoolRecordsFromKafkaIntoMako: vi.fn(() => Promise.resolve()),
    syncSeatoolRecordDatesFromKafkaWithMako: vi.fn(() => Promise.resolve())
  };
});

describe("sinkMain handler", () => {
  it("handles empty event gracefully", async () => {
    const event = {
      records: {}
    };
    const res = await sinkMainHandler(event as any, {} as any, () => {});
    expect(res).toBeUndefined();
  });

  it("handles unknown topic gracefully", async () => {
    const event = {
      records: {
        "unknown-topic": [
          {
            key: "base64Key",
            value: "base64Value",
            topic: "unknown-topic",
            partition: 0,
            offset: 0,
            timestamp: Date.now(),
            timestampType: "CREATE_TIME",
            headers: {}
          }
        ]
      }
    };
    await expect(sinkMainHandler(event as any, {} as any, () => {})).rejects.toThrow();
  });
});