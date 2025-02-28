import { describe, test, expect } from "vitest";
import { schema, baseObjectSchema } from "./new-medicaid-submission";

describe("new-medicaid-submission schema", () => {
  test("validates draft submission with minimal data", () => {
    const draftData = {
      event: "new-medicaid-submission",
      authority: "Medicaid SPA",
      submissionStatus: "draft",
      id: "MD-00-0001",
      origin: "mako",
      submitterName: "Test User",
      submitterEmail: "test@example.com",
      timestamp: Date.now(),
      attachments: {
        cmsForm179: { files: [], label: "CMS Form 179" },
        spaPages: { files: [], label: "SPA Pages" },
        // ... other required attachment fields with empty arrays
      },
    };

    const result = schema.safeParse(draftData);
    expect(result.success).toBe(true);
  });

  test("validates full submission with all required fields", () => {
    const fullData = {
      event: "new-medicaid-submission",
      authority: "Medicaid SPA",
      submissionStatus: "submitted",
      id: "MD-00-0001",
      proposedEffectiveDate: Date.now(),
      origin: "mako",
      submitterName: "Test User",
      submitterEmail: "test@example.com",
      timestamp: Date.now(),
      attachments: {
        cmsForm179: {
          files: [{ filename: "test.pdf", key: "test", bucket: "test", uploadDate: "2024-01-01" }],
          label: "CMS Form 179",
        },
        spaPages: { files: [], label: "SPA Pages" },
        // ... other attachment fields
      },
    };

    const result = schema.safeParse(fullData);
    expect(result.success).toBe(true);
  });

  test("fails validation for non-draft missing required fields", () => {
    const invalidData = {
      event: "new-medicaid-submission",
      authority: "Medicaid SPA",
      submissionStatus: "submitted",
      origin: "mako",
      submitterName: "Test User",
      submitterEmail: "test@example.com",
      timestamp: Date.now(),
      // Missing id and proposedEffectiveDate
      attachments: {
        cmsForm179: { files: [], label: "CMS Form 179" },
        spaPages: { files: [], label: "SPA Pages" },
      },
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
