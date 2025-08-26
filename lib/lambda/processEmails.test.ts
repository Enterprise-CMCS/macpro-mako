import { SESClient } from "@aws-sdk/client-ses";
import { Context } from "aws-lambda";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { describe, expect, it, vi } from "vitest";

import { handler, sendEmail, validateEmailTemplate } from "./processEmails";

describe("process emails Handler", () => {
  it("should return 200 with a proper email", async () => {
    const params = {
      Source: "sender@example.com",
      Destination: { ToAddresses: ["recipient@example.com"] },
      Message: {
        Subject: { Data: "Mocked Email", Charset: "UTF-8" },
        Body: { Text: { Data: "This is a mocked email body.", Charset: "UTF-8" } },
      },
      ConfigurationSetName: "test-config",
    };
    const test = await sendEmail(params, "us-east-1");
    expect(test.status).toStrictEqual(200);
  });

  it("should throw an error", async () => {
    const params = {
      Source: "sender@example.com",
      Destination: { ToAddresses: ["recipient@example.com"] },
      Message: {
        Subject: { Data: "Mocked Email", Charset: "UTF-8" },
        Body: { Text: { Data: "This is a mocked email body.", Charset: "UTF-8" } },
      },
      ConfigurationSetName: "test-config",
    };
    await expect(sendEmail(params, "bad-test")).rejects.toThrowError();
  });

  it("should validate the email template and throw an error for missing fields", async () => {
    const template = {
      to: "Person",
      from: "Other Guy",
      body: "body",
      // missing required 'subject' field
    };
    expect(() => validateEmailTemplate(template)).toThrowError(
      "Email template missing required fields: subject",
    );
  });

  it("should validate a complete email template without throwing", () => {
    const template = {
      to: "Person",
      from: "Other Guy",
      body: "body",
      subject: "Test Subject",
    };
    expect(() => validateEmailTemplate(template)).not.toThrow();
  });

  it("should make a handler", async () => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                origin: "mako",
                event: "new-medicaid-submission",
                authority: "medicaid spa",
                proposedEffectiveDate: 1732645041557,
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };

    await handler(mockEvent, {} as Context, callback);
    expect(secSPY).toHaveBeenCalledTimes(2);
  });

  it("should not be mako therefore not do an event", async () => {
    const callback = vi.fn();
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                origin: "not mako",
                event: "new-medicaid-submission",
                authority: "medicaid spa",
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    const secSPY = vi.spyOn(SESClient.prototype, "send");

    await handler(mockEvent, {} as Context, callback);
    expect(secSPY).toHaveBeenCalledTimes(0);
  });

  it("should be missing a value, so nothing sent", async () => {
    const callback = vi.fn();
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    const secSPY = vi.spyOn(SESClient.prototype, "send");

    await handler(mockEvent, {} as Context, callback);
    expect(secSPY).toHaveBeenCalledTimes(0);
  });

  it("should be missing an environment variable", async () => {
    const callback = vi.fn();
    delete process.env.osDomain;
    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                origin: "mako",
                event: "new-medicaid-submission",
                authority: "medicaid spa",
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };
    await expect(handler(mockEvent, {} as Context, callback)).rejects.toThrowError(
      "Missing required environment variables: osDomain",
    );
  });

  it("should send user-role emails when eventType is user-role", async () => {
    const callback = vi.fn();
    const secSPY = vi.spyOn(SESClient.prototype, "send");

    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                eventType: "user-role",
                role: "statesubmitter",
                status: "pending",
                territory: "CA",
                fullName: "Mock Name",
                email: "mock@email.com",
                doneBy: "done by",
                doneByEmail: "doneby@email.com",
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(secSPY).toHaveBeenCalledTimes(2);
  });
  it("should throw and log an error if sendUserRoleEmails fails", async () => {
    const callback = vi.fn();
    const error = new Error("Error");
    vi.spyOn(await import("./processUserRoleEmails"), "sendUserRoleEmails").mockRejectedValue(
      error,
    );

    const mockEvent: KafkaEvent = {
      records: {
        "mock-topic": [
          {
            key: Buffer.from("VA").toString("base64"),
            value: Buffer.from(
              JSON.stringify({
                eventType: "user-role",
                role: "statesubmitter",
                status: "pending",
                territory: "VA",
                fullName: "Mock Name",
                email: "mock@email.com",
                doneBy: "done by",
                doneByEmail: "doneby@email.com",
              }),
            ).toString("base64"),
            headers: {},
            timestamp: 1732645041557,
            offset: "0",
            partition: 0,
            topic: "mock-topic",
          } as unknown as KafkaRecord,
        ],
      },
      eventSource: "",
      bootstrapServers: "",
    };

    const sendSpy = vi.spyOn(SESClient.prototype, "send");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(handler(mockEvent, {} as Context, callback)).rejects.toThrowError();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error sending user email", error);
    expect(sendSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
