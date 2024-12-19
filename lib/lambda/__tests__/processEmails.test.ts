import { describe, it, expect, vi } from "vitest";
import { handler as processEmailsHandler } from "../processEmails";

vi.mock("aws-sdk/clients/sqs", () => {
  return {
    SQS: vi.fn().mockImplementation(() => {
      return {
        sendMessage: vi.fn().mockReturnValue({ promise: () => Promise.resolve({}) })
      };
    })
  };
});

vi.mock("../processEmails", async () => {
  const actual = await vi.importActual("../processEmails");
  return {
    ...actual,
    // If needed, mock internal functions
  };
});

describe("processEmails handler", () => {
  it("should gracefully handle an empty records set", async () => {
    const event = {
      records: {}
    };
    const res = await processEmailsHandler(event as any, {} as any, () => {});
    // no error means passed
    expect(res).toBeUndefined();
  });

  it("should process a valid record without errors", async () => {
    const event = {
      records: {
        "test-topic": [
          {
            key: Buffer.from("testKey").toString("base64"),
            value: Buffer.from(JSON.stringify({ event: "new-medicaid-submission", authority: "Medicaid SPA", origin: "mako" })).toString("base64"),
            timestamp: Date.now(),
          }
        ]
      }
    };
    const res = await processEmailsHandler(event as any, {} as any, () => {});
    expect(res).toBeUndefined();
  });
});