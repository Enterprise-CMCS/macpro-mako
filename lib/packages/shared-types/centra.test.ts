import { describe, expect, it } from "vitest";

import {
  CE_ADDITIONAL_INFORMATION_MAX_LENGTH,
  CE_ATTACHMENT_LABELS,
  CE_HARDSHIP_EXCEPTION_AUTHORITY,
  CE_HARDSHIP_EXCEPTION_LABEL,
  CE_HARDSHIP_KIND_LABELS,
  CE_PACKAGE_ID_REGEX,
  isCePackageId,
} from "./centra";

describe("CEntra contract", () => {
  it("maps hardship kinds to Request Type labels", () => {
    expect(CE_HARDSHIP_KIND_LABELS).toEqual({
      CE_UNEMPLOYMENT: "High Unemployment Requests",
      CE_SADE: "Stafford Act Disaster and Emergency Requests",
      CE_NEA: "National Emergencies Act Requests",
    });
    expect(CE_HARDSHIP_EXCEPTION_AUTHORITY).toBe("CE_HARDSHIP_EXCEPTION");
    expect(CE_HARDSHIP_EXCEPTION_LABEL).toBe("CE Hardship Exception");
    expect(CE_ATTACHMENT_LABELS).toEqual({
      ceTemplate: "Template",
      other: "Other Supporting Documentation",
    });
  });

  it("accepts SS-CE-YY-### ids that start with a known state code", () => {
    expect(CE_PACKAGE_ID_REGEX.test("MD-CE-26-001")).toBe(true);
    expect(isCePackageId("MD-CE-26-001")).toBe(true);
    expect(isCePackageId("ZZ-CE-26-001")).toBe(true);
    expect(isCePackageId("MD-CE-26-0001")).toBe(false);
    expect(isCePackageId("MD-26-0001")).toBe(false);
    expect(isCePackageId("QQ-CE-26-001")).toBe(false);
    expect(isCePackageId("md-ce-26-001")).toBe(false);
    expect(CE_ADDITIONAL_INFORMATION_MAX_LENGTH).toBe(4000);
  });
});
