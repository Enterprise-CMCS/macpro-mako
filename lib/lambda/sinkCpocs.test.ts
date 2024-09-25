import { describe, expect, it, vi } from "vitest";
import { handler as sinkCpocLamda } from "./sinkCpocs";
import * as sinkLib from "../libs/sink-lib";
import { ErrorType } from "../libs/sink-lib";

// key: base64EncodedString and when decoded is a string based id of a record
// value: base64EncodedString and when decoded is a json string with the entire record

// const kafkaRecord: KafkaRecord = {
//   topic: "testprefix--aws.seatool.debezium.cdc.SEA.dbo.Officers-xyz",
//   headers: {},
//   key: Buffer.from("OH-0001.R00.00").toString("base64"),
//   value: Buffer.from(JSON.stringify({})).toString("base64"),
//   offset: 1,
//   partition: 1,
//   timestamp: new Date().getTime(),
//   timestampType: "",
// };

// export function getTopic(topicPartition: string) {
//   return topicPartition.split("--").pop()?.split("-").slice(0, -1)[0];
// }
vi.stubEnv("osDomain", "testDomain");

describe("test sink cpoc", () => {
  it("calls log error when topic is undefined", async () => {
    const logErrorSpy = vi
      .spyOn(sinkLib, "logError")
      .mockImplementation(({ type }: { type: ErrorType }) => {
        console.log({ type });
      });
    try {
      await sinkCpocLamda(
        {
          bootstrapServers: "123",
          eventSource: "",
          records: {
            bad: [],
          },
        },
        {} as any,
        vi.fn(),
      );
    } catch {
      expect(logErrorSpy).toHaveBeenCalledWith({ type: ErrorType.BADTOPIC });
    }
    expect(logErrorSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: ErrorType.UNKNOWN }),
    );
  });

  it("has an empty array set in docs when given one undefined value", () => {
    // spy on the bulkDataUpdateWrapper to determine if this test is true
  });
});
