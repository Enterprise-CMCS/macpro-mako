import { API } from "aws-amplify";
import { getFilteredDocList } from "mocks/data/items";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_FILTERS } from "@/components/Opensearch/main/useOpensearch";

import { getMainExportData } from "./useSearch";

describe("getMainExportData tests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return spa items", async () => {
    const results = await getMainExportData(DEFAULT_FILTERS.spas.filters, {
      field: "id",
      order: "desc",
    });
    expect(results).toEqual(getFilteredDocList(["Medicaid SPA", "CHIP SPA"]));
  });

  it("should return waiver items", async () => {
    const results = await getMainExportData(DEFAULT_FILTERS.waivers.filters, {
      field: "id",
      order: "desc",
    });
    expect(results).toEqual(getFilteredDocList(["1915(b)", "1915(c)"]));
  });

  it("should return an empty array if there are no filters", async () => {
    const results = await getMainExportData();
    expect(results).toEqual([]);
  });

  it("passes includeDrafts through when requested", async () => {
    const postSpy = vi.spyOn(API, "post").mockResolvedValue({
      hits: {
        hits: [],
      },
    });

    await getMainExportData(
      DEFAULT_FILTERS.spas.filters,
      {
        field: "id",
        order: "desc",
      },
      { includeDrafts: false },
    );

    expect(postSpy).toHaveBeenCalledWith("os", "/search/main", {
      body: expect.objectContaining({
        includeDrafts: false,
      }),
    });
  });
});
