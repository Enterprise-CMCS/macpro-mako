import { describe, expect, it, vi, afterEach } from "vitest";
import { handler } from "./sinkInsights";
import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "../libs/sink-lib";
import {
  convertObjToBase64,
  createKafkaEvent,
  createKafkaRecord,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
} from "mocks";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}insights`;
const TEST_INSIGHT_ID = "42";
const TEST_INSIGHT_KEY = Buffer.from(TEST_INSIGHT_ID).toString("base64");
const TOPIC = `--mako--branch-name--aws.seatool.ksql.onemac.three.agg.State_Plan-${TEST_INSIGHT_ID}`;

describe("test sync types", () => {
  const bulkUpdateDataSpy = vi.spyOn(os, "bulkUpdateData");
  const logErrorSpy = vi.spyOn(sink, "logError");

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if the topic is undefined", async () => {
    await expect(() =>
      handler(
        createKafkaEvent({
          undefined: [],
        }),
        {} as Context,
        vi.fn(),
      ),
    ).rejects.toThrowError("topic (undefined) is invalid");

    expect(logErrorSpy).toHaveBeenCalledWith({ type: sink.ErrorType.BADTOPIC });
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.UNKNOWN,
      }),
    );
  });

  it("should throw an error if the topic is invalid", async () => {
    await expect(() =>
      handler(
        createKafkaEvent({
          "invalid-topic": [],
        }),
        {} as Context,
        vi.fn(),
      ),
    ).rejects.toThrowError("topic (invalid-topic) is invalid");

    expect(logErrorSpy).toHaveBeenCalledWith({ type: sink.ErrorType.BADTOPIC });
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.UNKNOWN,
      }),
    );
  });

  it("should skip if the key is invalid", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            // @ts-expect-error
            key: undefined,
            value: convertObjToBase64({
              test: "value",
            }),
          }),
        ],
      }),
      {} as Context,
      vi.fn(),
    );

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: sink.ErrorType.BADPARSE,
      }),
    );
  });

  it("should skip if the record has no value", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_INSIGHT_KEY,
            // @ts-expect-error needs to be undefined for test
            value: undefined,
          }),
        ],
      }),
      {} as Context,
      vi.fn(),
    );

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle a valid record", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_INSIGHT_KEY,
            value: convertObjToBase64({
              test: "value",
            }),
          }),
        ],
      }),
      {} as Context,
      vi.fn(),
    );

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: TEST_INSIGHT_ID,
        test: "value",
      },
    ]);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });
});
