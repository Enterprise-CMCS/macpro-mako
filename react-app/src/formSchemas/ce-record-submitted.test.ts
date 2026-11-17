import { CE_PACKAGE_ID_FORMAT_MESSAGE } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { itemExists } from "@/api";
import { formSchemas } from "@/formSchemas";

import { CE_ATTACHMENT_REQUIRED_MESSAGE, DUPLICATE_SUBMISSION_ID_MESSAGE } from "./ce-attachments";

vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof import("@/api")>("@/api");
  return {
    ...actual,
    itemExists: vi.fn(async () => false),
  };
});

const file = {
  filename: "request.pdf",
  title: "Request",
  bucket: "mako-attachments",
  key: "MD-CE-26-001/ceTemplate/request.pdf",
  uploadDate: 1762452000000,
};

const recordInput = (overrides: Record<string, unknown> = {}) => ({
  id: "MD-CE-26-001",
  state: "MD",
  hardshipKind: "CE_UNEMPLOYMENT",
  proposedEffectiveDate: 1762400000000,
  additionalInformation: "High unemployment attestation for MD counties.",
  attachments: {
    ceTemplate: { files: [file] },
    other: { files: [] },
  },
  ...overrides,
});

const subsequentInput = (overrides: Record<string, unknown> = {}) => ({
  id: "MD-CE-26-001",
  state: "MD",
  hardshipKind: "CE_SADE",
  additionalInformation: "Updated unemployment evidence.",
  attachments: {
    ceTemplate: { files: [] },
    other: { files: [file] },
  },
  ...overrides,
});

const messagesFor = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? [] : (result.error?.issues.map((issue) => issue.message) ?? []);

describe("ce-record-submitted form schema", () => {
  beforeEach(() => {
    vi.mocked(itemExists).mockReset();
    vi.mocked(itemExists).mockResolvedValue(false);
  });
  it("accepts one file in either slot and applies the shared refinement", async () => {
    const templateOnly = await formSchemas["ce-record-submitted"].safeParseAsync(recordInput());
    const otherOnly = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({
        attachments: {
          ceTemplate: { files: [] },
          other: { files: [file] },
        },
      }),
    );

    expect(templateOnly.success).toBe(true);
    expect(otherOnly.success).toBe(true);
    if (templateOnly.success) {
      expect(templateOnly.data.event).toBe("ce-record-submitted");
      expect(templateOnly.data.authority).toBe("CE_HARDSHIP_EXCEPTION");
      expect(templateOnly.data.attachments.ceTemplate.label).toBe("Template");
      expect(templateOnly.data.attachments.other.label).toBe("Other Supporting Documentation");
    }
  });

  it("rejects a bad id, a state mismatch, and zero files", async () => {
    const badId = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ id: "MD-CE-26-0001" }),
    );
    const unknownState = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ id: "QQ-CE-26-001", state: "QQ" }),
    );
    const unauthorized = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ id: "ZZ-CE-26-001", state: "ZZ" }),
    );
    const mismatch = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ state: "VA" }),
    );
    const noFiles = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({
        attachments: {
          ceTemplate: { files: [] },
          other: { files: [] },
        },
      }),
    );
    const tooLong = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ additionalInformation: "a".repeat(4001) }),
    );
    const blankInfo = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ additionalInformation: "   " }),
    );
    const emptyInfo = await formSchemas["ce-record-submitted"].safeParseAsync(
      recordInput({ additionalInformation: "" }),
    );

    expect(messagesFor(badId)).toContain(CE_PACKAGE_ID_FORMAT_MESSAGE);
    expect(messagesFor(unknownState).join(" ")).toMatch(/known state code/i);
    expect(messagesFor(unauthorized).join(" ")).toMatch(/state you have access to/i);
    expect(messagesFor(mismatch)).toContain("State must match the ID prefix.");
    expect(messagesFor(noFiles)).toContain(CE_ATTACHMENT_REQUIRED_MESSAGE);
    expect(messagesFor(tooLong).join(" ")).toMatch(/4,000/);
    expect(blankInfo.success).toBe(false);
    expect(emptyInfo.success).toBe(false);
  });

  it("rejects a duplicate submission id", async () => {
    vi.mocked(itemExists).mockResolvedValue(true);

    const duplicate = await formSchemas["ce-record-submitted"].safeParseAsync(recordInput());
    expect(messagesFor(duplicate)).toContain(DUPLICATE_SUBMISSION_ID_MESSAGE);
  });
});

describe("ce-subsequent-documents form schema", () => {
  it("requires a reason and at least one file", async () => {
    const valid = await formSchemas["ce-subsequent-documents"].safeParseAsync(subsequentInput());
    const blankReason = await formSchemas["ce-subsequent-documents"].safeParseAsync(
      subsequentInput({ additionalInformation: "   " }),
    );
    const noFiles = await formSchemas["ce-subsequent-documents"].safeParseAsync(
      subsequentInput({
        attachments: {
          ceTemplate: { files: [] },
          other: {},
        },
      }),
    );

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.event).toBe("ce-subsequent-documents");
      expect(valid.data.operationType).toBe("CE_SUBSEQUENT_DOCUMENTS");
      expect(valid.data.hardshipKind).toBe("CE_SADE");
    }
    expect(blankReason.success).toBe(false);
    expect(messagesFor(noFiles)).toContain(CE_ATTACHMENT_REQUIRED_MESSAGE);
  });
});
