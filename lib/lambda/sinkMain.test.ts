import { describe, it, expect, vi, afterEach } from "vitest";
import { handler } from "./sinkMain";
import * as sinkMainProcessors from "./sinkMainProcessors";
import { KafkaEvent } from "lib/packages/shared-types";

const createKafkaEvent = (records: KafkaEvent["records"]) => ({
  eventSource: "SelfManagedKafka",
  bootstrapServers: "kafka",
  records,
});

describe("sinkMain handler", () => {
  vi.stubEnv("osDomain", "os-domain");
  vi.stubEnv("indexNamespace", "index-namespace");

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("handles aws.onemac.migration.cdc topic successfully", async () => {
    const spiedOnProcessAndIndex = vi
      .spyOn(sinkMainProcessors, "insertOneMacRecordsFromKafkaIntoMako")
      .mockImplementation(vi.fn());

    await handler(
      createKafkaEvent({ "aws.onemac.migration.cdc-0": [] }),
      expect.anything(),
      vi.fn(),
    );

    expect(spiedOnProcessAndIndex).toBeCalledWith([], "aws.onemac.migration.cdc-0");
  });

  it("handles aws.seatool.ksql.onemac.three.agg.State_Plan topic successfully", async () => {
    const spiedOnProcessAndIndex = vi
      .spyOn(sinkMainProcessors, "insertNewSeatoolRecordsFromKafkaIntoMako")
      .mockImplementation(vi.fn());

    await handler(
      createKafkaEvent({ "aws.seatool.ksql.onemac.three.agg.State_Plan-0": [] }),
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
      .spyOn(sinkMainProcessors, "syncSeatoolRecordDatesFromKafkaWithMako")
      .mockImplementation(vi.fn());

    await handler(
      createKafkaEvent({ "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan-0": [] }),
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
      handler(createKafkaEvent({ "invalid-topic-partition": [] }), expect.anything(), vi.fn()),
    ).rejects.toThrowError("Unsupported topic: invalid");
  });
});
