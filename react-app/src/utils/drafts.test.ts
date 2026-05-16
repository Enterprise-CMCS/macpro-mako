import { SEATOOL_STATUS } from "shared-types";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  consumeDraftContinueConfirmed,
  getDraftDashboardLink,
  getDraftEditLink,
  getDraftIdConflictFieldMessage,
  getNonOwnerDraftDeleteModalBody,
  getNonOwnerDraftWarningModalBody,
  isCurrentUserDraftActor,
  markDraftContinueConfirmed,
} from "./drafts";

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

describe("draft continue confirmation storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("marks and consumes a draft continue confirmation once", () => {
    markDraftContinueConfirmed("md-26-1234-p", "Submitter@Example.com");

    expect(consumeDraftContinueConfirmed("MD-26-1234-P", "submitter@example.com")).toBe(true);
    expect(consumeDraftContinueConfirmed("MD-26-1234-P", "submitter@example.com")).toBe(false);
  });

  test("returns false when session storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    expect(consumeDraftContinueConfirmed("MD-26-1234-P", "submitter@example.com")).toBe(false);
  });
});

describe("isCurrentUserDraftActor", () => {
  test("matches by normalized email before name", () => {
    expect(
      isCurrentUserDraftActor({ email: "submitter@example.com", fullName: "Different Name" }, [
        { email: " Submitter@Example.com ", name: "State Submitter" },
      ]),
    ).toBe(true);
  });

  test("falls back to name only for legacy actor records without email", () => {
    expect(
      isCurrentUserDraftActor(
        { email: "new@example.com", given_name: "State", family_name: "Submitter" },
        [{ name: "state submitter" }],
      ),
    ).toBe(true);
  });

  test("does not match by name when the actor has a different explicit email", () => {
    expect(
      isCurrentUserDraftActor({ email: "submitter@example.com", fullName: "State Submitter" }, [
        { email: "other@example.com", name: "State Submitter" },
      ]),
    ).toBe(false);
  });
});

describe("draft links and copy", () => {
  test("builds edit and dashboard links for draft records", () => {
    const record = {
      id: "MD-26-1234-P",
      authority: "Medicaid SPA",
      event: "new-medicaid-submission",
      seatoolStatus: SEATOOL_STATUS.DRAFT,
    } as const;

    expect(getDraftEditLink(record as never)).toEqual({
      pathname: "/new-submission/spa/medicaid/create",
      search: "draftId=MD-26-1234-P&origin=spas",
    });
    expect(getDraftDashboardLink(record as never)).toBe("/dashboard?tab=spas");
  });

  test("returns null edit links for non-draft or unmapped events", () => {
    expect(
      getDraftEditLink({
        id: "MD-26-1234-P",
        authority: "Medicaid SPA",
        event: "new-medicaid-submission",
        seatoolStatus: "Submitted",
      } as never),
    ).toBeNull();
    expect(
      getDraftEditLink({
        id: "MD-26-1234-P",
        authority: "Medicaid SPA",
        event: "unsupported-event",
        seatoolStatus: SEATOOL_STATUS.DRAFT,
      } as never),
    ).toBeNull();
  });

  test("falls back to dashboard when authority cannot be mapped", () => {
    expect(
      getDraftDashboardLink({
        id: "MD-26-1234-P",
        authority: "Unknown",
      } as never),
    ).toBe("/dashboard");
  });

  test("uses most recent editor copy in non-owner modals", () => {
    expect(getNonOwnerDraftWarningModalBody("MD-26-1234-P")).toContain(
      "creator or most recent editor",
    );
    expect(getNonOwnerDraftDeleteModalBody("MD-26-1234-P")).toContain(
      "creator or most recent editor",
    );
  });
});
