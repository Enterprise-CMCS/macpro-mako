import { describe, expect, it } from "vitest";
import { getMainExportData } from "./useSearch";
import { DEFAULT_FILTERS } from "@/components/Opensearch/main/useOpensearch";
import { getFilteredDocList } from "mocks/data/items";

describe("getMainExportData tests", () => {
  it("should return spa items", async () => {
    const results = await getMainExportData(DEFAULT_FILTERS.spas.filters);
    expect(results).toEqual(getFilteredDocList(["Medicaid SPA", "CHIP SPA"]));
  });

  it("should return waiver items", async () => {
    const results = await getMainExportData(DEFAULT_FILTERS.waivers.filters);
    expect(results).toEqual(getFilteredDocList(["1915(b)", "1915(c)"]));
  });

  it("should return an empty array if there are no filters", async () => {
    const results = await getMainExportData();
    expect(results).toEqual([]);
  });
});
