import { describe, expect, it } from "vitest";

import {
  assertSafeSearchQuery,
  findUnsupportedSearchKey,
  UnsupportedSearchQueryError,
} from "./searchQueryGuard";

describe("search query guard", () => {
  it("allows the dashboard query shape", () => {
    expect(() =>
      assertSafeSearchQuery({
        from: 0,
        size: 100,
        track_total_hits: true,
        query: {
          bool: {
            must: [{ terms: { "authority.keyword": ["Medicaid SPA"] } }],
            filter: [{ range: { submissionDate: { gte: 1 } } }],
          },
        },
        aggs: {
          "state.keyword": { terms: { field: "state.keyword", size: 100 } },
        },
      }),
    ).not.toThrow();
  });

  it("rejects script and global clauses regardless of key case", () => {
    expect(findUnsupportedSearchKey({ Script_Fields: { t: { Script: { source: "1" } } } })).toBe(
      "script_fields",
    );
    expect(findUnsupportedSearchKey({ aggs: { everything: { Global: {} } } })).toBe("global");
    expect(findUnsupportedSearchKey({ sort: [{ _script: { order: "asc" } }] })).toBe("_script");
  });

  it.each(["suggest", "Suggest"])("rejects the %s option that bypasses query filters", (key) => {
    expect(() =>
      assertSafeSearchQuery({
        [key]: { states: { text: "CA", term: { field: "state.keyword" } } },
      }),
    ).toThrow(UnsupportedSearchQueryError);
  });
});
