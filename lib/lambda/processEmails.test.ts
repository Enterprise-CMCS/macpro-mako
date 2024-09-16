import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { handler } from "./processEmails";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { getEmailTemplates } from "./../libs/email";
import { KafkaEvent } from "shared-types";

vi.mock("@aws-sdk/client-ses");

describe.skip("handler", () => {
  beforeEach(() => {
    process.env.emailAddressLookupSecretName = "mockSecretName"; //pragma: allowlist secret
    process.env.applicationEndpointUrl = "http://mock-url.com";
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.emailAddressLookupSecretName;
    delete process.env.applicationEndpointUrl;
  });

  it("should process Kafka event and send emails successfully", async () => {
    const mockEvent: KafkaEvent = {
      eventSource: "aws:kafka",
      bootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
      records: {
        "topic-partition": [
          {
            key: "mockKey",
            value: "mockValue",
            timestamp: 1628090400000,
            topic: "mockTopic",
            partition: 0,
            offset: 0,
            timestampType: "CREATE_TIME",
            headers: {
              hello: "world",
            },
          },
        ],
      },
    };

    const mockDecodedKey = "decodedKey";
    const mockRecord = {
      origin: "micro",
      actionType: "new-submission",
      authority: "mockAuthority",
      submitterEmail: "test@example.com",
    };

    const decodeBase64Mock = vi.spyOn(
      { decodeBase64WithUtf8 },
      "decodeBase64WithUtf8",
    );

    decodeBase64Mock.mockReturnValueOnce(mockDecodedKey);
    decodeBase64Mock.mockReturnValueOnce(JSON.stringify(mockRecord));

    const getSecretMock = vi.fn().mockImplementation(getSecret);

    getSecretMock.mockResolvedValue(
      JSON.stringify({ sourceEmail: "source@example.com" }),
    );

    const getEmailTemplatesMock = vi.fn().mockImplementation(getEmailTemplates);

    getEmailTemplatesMock.mockResolvedValue([
      async () => ({
        subject: "Test Subject",
        html: "Test HTML",
        text: "Test Text",
      }),
    ]);

    const sendMock = vi.fn().mockResolvedValue({ messageId: "mockMessageId" });
    SESClient.prototype.send = sendMock;

    const mockContext = {} as any;
    const mockCallback = () => {};

    await handler(mockEvent, mockContext, mockCallback);

    expect(decodeBase64Mock).toHaveBeenCalledTimes(2);
    expect(getSecret).toHaveBeenCalledWith("mockSecretName");
    expect(sendMock).toHaveBeenCalledWith(expect.any(SendEmailCommand));
  });

  it("should handle missing environment variables", async () => {
    delete process.env.emailAddressLookupSecretName;

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockContext = {} as any;
    const mockCallback = () => {};

    await handler(
      {
        eventSource: "aws:kafka",
        bootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
        records: {},
      } as KafkaEvent,
      mockContext,
      mockCallback,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error processing email event:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("should handle tombstone events", async () => {
    const mockEvent: KafkaEvent = {
      eventSource: "aws:kafka",
      bootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
      records: {
        "topic-partition": [
          {
            key: "mockKey",
            value: "", // Use an empty string instead of null to match the expected type
            timestamp: 1628090400000,
            topic: "mockTopic",
            partition: 0,
            offset: 0,
            timestampType: "CREATE_TIME",
            headers: {},
          },
        ],
      },
    };

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const decodeBase64Mock = vi.fn().mockImplementation(decodeBase64WithUtf8);

    decodeBase64Mock.mockReturnValueOnce("decodedKey");

    const mockContext = {} as any;
    const mockCallback = () => {};

    await handler(mockEvent, mockContext, mockCallback);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Tombstone detected. Doing nothing for this event",
    );
    consoleLogSpy.mockRestore();
  });

  it("should handle errors during record processing", async () => {
    const mockEvent: KafkaEvent = {
      eventSource: "aws:kafka",
      bootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
      records: {
        "topic-partition": [
          {
            key: "mockKey",
            value: "mockValue",
            timestamp: 1628090400000,
            topic: "mockTopic",
            partition: 0,
            offset: 0,
            timestampType: "CREATE_TIME",
            headers: {},
          },
        ],
      },
    };

    const mockDecodedKey = "decodedKey";
    const decodeBase64Mock = vi.fn().mockImplementation(decodeBase64WithUtf8);

    decodeBase64Mock.mockReturnValueOnce(mockDecodedKey);
    decodeBase64Mock.mockImplementationOnce(() => {
      throw new Error("Decode error");
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockContext = {} as any;
    const mockCallback = () => {};

    await handler(mockEvent, mockContext, mockCallback);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error processing record:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
