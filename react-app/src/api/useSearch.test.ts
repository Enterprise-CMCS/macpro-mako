import { describe, expect, it } from "vitest";
import { getOsData } from "./useSearch";
import { cpocsList } from "mocks/data/cpocs";

describe("getOsData tests", () => {
  it("should return cpocs", async () => {
    const results = await getOsData({
      index: "cpocs",
      sort: {
        field: "lastName",
        order: "asc",
      },
      pagination: {
        number: 0,
        size: 20,
      },
      filters: [],
    });
    expect(results.hits.hits).toEqual(cpocsList);
  });
});
