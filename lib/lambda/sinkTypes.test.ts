import { describe, expect, it, vi, afterEach } from "vitest";
import { handler } from "./sinkTypes";
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
import { types } from "mocks/data/types";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}types`;
const TEST_TYPE = types[0];
const TEST_TYPE_ID = TEST_TYPE._source.id;
const TEST_TYPE_KEY = Buffer.from(`${TEST_TYPE_ID}`).toString("base64");
const TOPIC = `--mako--branch-name--aws.seatool.debezium.cdc.SEA.dbo.SPA_Type-${TEST_TYPE_ID}`;

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

  it("should skip if the record has no value", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_TYPE_KEY,
            // @ts-expect-error needs to be undefined for test
            value: undefined,
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

  it("should skip if there is no payload", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_TYPE_KEY,
            value: convertObjToBase64({
              id: TEST_TYPE._source.id,
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

  it("should skip if there is no record", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_TYPE_KEY,
            value: convertObjToBase64({
              payload: {
                after: undefined,
              },
            }),
          }),
        ],
      }),
      {} as Context,
      vi.fn(),
    );

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle an invalid record", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_TYPE_KEY,
            value: convertObjToBase64({
              payload: {
                after: {
                  SPA_Type_ID: TEST_TYPE._source.id,
                },
              },
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
        type: sink.ErrorType.VALIDATION,
      }),
    );
  });

  it("should handle a valid record", async () => {
    const { id, name, authorityId } = TEST_TYPE._source;
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_TYPE_KEY,
            value: convertObjToBase64({
              payload: {
                after: {
                  SPA_Type_ID: id,
                  SPA_Type_Name: name,
                  Plan_Type_ID: authorityId,
                },
              },
            }),
          }),
        ],
      }),
      {} as Context,
      vi.fn(),
    );

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        ...TEST_TYPE._source,
      },
    ]);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });
});
