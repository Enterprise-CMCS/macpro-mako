import { opensearch, SEATOOL_STATUS } from "shared-types";
import { describe, expect, it } from "vitest";

import { OsTableColumn } from "@/components";

import {
  buildStyledExportRows,
  getExportFilenameBase,
  getVisibleExportColumns,
} from "./export.utils";

describe("export utils", () => {
  it("buildStyledExportRows marks draft rows for italic styling", () => {
    const columns: OsTableColumn[] = [
      {
        label: "SPA ID",
        field: "id.keyword",
        transform: (data) => data.id,
        cell: () => null,
      },
      {
        label: "State",
        field: "state.keyword",
        transform: (data) => data.state,
        cell: () => null,
      },
    ];

    const items: opensearch.main.Document[] = [
      {
        id: "NY-25-2342",
        state: "NY",
        authority: "Medicaid SPA",
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        stateStatus: "Draft",
        cmsStatus: "Draft",
      } as opensearch.main.Document,
      {
        id: "NY-25-2343",
        state: "NY",
        authority: "Medicaid SPA",
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        stateStatus: "Submitted",
        cmsStatus: "Submitted - Intake Needed",
      } as opensearch.main.Document,
    ];

    const visibleColumns = getVisibleExportColumns(columns);
    const rows = buildStyledExportRows(visibleColumns, items);

    expect(rows).toEqual([
      { isDraft: true, values: ["NY-25-2342", "NY"] },
      { isDraft: false, values: ["NY-25-2343", "NY"] },
    ]);
  });

  it("getVisibleExportColumns excludes hidden and non-transform columns", () => {
    const columns: OsTableColumn[] = [
      {
        label: "Visible",
        transform: () => "value",
        cell: () => null,
      },
      {
        label: "Hidden",
        transform: () => "hidden",
        hidden: true,
        cell: () => null,
      },
      {
        label: "No transform",
        cell: () => null,
      },
    ];

    const result = getVisibleExportColumns(columns);
    expect(result.map((col) => col.label)).toEqual(["Visible"]);
  });

  it("getExportFilenameBase uses underscore date format", () => {
    const date = new Date("2026-02-26T12:00:00.000Z");
    expect(getExportFilenameBase("spas", date)).toEqual("spas-export-02_26_2026");
  });
});
