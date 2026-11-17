import { describe, expect, it } from "vitest";

import { ceFile, ceSubsequentInput } from "../../../events/ce-test-fixtures";
import { transform } from "./ce-subsequent-documents";

describe("ce-subsequent-documents changelog transform", () => {
  it("flattens only populated slots", () => {
    const result = transform(1).parse(
      ceSubsequentInput({
        attachments: {
          ceTemplate: { files: [] },
          other: {
            label: "Other Supporting Documentation",
            files: [ceFile("labor-table.xlsx", "MD-CE-26-001/other/labor-table.xlsx")],
          },
        },
      }),
    );

    expect(result.id).toBe("MD-CE-26-001-1");
    expect(result.packageId).toBe("MD-CE-26-001");
    expect(result.event).toBe("ce-subsequent-documents");
    expect(result.additionalInformation).toBe("Labor table and declaration added.");
    expect(result).not.toHaveProperty("proposedEffectiveDate");
    expect(result.attachments).toEqual([
      {
        filename: "labor-table.xlsx",
        title: "Other Supporting Documentation",
        bucket: "mako-attachments",
        key: "MD-CE-26-001/other/labor-table.xlsx",
        uploadDate: result.attachments[0]?.uploadDate,
      },
    ]);
  });
});
