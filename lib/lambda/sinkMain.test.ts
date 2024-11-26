import { describe, it, expect, vi, afterEach } from "vitest";
import { handler } from "./sinkMain";
import * as sinkMainProcessors from "./sinkMainProcessors";

describe("sinkMain handler", () => {
  vi.stubEnv("osDomain", "os-domain");
  vi.stubEnv("indexNamespace", "index-namespace");

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("handles aws.onemac.migration.cdc topic successfully", async () => {
    const spiedOnProcessAndIndex = vi
      .spyOn(sinkMainProcessors, "processAndIndex")
      .mockImplementation(vi.fn());

    await handler(
      {
        eventSource: "SelfManagedKafka",
        bootstrapServers: "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
        records: { "aws.onemac.migration.cdc-0": [] },
      },
      expect.anything(),
      vi.fn(),
    );

    expect(spiedOnProcessAndIndex).toBeCalledWith({
      kafkaRecords: [],
      topicPartition: "aws.onemac.migration.cdc-0",
      transforms: expect.any(Object),
    });
  });

  it("handles aws.seatool.ksql.onemac.three.agg.State_Plan topic successfully", async () => {
    const spiedOnProcessAndIndex = vi.spyOn(sinkMainProcessors, "ksql").mockImplementation(vi.fn());

    await handler(
      {
        eventSource: "SelfManagedKafka",
        bootstrapServers: "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
        records: { "aws.seatool.ksql.onemac.three.agg.State_Plan-0": [] },
      },
      expect.anything(),
      vi.fn(),
    );

    expect(spiedOnProcessAndIndex).toBeCalledWith(
      [],
      "aws.seatool.ksql.onemac.three.agg.State_Plan-0",
    );
  });

  it("handles aws.seatool.debezium.changed_date.SEA.dbo.State_Plan topic successfully", async () => {
    const spiedOnProcessAndIndex = vi
      .spyOn(sinkMainProcessors, "changed_date")
      .mockImplementation(vi.fn());

    await handler(
      {
        eventSource: "SelfManagedKafka",
        bootstrapServers: "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
        records: { "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan-0": [] },
      },
      expect.anything(),
      vi.fn(),
    );

    expect(spiedOnProcessAndIndex).toBeCalledWith(
      [],
      "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan-0",
    );
  });

  it("throws error with invalid topic partition", async () => {
    await expect(
      handler(
        {
          eventSource: "SelfManagedKafka",
          bootstrapServers: "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
          records: { "invalid-topic-partition": [] },
        },
        expect.anything(),
        vi.fn(),
      ),
    ).rejects.toThrowError("topic (invalid-topic-partition) is invalid");
  });
});
