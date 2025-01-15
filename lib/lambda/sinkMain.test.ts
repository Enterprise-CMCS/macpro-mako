import { describe, it, expect, vi } from "vitest";
import { handler } from "./sinkMain";
import { Context } from "aws-lambda";
import * as sinkMainProcessors from "./sinkMainProcessors";
import { KafkaEvent } from "shared-types";

const createKafkaEvent = (records: KafkaEvent["records"]) => ({
  eventSource: "SelfManagedKafka",
  bootstrapServers: "kafka",
  records,
});

describe("sinkMain handler", () => {
  it("handles aws.onemac.migration.cdc topic successfully", async () => {
    const spiedOnProcessAndIndex = vi
      .spyOn(sinkMainProcessors, "insertOneMacRecordsFromKafkaIntoMako")
      .mockImplementation(vi.fn());

    await handler(createKafkaEvent({ "aws.onemac.migration.cdc-0": [] }), {} as Context, vi.fn());

    expect(spiedOnProcessAndIndex).toBeCalledWith([], "aws.onemac.migration.cdc-0");
  });

  it("handles aws.seatool.ksql.onemac.three.agg.State_Plan topic successfully", async () => {
    const spiedOnProcessAndIndex = vi
      .spyOn(sinkMainProcessors, "insertNewSeatoolRecordsFromKafkaIntoMako")
      .mockImplementation(vi.fn());

    await handler(
      createKafkaEvent({ "aws.seatool.ksql.onemac.three.agg.State_Plan-0": [] }),
      {} as Context,
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
      {} as Context,
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
    ).rejects.toThrowError("topic (invalid-topic-partition) is invalid");
  });
});
