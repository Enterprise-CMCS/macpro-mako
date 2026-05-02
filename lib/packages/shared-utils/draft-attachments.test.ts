import { describe, expect, it } from "vitest";

import {
  getDraftAttachmentDefaultLabel,
  getDraftAttachmentKeyOrder,
  getDraftAttachments,
} from "./draft-attachments";

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

  it("normalizes draft attachments using schema order and default labels", () => {
    const uploadDate = Date.now();

    expect(
      getDraftAttachments({
        id: "MD-26-0001-P",
        event: "new-chip-details-submission",
        draft: {
          data: {
            attachments: {
              coverLetter: {
                files: [
                  {
                    filename: "cover.pdf",
                    bucket: "bucket",
                    key: "cover.pdf",
                    uploadDate,
                  },
                ],
              },
              chipEligibility: {
                files: [
                  {
                    filename: "template.pdf",
                    bucket: "bucket",
                    key: "template.pdf",
                    uploadDate,
                  },
                ],
              },
            },
          },
        },
      } as any),
    ).toEqual([
      {
        filename: "template.pdf",
        bucket: "bucket",
        key: "template.pdf",
        uploadDate,
        title: "CHIP Eligibility Template",
      },
      {
        filename: "cover.pdf",
        bucket: "bucket",
        key: "cover.pdf",
        uploadDate,
        title: "Cover Letter",
      },
    ]);
  });
});
