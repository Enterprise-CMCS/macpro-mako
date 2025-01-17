import { describe, expect, it } from "vitest";
import { getMainExportData } from "./useSearch";
import { DEFAULT_FILTERS } from "@/components/Opensearch/main/useOpensearch";
import { docList } from "mocks/data/items";

describe("getMainExportData tests", () => {
  it("should return cpocs", async () => {
    const results = await getMainExportData(DEFAULT_FILTERS.spas.filters);
    expect(results).toEqual(docList);
  });
});
