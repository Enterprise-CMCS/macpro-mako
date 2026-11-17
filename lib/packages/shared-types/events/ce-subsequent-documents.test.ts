import { describe, expect, it } from "vitest";

import { CE_ADDITIONAL_INFORMATION_MAX_LENGTH } from "../centra";
import { schema } from "./ce-subsequent-documents";
import { ceSubsequentInput, expectSubsequentContract } from "./ce-test-fixtures";

describe("ce-subsequent-documents schema", () => {
  it("parses a subsequent documents payload without proposedEffectiveDate", () => {
    const parsed = expectSubsequentContract(
      schema.parse({
        ...ceSubsequentInput(),
        proposedEffectiveDate: 1762452000000,
      }),
    );

    expect(parsed).toMatchObject({
      origin: "mako",
      event: "ce-subsequent-documents",
      operationType: "CE_SUBSEQUENT_DOCUMENTS",
      id: "MD-CE-26-001",
      state: "MD",
      authority: "CE_HARDSHIP_EXCEPTION",
      hardshipKind: "CE_SADE",
      additionalInformation: "Labor table and declaration added.",
    });
    expect(parsed).not.toHaveProperty("proposedEffectiveDate");
    expect(parsed.attachments.ceTemplate.label).toBe("Template");
    expect(parsed.attachments.ceTemplate.files).toEqual([]);
    expect(parsed.attachments.other.files).toHaveLength(1);
  });

  it("requires a non-whitespace reason", () => {
    expect(schema.safeParse(ceSubsequentInput({ additionalInformation: "   " })).success).toBe(
      false,
    );
    expect(schema.safeParse(ceSubsequentInput({ additionalInformation: "" })).success).toBe(false);
    expect(schema.safeParse(ceSubsequentInput({ additionalInformation: undefined })).success).toBe(
      false,
    );

    const trimmed = schema.parse(ceSubsequentInput({ additionalInformation: "  Added rates.  " }));
    expect(trimmed.additionalInformation).toBe("Added rates.");
  });

  it("rejects a reason over 4,000 characters and zero files", () => {
    expect(
      schema.safeParse(
        ceSubsequentInput({
          additionalInformation: "a".repeat(CE_ADDITIONAL_INFORMATION_MAX_LENGTH + 1),
        }),
      ).success,
    ).toBe(false);

    const noFiles = schema.safeParse(
      ceSubsequentInput({
        attachments: {
          ceTemplate: { files: [] },
          other: { files: [] },
        },
      }),
    );
    expect(noFiles.success).toBe(false);
  });
});
