import { describe, expect, it, vi, afterEach } from "vitest";
import { handler } from "./sinkLegacyInsights";
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

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}legacyinsights`;
const TEST_INSIGHT_ID = "42";
const TEST_INSIGHT_KEY = Buffer.from(TEST_INSIGHT_ID).toString("base64");
const TOPIC = `--mako--branch-name--aws.onemac.migration.cdc-${TEST_INSIGHT_ID}`;

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

  it("should delete the record if the value is undefined", async () => {
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

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: TEST_INSIGHT_ID,
        hardDeletedFromLegacy: true,
      },
    ]);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should skip if the record does not have sk field", async () => {
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

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, []);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle a valid record for package change", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_INSIGHT_KEY,
            value: convertObjToBase64({
              test: "value",
              sk: "Package",
            }),
            offset: 0,
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
        sk: "Package",
        approvedEffectiveDate: null,
        changedDate: null,
        finalDispositionDate: null,
        proposedDate: null,
        proposedEffectiveDate: null,
        statusDate: null,
        submissionDate: null,
        hardDeletedFromLegacy: null,
      },
    ]);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle a valid record for offset change", async () => {
    await handler(
      createKafkaEvent({
        [TOPIC]: [
          createKafkaRecord({
            topic: TOPIC,
            key: TEST_INSIGHT_KEY,
            value: convertObjToBase64({
              test: "value",
              sk: "Offset",
            }),
            offset: 3,
          }),
        ],
      }),
      {} as Context,
      vi.fn(),
    );

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: "3",
        test: "value",
        sk: "Offset",
        approvedEffectiveDate: null,
        changedDate: null,
        finalDispositionDate: null,
        proposedDate: null,
        proposedEffectiveDate: null,
        statusDate: null,
        submissionDate: null,
        hardDeletedFromLegacy: null,
      },
    ]);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });
});
