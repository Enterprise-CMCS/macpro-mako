import { describe, expect, test } from "vitest";

import { getDraftIdConflictFieldMessage } from "./drafts";

describe("getDraftIdConflictFieldMessage", () => {
  test("returns SPA-specific duplicate copy for SPA drafts", () => {
    expect(getDraftIdConflictFieldMessage("new-medicaid-submission")).toBe(
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
    );
    expect(getDraftIdConflictFieldMessage("new-chip-submission")).toBe(
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
    );
    expect(getDraftIdConflictFieldMessage("new-chip-details-submission")).toBe(
      "According to our records, this SPA ID already exists. Please check the SPA ID and try entering it again.",
    );
  });

  test("returns waiver-specific duplicate copy for 1915(b) drafts", () => {
    expect(getDraftIdConflictFieldMessage("capitated-initial")).toBe(
      "According to our records, this 1915(b) Waiver Number already exists. Please check the 1915(b) Waiver Number and try entering it again.",
    );
    expect(getDraftIdConflictFieldMessage("contracting-renewal")).toBe(
      "According to our records, this 1915(b) Waiver Renewal Number already exists. Please check the 1915(b) Waiver Renewal Number and try entering it again.",
    );
    expect(getDraftIdConflictFieldMessage("contracting-amendment")).toBe(
      "According to our records, this 1915(b) Waiver Amendment Number already exists. Please check the 1915(b) Waiver Amendment Number and try entering it again.",
    );
  });

  test("returns event-specific copy for temporary extensions and app k", () => {
    expect(getDraftIdConflictFieldMessage("temporary-extension")).toBe(
      "According to our records, this Temporary Extension Request Number already exists. Please check the Temporary Extension Request Number and try entering it again.",
    );
    expect(getDraftIdConflictFieldMessage("app-k")).toBe(
      "According to our records, this Waiver Amendment Number already exists. Please check the Waiver Amendment Number and try entering it again.",
    );
  });

  test("falls back to generic duplicate copy for unknown events", () => {
    expect(getDraftIdConflictFieldMessage("unknown-event")).toBe(
      "According to our records, this ID already exists. Please check the ID and try entering it again.",
    );
    expect(getDraftIdConflictFieldMessage()).toBe(
      "According to our records, this ID already exists. Please check the ID and try entering it again.",
    );
  });
});
