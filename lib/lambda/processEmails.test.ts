import { describe, it, expect, vi } from "vitest";
import { handler as processEmailsHandler } from "./processEmails";

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
 40 changes: 40 additions & 0 deletions40  
lib/lambda/__tests__/sinkMain.test.ts
Viewed
Original file line number	Original file line	Diff line number	Diff line change
@@ -0,0 +1,40 @@
import { describe, it, expect, vi } from "vitest";
import { handler as sinkMainHandler } from "../sinkMain";

vi.mock("../sinkMainProcessors", () => {
  return {
    insertOneMacRecordsFromKafkaIntoMako: vi.fn(() => Promise.resolve()),
    insertNewSeatoolRecordsFromKafkaIntoMako: vi.fn(() => Promise.resolve()),
    syncSeatoolRecordDatesFromKafkaWithMako: vi.fn(() => Promise.resolve())
  };
});

describe("sinkMain handler", () => {
  it("handles empty event gracefully", async () => {
    const event = {
      records: {}
    };
    const res = await sinkMainHandler(event as any, {} as any, () => {});
    expect(res).toBeUndefined();
  });

  it("handles unknown topic gracefully", async () => {
    const event = {
      records: {
        "unknown-topic": [
          {
            key: "base64Key",
            value: "base64Value",
            topic: "unknown-topic",
            partition: 0,
            offset: 0,
            timestamp: Date.now(),
            timestampType: "CREATE_TIME",
            headers: {}
          }
        ]
      }
    };
    await expect(sinkMainHandler(event as any, {} as any, () => {})).rejects.toThrow();
  });
});