import { describe, it, expect, vi } from "vitest";
import { insertOneMacRecordsFromKafkaIntoMako } from "../sinkMainProcessors";

vi.mock("../../libs/sink-lib", () => {
  return {
    logError: vi.fn(),
    bulkUpdateDataWrapper: vi.fn(() => Promise.resolve())
  };
});

describe("sinkMainProcessors", () => {
  it("should skip records without value", async () => {
    await insertOneMacRecordsFromKafkaIntoMako([
      {
        key: "abc",
        value: "",
        timestamp: Date.now(),
        offset: 0,
        topic: "aws.onemac.migration.cdc",
        partition: 0,
        timestampType: "CREATE_TIME",
        headers: {}
      }
    ], "topic");
    // no throws is good
    expect(true).toBe(true);
  });

  it("should process a valid OneMAC event", async () => {
    await insertOneMacRecordsFromKafkaIntoMako([
      {
        key: Buffer.from("id").toString("base64"),
        value: Buffer.from(JSON.stringify({
          event: "new-medicaid-submission",
          origin: "mako",
          id: "CO-1234",
          makoChangedDate: "2024-10-01T00:00:00Z"
        })).toString("base64"),
        timestamp: Date.now(),
        offset: 0,
        topic: "aws.onemac.migration.cdc",
        partition: 0,
        timestampType: "CREATE_TIME",
        headers: {}
      }
    ], "topic");
    // Check that no error is thrown
    expect(true).toBe(true);
  });
});