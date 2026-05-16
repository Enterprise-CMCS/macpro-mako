import { describe, expect, it } from "vitest";

import {
  classifyPackageRepairCandidate,
  getIntegrityReportPackageIds,
  parseIntegrityReportCsv,
  resolveQueuedPackageIds,
} from "./repair-audit";

describe("attachment archive repair audit helpers", () => {
  it("parses integrity report csv rows and extracts unique package ids", () => {
    const rows = parseIntegrityReportCsv(
      [
        "authority,packageId,sectionId,cmsStatus,submissionDate,issueScope,discrepancyType,expectedValue,actualValue",
        'Medicaid SPA,MD-1,,Pending,2026-04-20T00:00:00.000Z,Download All,PACKAGE_FILE_MISSING,"{""count"":2,""samples"":[""a,b""]}",missing',
        "Medicaid SPA,MD-2,MD-2-s1,Pending,2026-04-20T00:00:00.000Z,Section,SECTION_CURRENT_MISSING,expected,actual",
        "Medicaid SPA,MD-1,MD-1-s1,Pending,2026-04-20T00:00:00.000Z,Section,SECTION_ZIP_MISSING,expected,actual",
      ].join("\n"),
    );

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          packageId: "MD-1",
          discrepancyType: "PACKAGE_FILE_MISSING",
          expectedValue: '{"count":2,"samples":["a,b"]}',
        }),
        expect.objectContaining({
          packageId: "MD-2",
          sectionId: "MD-2-s1",
          issueScope: "Section",
        }),
      ]),
    );
    expect(getIntegrityReportPackageIds(rows)).toEqual(["MD-1", "MD-2"]);
  });

  it("classifies scan-blocked failed packages as repairable scan failures", () => {
    expect(
      classifyPackageRepairCandidate({
        currentEntries: [{ status: "FAILED", failureCode: "ATTACHMENT_NOT_CLEAN" }],
        sourceInspections: [{ exists: true, virusScanStatus: "UKNOWNEXT" }],
      }),
    ).toBe("repairable_scan_failure");
  });

  it("classifies terminal failed packages as exception candidates when nothing is repairable", () => {
    expect(
      classifyPackageRepairCandidate({
        currentEntries: [
          { status: "FAILED", failureCode: "ALL_ATTACHMENTS_UNAVAILABLE" },
          { status: "FAILED", failureCode: "ALL_ATTACHMENTS_UNAVAILABLE" },
        ],
        sourceInspections: [{ exists: false }],
      }),
    ).toBe("terminal_exception_candidate");
  });

  it("classifies packages without failed currents as rebuild only", () => {
    expect(
      classifyPackageRepairCandidate({
        currentEntries: [{ status: "READY" }],
        sourceInspections: [],
      }),
    ).toBe("rebuild_only");
  });

  it("classifies generic failed packages as residual worker failures", () => {
    expect(
      classifyPackageRepairCandidate({
        currentEntries: [{ status: "FAILED" }],
        sourceInspections: [{ exists: true, virusScanStatus: "CLEAN" }],
      }),
    ).toBe("residual_worker_failure");
  });

  it("queues all input packages when rebuild-input-packages mode is enabled", () => {
    expect(
      resolveQueuedPackageIds({
        inputPackageIds: ["MD-1", "MD-2"],
        packageIdsToRebuild: ["MD-1"],
        rebuildInputPackages: true,
      }),
    ).toEqual(["MD-1", "MD-2"]);

    expect(
      resolveQueuedPackageIds({
        inputPackageIds: ["MD-1", "MD-2"],
        packageIdsToRebuild: ["MD-1"],
        rebuildInputPackages: false,
      }),
    ).toEqual(["MD-1"]);
  });
});
