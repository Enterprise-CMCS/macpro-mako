import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "./processEmails";
import { SESClient } from "@aws-sdk/client-ses";
import { SQSClient } from "@aws-sdk/client-sqs";
import * as os from "../libs/opensearch-lib";
import { EMAIL_CONFIG } from "../libs/email/content/email-components";
import { getEmailTemplates } from "../libs/email";
import type { Context } from "aws-lambda";

vi.mock("libs/email", () => ({
  getEmailTemplates: vi.fn().mockResolvedValue([
    async () => ({
      to: ["recipient@example.com"],
      subject: "Test Subject",
      body: "<p>Test Body</p>",
    }),
  ]),
}));

describe("processEmails handler", () => {
  const mockEnv = {
    emailAddressLookupSecretName: "test-secret",
    applicationEndpointUrl: "https://test.com",
    osDomain: "test-domain",
    indexNamespace: "test-",
    region: "us-west-2",
    DLQ_URL: "https://sqs.test.com",
    userPoolId: "test-pool",
    configurationSetName: "test-config",
    isDev: "true",
  };

  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: "test",
    functionVersion: "1",
    invokedFunctionArn: "arn:test",
    memoryLimitInMB: "128",
    awsRequestId: "test",
    logGroupName: "test",
    logStreamName: "test",
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  const mockCallback = vi.fn();

  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });

    vi.spyOn(SESClient.prototype, "send").mockImplementation(() => Promise.resolve({} as any));
    vi.spyOn(SQSClient.prototype, "send").mockImplementation(() => Promise.resolve({} as any));
    vi.spyOn(os, "getItem").mockResolvedValue({
      _index: "test",
      _id: "test",
      _score: 1,
      sort: [],
      _source: {
        id: "test-id",
        authority: "Test Authority",
        email: "cpoc@example.com",
        reviewTeam: [{ name: "Test User", email: "reviewer@example.com" }],
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key];
    });
  });

  it.skip("should process valid Kafka records successfully", async () => {
    const event = {
      eventSource: "aws:kafka",
      bootstrapServers: "test:9092",
      records: {
        "test-topic-0": [
          {
            key: Buffer.from("US123").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                event: "test-event",
                authority: "test-authority",
                origin: "mako",
              }),
            ).toString("base64"),
            timestamp: 1234567890,
            timestampType: "CREATE_TIME",
            topic: "test-topic",
            partition: 0,
            offset: 0,
            headers: [],
          },
        ],
      },
    };

    await handler(event as any, mockContext, mockCallback);

    expect(getEmailTemplates).toHaveBeenCalledWith("test-event", "test-authority");
    expect(SESClient.prototype.send).toHaveBeenCalled();
  });

  it("should skip processing for tombstone records", async () => {
    const event = {
      eventSource: "aws:kafka",
      bootstrapServers: "test:9092",
      records: {
        "test-topic-0": [
          {
            key: Buffer.from("US123").toString("base64"),
            value: null,
            timestamp: 1234567890,
            timestampType: "CREATE_TIME",
            topic: "test-topic",
            partition: 0,
            offset: 0,
            headers: [],
          },
        ],
      },
    };

    await handler(event as any, mockContext, mockCallback);

    expect(getEmailTemplates).not.toHaveBeenCalled();
    expect(SESClient.prototype.send).not.toHaveBeenCalled();
  });

  it.skip("should send to DLQ on permanent failure", async () => {
    const mockSQSSend = vi.spyOn(SQSClient.prototype, "send");
    delete process.env.emailAddressLookupSecretName;

    const event = {
      eventSource: "aws:kafka",
      bootstrapServers: "test:9092",
      records: {
        "test-topic-0": [
          {
            key: Buffer.from("US123").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                event: "test-event",
                authority: "test-authority",
                origin: "mako",
              }),
            ).toString("base64"),
            timestamp: 1234567890,
            timestampType: "CREATE_TIME",
            topic: "test-topic",
            partition: 0,
            offset: 0,
            headers: [],
          },
        ],
      },
    };

    await expect(handler(event as any, mockContext, mockCallback)).rejects.toThrow();
    expect(mockSQSSend).toHaveBeenCalled();
  });

  it.skip("should use DEV_EMAIL when in dev mode", async () => {
    const event = {
      eventSource: "aws:kafka",
      bootstrapServers: "test:9092",
      records: {
        "test-topic-0": [
          {
            key: Buffer.from("US123").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                event: "test-event",
                authority: "test-authority",
                origin: "mako",
              }),
            ).toString("base64"),
            timestamp: 1234567890,
            timestampType: "CREATE_TIME",
            topic: "test-topic",
            partition: 0,
            offset: 0,
            headers: [],
          },
        ],
      },
    };

    await handler(event as any, mockContext, mockCallback);

    expect(SESClient.prototype.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Destination: expect.objectContaining({
            ToAddresses: expect.arrayContaining([`State Submitter <${EMAIL_CONFIG.DEV_EMAIL}>`]),
          }),
        }),
      }),
    );
  });
});
