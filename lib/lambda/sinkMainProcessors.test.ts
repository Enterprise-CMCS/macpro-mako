import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertOneMacRecordsFromKafkaIntoMako } from "./sinkMainProcessors";
import * as sinkLib from "../libs/sink-lib";

describe("insertOneMacRecordsFromKafkaIntoMako", () => {
  const mockBulkUpdateDataWrapper = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(sinkLib, "bulkUpdateDataWrapper").mockImplementation(mockBulkUpdateDataWrapper);
  });

  it("should process a valid OneMAC event", async () => {
    await insertOneMacRecordsFromKafkaIntoMako(
      [
        {
          key: Buffer.from("id").toString("base64"),
          value: Buffer.from(
            JSON.stringify({
              event: "new-medicaid-submission",
              origin: "mako",
              id: "CO-1234",
              makoChangedDate: "2024-10-01T00:00:00Z",
            }),
          ).toString("base64"),
          timestamp: Date.now(),
          offset: 0,
          topic: "aws.onemac.migration.cdc",
          partition: 0,
          timestampType: "CREATE_TIME",
          headers: {},
        },
      ],
      "topic",
    );

    expect(mockBulkUpdateDataWrapper).toHaveBeenCalledWith(expect.any(Array), "main");
  });
});
