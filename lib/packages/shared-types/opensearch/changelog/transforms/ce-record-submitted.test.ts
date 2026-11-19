import { describe, expect, it } from "vitest";

import {
  CE_PROPOSED_EFFECTIVE_DATE,
  ceFile,
  ceRecordInput,
} from "../../../events/ce-test-fixtures";
import { transform } from "./ce-record-submitted";

describe("ce-record-submitted changelog transform", () => {
  it("flattens attachment slots and keeps the package id", () => {
    const result = transform(3).parse(
      ceRecordInput({
        attachments: {
          ceTemplate: {
            files: [ceFile("request.pdf", "MD-CE-26-001/ceTemplate/request.pdf")],
          },
          other: { files: [] },
        },
      }),
    );

    expect(result.id).toBe("MD-CE-26-001-3");
    expect(result.packageId).toBe("MD-CE-26-001");
    expect(result.event).toBe("ce-record-submitted");
    expect(result.hardshipKind).toBe("CE_UNEMPLOYMENT");
    expect(result.proposedEffectiveDate).toBe(CE_PROPOSED_EFFECTIVE_DATE);
    expect(result.attachments).toEqual([
      {
        filename: "request.pdf",
        title: "Template",
        bucket: "mako-attachments",
        key: "MD-CE-26-001/ceTemplate/request.pdf",
        uploadDate: result.attachments[0]?.uploadDate,
      },
    ]);
  });
});
