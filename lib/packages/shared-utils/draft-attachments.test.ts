import { describe, expect, it } from "vitest";

import { getDraftAttachmentDefaultLabel, getDraftAttachmentKeyOrder } from "./draft-attachments";

describe("draft attachment helpers", () => {
  it("returns the schema default label for app k attachments", () => {
    expect(getDraftAttachmentDefaultLabel("app-k", "appk")).toBe(
      "1915(c) Appendix K Amendment Waiver Template",
    );
  });

  it("returns the event schema attachment order", () => {
    expect(getDraftAttachmentKeyOrder("new-chip-details-submission")).toEqual([
      "chipEligibility",
      "coverLetter",
      "currentStatePlan",
      "amendedLanguage",
      "budgetDocuments",
      "publicNotice",
      "tribalConsultation",
      "other",
    ]);
  });

  it("returns no label or ordering for events without attachment sections", () => {
    expect(getDraftAttachmentKeyOrder("split-spa")).toEqual([]);
    expect(getDraftAttachmentDefaultLabel("split-spa", "anything")).toBeUndefined();
  });
});
