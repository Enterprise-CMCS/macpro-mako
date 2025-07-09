import { describe, expect, it } from "vitest";

import { mapSubmissionTypeBasedOnActionFormTitle } from "./Mapper";

describe("mapSubmissionTypeBasedOnActionFormTitle", () => {
  it("maps 'CHIP SPA Details' correctly", () => {
    expect(mapSubmissionTypeBasedOnActionFormTitle("CHIP SPA Details")).toBe("chip spa");
  });

  it("maps 'Medicaid SPA Details' correctly", () => {
    expect(mapSubmissionTypeBasedOnActionFormTitle("Medicaid SPA Details")).toBe("medicaid spa");
  });

  it("maps 'Temporary Extension Request Details' correctly", () => {
    expect(mapSubmissionTypeBasedOnActionFormTitle("Temporary Extension Request Details")).toBe(
      "temporary extension",
    );
  });

  it("maps '1915(b)(4) FFS Selective Contracting Initial Waiver Details' correctly", () => {
    expect(
      mapSubmissionTypeBasedOnActionFormTitle(
        "1915(b)(4) FFS Selective Contracting Initial Waiver Details",
      ),
    ).toBe("1915b(4) initial waiver");
  });

  it("maps '1915(b)(4) FFS Selective Contracting Renewal Waiver Details' correctly", () => {
    expect(
      mapSubmissionTypeBasedOnActionFormTitle(
        "1915(b)(4) FFS Selective Contracting Renewal Waiver Details",
      ),
    ).toBe("1915b(4) waiver renewal");
  });

  it("maps '1915(b)(4) FFS Selective Contracting Waiver Amendment Details' correctly", () => {
    expect(
      mapSubmissionTypeBasedOnActionFormTitle(
        "1915(b)(4) FFS Selective Contracting Waiver Amendment Details",
      ),
    ).toBe("1915b(4) waiver amendment");
  });

  it("maps '1915(b) Comprehensive (Capitated) Initial Waiver Details' correctly", () => {
    expect(
      mapSubmissionTypeBasedOnActionFormTitle(
        "1915(b) Comprehensive (Capitated) Initial Waiver Details",
      ),
    ).toBe("1915b capitated inital");
  });

  it("maps '1915(b) Comprehensive (Capitated) Renewal Waiver Details' correctly", () => {
    expect(
      mapSubmissionTypeBasedOnActionFormTitle(
        "1915(b) Comprehensive (Capitated) Renewal Waiver Details",
      ),
    ).toBe("1915b capitated renewal");
  });

  it("maps '1915(b) Comprehensive (Capitated) Waiver Amendment Details' correctly", () => {
    expect(
      mapSubmissionTypeBasedOnActionFormTitle(
        "1915(b) Comprehensive (Capitated) Waiver Amendment Details",
      ),
    ).toBe("1915b capitated amendment");
  });

  it("maps '1915(c) Appendix K Amendment Details' correctly", () => {
    expect(mapSubmissionTypeBasedOnActionFormTitle("1915(c) Appendix K Amendment Details")).toBe(
      "1915c app-k",
    );
  });

  it("returns undefined for unmatched titles", () => {
    expect(mapSubmissionTypeBasedOnActionFormTitle("Some Other Title")).toBeUndefined();
  });
});
