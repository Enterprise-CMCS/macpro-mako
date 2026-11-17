import { describe, expect, it } from "vitest";

import { CE_ADDITIONAL_INFORMATION_MAX_LENGTH } from "../centra";
import { baseSchema, schema } from "./ce-record-submitted";
import {
  CE_PROPOSED_EFFECTIVE_DATE,
  CE_TIMESTAMP,
  ceRecordInput,
  expectRecordContract,
} from "./ce-test-fixtures";

describe("ce-record-submitted schema", () => {
  it("parses a contract payload and fills OneMAC defaults", () => {
    const parsed = expectRecordContract(schema.parse(ceRecordInput()));

    expect(parsed).toMatchObject({
      origin: "mako",
      event: "ce-record-submitted",
      operationType: "CE_RECORD_SUBMITTED",
      id: "MD-CE-26-001",
      state: "MD",
      authority: "CE_HARDSHIP_EXCEPTION",
      hardshipKind: "CE_UNEMPLOYMENT",
      proposedEffectiveDate: CE_PROPOSED_EFFECTIVE_DATE,
      additionalInformation: null,
      submitterName: "Alex Rivera",
      submitterEmail: "alex.rivera@maryland.gov",
      timestamp: CE_TIMESTAMP,
    });
    expect(parsed.attachments.ceTemplate.label).toBe("Template");
    expect(parsed.attachments.other.label).toBe("Other Supporting Documentation");
    expect(parsed.attachments.ceTemplate.files).toHaveLength(1);
    expect(parsed.attachments.other.files).toHaveLength(1);
  });

  it("accepts a single file in either slot", () => {
    const templateOnly = schema.parse(
      ceRecordInput({
        attachments: {
          ceTemplate: {
            files: [
              {
                filename: "request.pdf",
                title: "Request",
                bucket: "mako-attachments",
                key: "MD-CE-26-001/ceTemplate/request.pdf",
                uploadDate: CE_TIMESTAMP,
              },
            ],
          },
          other: {},
        },
      }),
    );
    expect(templateOnly.attachments.other.files).toEqual([]);

    const otherOnly = schema.parse(
      ceRecordInput({
        attachments: {
          ceTemplate: { files: [] },
          other: {
            files: [
              {
                filename: "support.pdf",
                title: "Support",
                bucket: "mako-attachments",
                key: "MD-CE-26-001/other/support.pdf",
                uploadDate: CE_TIMESTAMP,
              },
            ],
          },
        },
      }),
    );
    expect(otherOnly.attachments.ceTemplate.files).toEqual([]);
  });

  it("allows an empty draft shape and rejects it on the outbound schema", () => {
    const draft = ceRecordInput({
      attachments: {
        ceTemplate: { files: [] },
        other: { files: [] },
      },
    });

    expect(baseSchema.safeParse(draft).success).toBe(true);
    const parsed = schema.safeParse(draft);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path.join(".") === "attachments")).toBe(
        true,
      );
    }
  });

  it("rejects a state that does not match the ID prefix", () => {
    const parsed = schema.safeParse(ceRecordInput({ state: "VA" }));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.message.includes("ID prefix"))).toBe(true);
    }
  });

  it("rejects malformed ids and unknown state codes", () => {
    expect(schema.safeParse(ceRecordInput({ id: "MD-CE-26-0001", state: "MD" })).success).toBe(
      false,
    );
    expect(schema.safeParse(ceRecordInput({ id: "MD-26-0001", state: "MD" })).success).toBe(false);
    expect(schema.safeParse(ceRecordInput({ id: "QQ-CE-26-001", state: "QQ" })).success).toBe(
      false,
    );
  });

  it("rejects additional information over 4,000 characters", () => {
    const parsed = schema.safeParse(
      ceRecordInput({
        additionalInformation: "a".repeat(CE_ADDITIONAL_INFORMATION_MAX_LENGTH + 1),
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it("rejects an unknown hardship kind and operation type", () => {
    expect(schema.safeParse(ceRecordInput({ hardshipKind: "CE_OTHER" })).success).toBe(false);
    expect(schema.safeParse(ceRecordInput({ operationType: "CE_STATUS_UPDATED" })).success).toBe(
      false,
    );
  });
});
