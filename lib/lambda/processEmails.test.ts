import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  handler,
  sesClient,
  processRecord,
  processAndSendEmails,
} from "./processEmails";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { getEmailTemplates } from "./../libs/email";
import { Authority, KafkaEvent, KafkaRecord } from "shared-types";
import {
  emailTemplateValue,
  key,
} from "../libs/email/content/new-submission/data";

// Mock modules
vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: class {},
  SendEmailCommand: class {},
}));

vi.mock("shared-utils", () => ({
  decodeBase64WithUtf8: vi.fn().mockResolvedValue("Hello World"),
  getSecret: vi.fn(),
}));

vi.mock("./../libs/email", () => ({
  getEmailTemplates: vi.fn().mockResolvedValue(emailTemplateValue),
}));

describe("handler", () => {
  beforeEach(() => {
    process.env.emailAddressLookupSecretName = "mockSecretName";
    process.env.applicationEndpointUrl = "http://mock-url.com";
    vi.spyOn(console, "log");
    vi.spyOn(console, "error");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    delete process.env.emailAddressLookupSecretName;
    delete process.env.applicationEndpointUrl;
  });

  it.skip("should process Kafka event and send emails successfully", async () => {
    const mockEvent: KafkaEvent = {
      eventSource: "aws:kafka",
      bootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
      records: {
        "topic-partition": [
          {
            key: key,
            value: JSON.stringify(emailTemplateValue),
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

    const mockDecodedKey = "C0-24-8110";
    const mockRecord = {
      origin: "micro",
      actionType: "new-submission",
      authority: "george@example.com",
      submitterEmail: "george@example.com",
    };

    const base64Result = decodeBase64WithUtf8("SGVsbG8gV29ybGQ=");

    const emailAddresses = getSecret("emaillAddresses");

    const template = getEmailTemplates("new-submission", Authority.MED_SPA);

    const sendMock = vi.fn().mockResolvedValue({ messageId: "mockMessageId" });
    sesClient.send = sendMock;

    const mockContext = {} as any;
    const mockCallback = vi.fn();

    await handler(mockEvent, mockContext, mockCallback);

    expect(decodeBase64WithUtf8).toHaveBeenCalledTimes(2);
    expect(getSecret).toHaveBeenCalledWith("mockSecretName");
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Destination: { ToAddresses: ["mako.stateuser@gmail.com"] },
          Source: "source@example.com",
          Message: expect.objectContaining({
            Subject: { Data: "Medicaid SPA C0-24-8110 Submitted" },
            Body: expect.objectContaining({
              Html: { Data: "Test HTML" },
              Text: { Data: "Test Text" },
            }),
          }),
        }),
      }),
    );
  });

  it("should handle missing environment variables", async () => {
    delete process.env.emailAddressLookupSecretName;

    const mockEvent: KafkaEvent = {
      eventSource: "aws:kafka",
      bootstrapServers: "localhost:9092,localhost:9093,localhost:9094",
      records: {},
    };

    const mockContext = {} as any;
    const mockCallback = vi.fn();

    await expect(handler(mockEvent, mockContext, mockCallback)).rejects.toThrow(
      "Environment variables are not set properly.",
    );
  });

  it("should handle tombstone events", async () => {
    const mockKafkaRecord: KafkaRecord = {
      key: "mockKey",
      value: "",
      timestamp: 1628090400000,
      topic: "mockTopic",
      partition: 0,
      offset: 0,
      timestampType: "CREATE_TIME",
      headers: {},
    };

    const decodedResult = decodeBase64WithUtf8("decodedKey");

    await processRecord(
      mockKafkaRecord,
      "mockSecretName",
      "http://mock-url.com",
    );

    expect(console.log).toHaveBeenCalledWith(
      "Tombstone detected. Doing nothing for this event",
    );
  });

  it("should process and send emails successfully", async () => {
    const mockAction = "new-submission";
    const mockAuthority = Authority.CHIP_SPA;
    const mockRecord = {
      submitterEmail: "test@example.com",
    };
    const mockId = "C0-24-8110";
    const mockSecretName = "mockSecretName";
    const mockEndpointUrl = "http://mock-url.com";

    getSecret(JSON.stringify({ sourceEmail: "source@example.com" }));

    getEmailTemplates("new-submission", Authority.MED_SPA);

    const sendEmailMock = vi.fn(sesClient.send).mockResolvedValue();

    await processAndSendEmails(
      mockAction,
      mockAuthority,
      mockRecord,
      mockId,
      mockSecretName,
      mockEndpointUrl,
    );

    expect(getSecret).toHaveBeenCalledWith(mockSecretName);
    expect(getEmailTemplates).toHaveBeenCalledWith(mockAction, mockAuthority);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Destination: { ToAddresses: ["mako.stateuser@gmail.com"] },
          Source: "source@example.com",
          Message: expect.objectContaining({
            Subject: { Data: "Test Subject" },
            Body: expect.objectContaining({
              Html: { Data: "Test HTML" },
              Text: { Data: "Test Text" },
            }),
          }),
        }),
      }),
    );
  });
});
