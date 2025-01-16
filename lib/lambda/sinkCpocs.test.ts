import { describe, expect, it, vi, afterEach } from "vitest";
import { handler } from "./sinkCpocs";
import { Context } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import * as sink from "../libs/sink-lib";
import {
  convertObjToBase64,
  createKafkaEvent,
  createKafkaRecord,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  rateLimitBulkUpdateDataHandler,
  errorBulkUpdateDataHandler,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import cpocs, { MUHAMMAD_BASHAR_ID } from "mocks/data/cpocs";
import { Client } from "@opensearch-project/opensearch";

const OPENSEARCH_INDEX = `${OPENSEARCH_INDEX_NAMESPACE}cpocs`;
const TOPIC = "--mako--branch-name--aws.seatool.debezium.cdc.SEA.dbo.Officers";
const MUHAMMAD_BASHAR_KEY = Buffer.from(`${MUHAMMAD_BASHAR_ID}`).toString("base64");
const MUHAMMAD_BASHAR = cpocs[MUHAMMAD_BASHAR_ID];

describe("test sync cpoc", () => {
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
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            // @ts-expect-error need key undefined for test
            key: undefined,
            value: convertObjToBase64({
              id: MUHAMMAD_BASHAR_ID,
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

  it("should skip if record has no value", async () => {
    await handler(
      createKafkaEvent({
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            key: MUHAMMAD_BASHAR_KEY,
            // @ts-expect-error needs to be undefined for the test
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

  it("should skip if there is no payload", async () => {
    await handler(
      createKafkaEvent({
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            key: MUHAMMAD_BASHAR_KEY,
            value: convertObjToBase64({
              id: MUHAMMAD_BASHAR_KEY,
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
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            key: MUHAMMAD_BASHAR_KEY,
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

    expect(bulkUpdateDataSpy).toHaveBeenCalledWith(OPENSEARCH_DOMAIN, OPENSEARCH_INDEX, [
      {
        id: `${MUHAMMAD_BASHAR_ID}`,
        delete: true,
      },
    ]);
    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it("should handle an invalid record", async () => {
    await handler(
      createKafkaEvent({
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            key: MUHAMMAD_BASHAR_KEY,
            value: convertObjToBase64({
              payload: {
                after: {
                  Officer_ID: MUHAMMAD_BASHAR_ID,
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
    await handler(
      createKafkaEvent({
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            key: MUHAMMAD_BASHAR_KEY,
            value: convertObjToBase64({
              payload: {
                after: {
                  Officer_ID: MUHAMMAD_BASHAR_ID,
                  First_Name: MUHAMMAD_BASHAR._source?.firstName,
                  Last_Name: MUHAMMAD_BASHAR._source?.lastName,
                  Email: MUHAMMAD_BASHAR._source?.email,
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
        ...MUHAMMAD_BASHAR._source,
      },
    ]);
  });

  it("should succeed after receiving a rate limit exceeded error", async () => {
    const osBulkSpy = vi.spyOn(Client.prototype, "bulk");
    mockedServer.use(rateLimitBulkUpdateDataHandler);

    await handler(
      createKafkaEvent({
        [`${TOPIC}-xyz`]: [
          createKafkaRecord({
            topic: `${TOPIC}-xyz`,
            key: MUHAMMAD_BASHAR_KEY,
            value: convertObjToBase64({
              payload: {
                after: {
                  Officer_ID: MUHAMMAD_BASHAR_ID,
                  First_Name: MUHAMMAD_BASHAR._source?.firstName,
                  Last_Name: MUHAMMAD_BASHAR._source?.lastName,
                  Email: MUHAMMAD_BASHAR._source?.email,
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
        ...MUHAMMAD_BASHAR._source,
      },
    ]);
    expect(osBulkSpy).toHaveBeenCalledTimes(2);
  });

  it("should succeed after receiving a rate limit exceeded error", async () => {
    mockedServer.use(errorBulkUpdateDataHandler);

    await expect(() =>
      handler(
        createKafkaEvent({
          [`${TOPIC}-xyz`]: [
            createKafkaRecord({
              topic: `${TOPIC}-xyz`,
              key: MUHAMMAD_BASHAR_KEY,
              value: convertObjToBase64({
                payload: {
                  after: {
                    Officer_ID: MUHAMMAD_BASHAR_ID,
                    First_Name: MUHAMMAD_BASHAR._source?.firstName,
                    Last_Name: MUHAMMAD_BASHAR._source?.lastName,
                    Email: MUHAMMAD_BASHAR._source?.email,
                  },
                },
              }),
            }),
          ],
        }),
        {} as Context,
        vi.fn(),
      ),
    ).rejects.toThrowError("Response Error");
  });
});
