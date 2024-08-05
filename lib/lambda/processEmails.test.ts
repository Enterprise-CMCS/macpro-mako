import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./processEmails";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { decodeBase64WithUtf8, getSecret } from "shared-utils";
import { getEmailTemplate, fillTemplate } from "../libs/email/email-templates";

// Mock dependencies
vi.mock("@aws-sdk/client-ses", () => {
  return {
    SESClient: vi.fn(() => ({
      send: vi.fn(),
    })),
    SendEmailCommand: vi.fn(),
  };
});

vi.mock("shared-utils", () => {
  return {
    decodeBase64WithUtf8: vi.fn((str: string) =>
      Buffer.from(str, "base64").toString("utf-8"),
    ),
    getSecret: vi.fn(),
  };
});

vi.mock("../libs/email/email-templates", () => {
  return {
    getEmailTemplate: vi.fn(),
    fillTemplate: vi.fn(),
  };
});

const sesClient = new SESClient();

describe("Lambda Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process an email event and send an email", async () => {
    const event: KafkaEvent = {
      records: {
        "--mako--hmmm--aws.onemac.migration.cdc-0": [
          {
            topic: "--mako--hmmm--aws.onemac.migration.cdc",
            partition: 0,
            offset: 10,
            timestamp: 1722734888826,
            timestampType: "CREATE_TIME",
            key: "TUQtOTktMTkzNQ==",
            value:
              "eyJ0aW1lc3RhbXAiOjE3MjI3MzQ4ODg1MzksImF1dGhvcml0eSI6Ik1lZGljYWlkIFNQQSIsIm9yaWdpbiI6Im1pY3JvIiwiYWRkaXRpb25hbEluZm9ybWF0aW9uIjoiYXNkZiIsImF0dGFjaG1lbnRzIjpbXSwic3VibWl0dGVyTmFtZSI6Ikdlb3JnZSBIYXJyaXNvbiIsInN1Ym1pdHRlckVtYWlsIjoiZ2VvcmdlQGV4YW1wbGUuY29tIiwiaWQiOiJNRC05OS0xOTM1IiwiYWN0aW9uVHlwZSI6IndpdGhkcmF3LXBhY2thZ2UifQ==",
            headers: [
              {
                source: [109, 105, 99, 114, 111],
              },
            ],
          },
        ],
      },
    };

    (getSecret as vi.Mock).mockResolvedValue(
      JSON.stringify({
        source: "no-reply@example.com",
      }),
    );

    (getEmailTemplate as vi.Mock).mockReturnValue({
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
      text: "Test Text",
      validate: vi.fn(),
    });

    (fillTemplate as vi.Mock).mockReturnValue({
      subject: "Filled Subject",
      html: "<p>Filled HTML</p>",
      text: "Filled Text",
    });

    await handler(event);

    expect(getSecret).toHaveBeenCalledWith(
      process.env.emailAddressLookupSecretName,
    );
    expect(getEmailTemplate).toHaveBeenCalledWith(
      "new-submission",
      "medicaid spa",
      "state",
    );
    expect(fillTemplate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
    );
    expect(sesClient.send).toHaveBeenCalledWith(expect.any(SendEmailCommand));
  });

  it("should skip processing for tombstone events", async () => {
    const kafkaRecord: KafkaRecord = {
      key: Buffer.from("test-key").toString("base64"),
      value: undefined, // Tombstone event
      timestamp: Date.now(),
    };

    const event: KafkaEvent = {
      records: [[kafkaRecord]],
    };

    await handler(event);

    expect(sesClient.send).not.toHaveBeenCalled();
  });

  it("should skip processing for legacy records", async () => {
    const kafkaRecord: KafkaRecord = {
      key: Buffer.from("test-key").toString("base64"),
      value: Buffer.from(
        JSON.stringify({
          origin: "legacy",
          actionType: "new-submission",
          authority: "medicaid spa",
          email: "test@example.com",
        }),
      ).toString("base64"),
      timestamp: Date.now(),
    };

    const event: KafkaEvent = {
      records: [[kafkaRecord]],
    };

    await handler(event);

    expect(sesClient.send).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const kafkaRecord: KafkaRecord = {
      key: Buffer.from("test-key").toString("base64"),
      value: Buffer.from(
        JSON.stringify({
          origin: "micro",
          actionType: "new-submission",
          authority: "medicaid spa",
          email: "test@example.com",
        }),
      ).toString("base64"),
      timestamp: Date.now(),
    };

    const event: KafkaEvent = {
      records: [[kafkaRecord]],
    };

    (getSecret as vi.Mock).mockRejectedValue(new Error("Secret fetch error"));

    await expect(handler(event)).rejects.toThrow("Secret fetch error");

    expect(sesClient.send).not.toHaveBeenCalled();
  });
});
