import { describe, expect, it } from "vitest";

import { BLANK_VALUE } from "@/consts";

import {
  formatCentraSubmissionDate,
  formatHardshipKindLabel,
  formatPackageAuthorityLabel,
  formatSpaGridAuthority,
  isCeHardshipException,
  readCentraHardshipKind,
  readCentraSubmissionDate,
} from "./centra";

describe("centra display helpers", () => {
  it("maps the CEntra authority and leaves other authorities unchanged", () => {
    expect(isCeHardshipException("CE_HARDSHIP_EXCEPTION")).toBe(true);
    expect(isCeHardshipException("Medicaid SPA")).toBe(false);
    expect(formatPackageAuthorityLabel("CE_HARDSHIP_EXCEPTION")).toBe("CE Hardship Exception");
    expect(formatPackageAuthorityLabel("Medicaid SPA")).toBe("Medicaid SPA");
    expect(formatSpaGridAuthority("CE_HARDSHIP_EXCEPTION")).toBe("CE Hardship Exception");
    expect(formatSpaGridAuthority("CHIP SPA")).toBe("CHIP SPA");
    expect(formatPackageAuthorityLabel(undefined)).toBeUndefined();
    expect(formatSpaGridAuthority(undefined)).toBe(BLANK_VALUE);
  });

  it("maps hardship kind codes to the shared labels", () => {
    expect(formatHardshipKindLabel("CE_UNEMPLOYMENT")).toBe("High Unemployment Requests");
    expect(formatHardshipKindLabel("CE_SADE")).toBe("Stafford Act Disaster and Emergency Requests");
    expect(formatHardshipKindLabel("CE_NEA")).toBe("National Emergencies Act Requests");
    expect(formatHardshipKindLabel("CE_OTHER")).toBe(BLANK_VALUE);
    expect(formatHardshipKindLabel(undefined)).toBe(BLANK_VALUE);
  });

  it("reads request type and submission date from the record or the draft", () => {
    expect(
      readCentraHardshipKind({
        hardshipKind: undefined,
        draft: { data: { hardshipKind: "CE_NEA" } },
      }),
    ).toBe("CE_NEA");
    expect(readCentraHardshipKind({ hardshipKind: "CE_SADE" })).toBe("CE_SADE");
    expect(
      readCentraSubmissionDate({
        proposedDate: undefined,
        draft: { data: { proposedEffectiveDate: 1774396800000 } },
      }),
    ).toBe(1774396800000);
  });

  it("formats epoch milliseconds and seconds as a UTC calendar date", () => {
    expect(formatCentraSubmissionDate(1774396800000)).toBe("March 25, 2026");
    expect(formatCentraSubmissionDate(1774396800)).toBe("March 25, 2026");
    expect(formatCentraSubmissionDate(undefined)).toBe(BLANK_VALUE);
  });
});
