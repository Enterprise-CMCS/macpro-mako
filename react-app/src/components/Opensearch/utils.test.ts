import { describe, expect, it } from "vitest";
import {
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
  aggQueryBuilder,
  createSearchFilterable,
  checkMultiFilter,
} from "./utils";

describe("Opensearch utils tests", () => {
  describe("filterQueryBuilder tests", () => {
    it("should handle undefined filters", () => {
      const results = filterQueryBuilder(undefined);
      expect(results).toEqual({});
    });
    it("should handle null filters", () => {
      const results = filterQueryBuilder(null);
      expect(results).toEqual({});
    });
    it("should handle empty filters", () => {
      const results = filterQueryBuilder([]);
      expect(results).toEqual({});
    });
    it("should handle exists filter without a value", () => {
      const results = filterQueryBuilder([
        // @ts-expect-error
        {
          type: "exists",
          prefix: "must",
          field: "origin",
        },
      ]);
      expect(results).toEqual({
        query: {
          bool: {
            must: [{ exists: { field: "origin" } }],
            must_not: [],
            should: [],
            filter: [],
          },
        },
      });
    });
    it("should handle an invalid prefix", () => {
      const result = filterQueryBuilder([
        {
          // @ts-expect-error
          type: "mismatch",
          prefix: "must",
          field: "authority.keyword",
          value: ["Medicaid SPA", "CHIP SPA"],
        },
      ]);
      expect(result).toEqual({
        query: {
          bool: {
            must: [],
            must_not: [],
            should: [],
            filter: [],
          },
        },
      });
    });
    it.each([["terms"], ["term"], ["range"], ["global_search"]])(
      "should handle %s filter without a value",
      (type) => {
        const results = filterQueryBuilder([
          {
            // @ts-expect-error
            type,
            prefix: "must",
            field: "authority.keyword",
          },
        ]);
        expect(results).toEqual({
          query: {
            bool: {
              must: [],
              must_not: [],
              should: [],
              filter: [],
            },
          },
        });
      },
    );
    it("should handle match filter with a false value", () => {
      const results = filterQueryBuilder([
        {
          type: "match",
          prefix: "must",
          field: "authority.keyword",
          value: false,
        },
      ]);
      expect(results).toEqual({
        query: {
          bool: {
            must: [{ match: { "authority.keyword": false } }],
            must_not: [],
            should: [],
            filter: [],
          },
        },
      });
    });
    it.each([
      [
        "terms",
        "authority.keyword",
        ["Medicaid SPA", "CHIP SPA"],
        [{ terms: { "authority.keyword": ["Medicaid SPA", "CHIP SPA"] } }],
      ],
      ["term", "state", "MD", [{ term: { state: "MD" } }]],
      ["exists", "origin", "OneMAC", [{ exists: { field: "origin" } }]],
      [
        "range",
        "timestamp",
        ["1677715190000", "1677715210000"],
        [{ range: { timestamp: ["1677715190000", "1677715210000"] } }],
      ],
    ])("should handle must %s filters", (type, field, value, expected) => {
      const results = filterQueryBuilder([
        {
          // @ts-expect-error
          type,
          prefix: "must",
          field,
          value,
        },
      ]);
      expect(results).toEqual({
        query: {
          bool: {
            must: expected,
            must_not: [],
            should: [],
            filter: [],
          },
        },
      });
    });
    it("should handle a global_search filter", () => {
      const results = filterQueryBuilder([
        {
          type: "global_search",
          prefix: "must",
          field: "authority",
          value: "   CHIP SPA   ",
        },
      ]);
      expect(results).toEqual({
        query: {
          bool: {
            must: [
              {
                dis_max: {
                  tie_breaker: 0.7,
                  boost: 1.2,
                  queries: [
                    {
                      wildcard: {
                        "id.keyword": {
                          value: "*CHIP SPA*",
                          case_insensitive: true,
                        },
                      },
                    },
                    {
                      wildcard: {
                        "submitterName.keyword": {
                          value: "*CHIP SPA*",
                          case_insensitive: true,
                        },
                      },
                    },
                    {
                      wildcard: {
                        "leadAnalystName.keyword": {
                          value: "*CHIP SPA*",
                          case_insensitive: true,
                        },
                      },
                    },
                  ],
                },
              },
            ],
            must_not: [],
            should: [],
            filter: [],
          },
        },
      });
    });
    it("should handle multiple filters", () => {
      const results = filterQueryBuilder([
        {
          type: "terms",
          prefix: "must",
          field: "authority.keyword",
          value: ["Medicaid SPA", "CHIP SPA"],
        },
        {
          type: "term",
          prefix: "must_not",
          field: "state",
          value: "MD",
        },
        // @ts-expect-error
        {
          type: "exists",
          prefix: "should",
          field: "origin",
        },
        {
          type: "range",
          prefix: "filter",
          field: "timestamp",
          value: ["1677715190000", "1677715210000"],
        },
        {
          type: "global_search",
          prefix: "must",
          field: "authority",
          value: "   CHIP SPA   ",
        },
      ]);
      expect(results).toEqual({
        query: {
          bool: {
            must: [
              { terms: { "authority.keyword": ["Medicaid SPA", "CHIP SPA"] } },
              {
                dis_max: {
                  tie_breaker: 0.7,
                  boost: 1.2,
                  queries: [
                    {
                      wildcard: {
                        "id.keyword": {
                          value: "*CHIP SPA*",
                          case_insensitive: true,
                        },
                      },
                    },
                    {
                      wildcard: {
                        "submitterName.keyword": {
                          value: "*CHIP SPA*",
                          case_insensitive: true,
                        },
                      },
                    },
                    {
                      wildcard: {
                        "leadAnalystName.keyword": {
                          value: "*CHIP SPA*",
                          case_insensitive: true,
                        },
                      },
                    },
                  ],
                },
              },
            ],
            must_not: [{ term: { state: "MD" } }],
            should: [{ exists: { field: "origin" } }],
            filter: [{ range: { timestamp: ["1677715190000", "1677715210000"] } }],
          },
        },
      });
    });
  });

  describe("paginationQueryBuilder tests", () => {
    it("should handle an undefined pagination", () => {
      const result = paginationQueryBuilder(undefined);
      expect(result).toEqual({});
    });
    it("should handle a null pagination", () => {
      const result = paginationQueryBuilder(null);
      expect(result).toEqual({});
    });
    it("should handle an empty pagination", () => {
      // @ts-expect-error
      const result = paginationQueryBuilder({});
      expect(result).toEqual({
        from: 0,
        size: 25,
      });
    });
    it("should handle an undefined number", () => {
      // @ts-expect-error
      const result = paginationQueryBuilder({ size: 20 });
      expect(result).toEqual({
        from: 0,
        size: 20,
      });
    });
    it("should handle 0 number", () => {
      const result = paginationQueryBuilder({ number: 0, size: 20 });
      expect(result).toEqual({
        from: 0,
        size: 20,
      });
    });
    it("should handle a negative number", () => {
      const result = paginationQueryBuilder({ number: -3, size: 20 });
      expect(result).toEqual({
        from: 0,
        size: 20,
      });
    });
    it("should handle an undefined size", () => {
      // @ts-expect-error
      const result = paginationQueryBuilder({ number: 1 });
      expect(result).toEqual({
        from: 0,
        size: 25,
      });
    });
    it("should handle 0 size", () => {
      const result = paginationQueryBuilder({ number: 1, size: 0 });
      expect(result).toEqual({
        from: 0,
        size: 25,
      });
    });
    it("should handle a negative size", () => {
      const result = paginationQueryBuilder({ number: 1, size: -3 });
      expect(result).toEqual({
        from: 0,
        size: 25,
      });
    });
    it("should handle a valid number and size", () => {
      const result = paginationQueryBuilder({ number: 2, size: 20 });
      expect(result).toEqual({
        from: 40,
        size: 20,
      });
    });
  });

  describe("sortQueryBuilder tests", () => {
    it("should handle an undefined sort", () => {
      const result = sortQueryBuilder(undefined);
      expect(result).toEqual({});
    });
    it("should handle a null sort", () => {
      const result = sortQueryBuilder(null);
      expect(result).toEqual({});
    });
    it("should handle an empty sort", () => {
      // @ts-expect-error
      const result = sortQueryBuilder({});
      expect(result).toEqual({});
    });
    it("should handle an undefined field", () => {
      // @ts-expect-error
      const result = sortQueryBuilder({ order: "asc" });
      expect(result).toEqual({});
    });
    it("should handle a null field", () => {
      const result = sortQueryBuilder({ field: null, order: "asc" });
      expect(result).toEqual({});
    });
    it("should handle an undefined order", () => {
      // @ts-expect-error
      const result = sortQueryBuilder({ field: "test" });
      expect(result).toEqual({ sort: [{ test: "asc" }] });
    });
    it("should handle a null field", () => {
      const result = sortQueryBuilder({ field: "test", order: null });
      expect(result).toEqual({ sort: [{ test: "asc" }] });
    });
    it("should handle a valid sort", () => {
      const result = sortQueryBuilder({ field: "test", order: "desc" });
      expect(result).toEqual({ sort: [{ test: "desc" }] });
    });
  });

  describe("aggQueryBuilder tests", () => {
    it("should handle an undefined aggregation", () => {
      const result = aggQueryBuilder(undefined);
      expect(result).toEqual({});
    });
    it("should handle a null aggregation", () => {
      const result = aggQueryBuilder(null);
      expect(result).toEqual({});
    });
    it("should handle an empty aggregation", () => {
      const result = aggQueryBuilder([]);
      expect(result).toEqual({});
    });
    it("should handle an aggregation with an undefined name", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          type: "term",
          field: "authority.keyword",
          size: 25,
        },
      ]);
      expect(result).toEqual({
        aggs: {},
      });
    });
    it("should handle an aggregation with an undefined type", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          name: "must",
          field: "authority.keyword",
          size: 25,
        },
      ]);
      expect(result).toEqual({
        aggs: {},
      });
    });
    it("should handle an aggregation with an undefined field", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          name: "must",
          type: "term",
          size: 25,
        },
      ]);
      expect(result).toEqual({
        aggs: {},
      });
    });
    it("should handle an aggregation with an undefined size", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          name: "must",
          type: "term",
          field: "authority.keyword",
        },
      ]);
      expect(result).toEqual({
        aggs: {
          must: {
            term: {
              field: "authority.keyword",
              order: { _term: "asc" },
            },
          },
        },
      });
    });
    it("should handle an aggregation with one definition", () => {
      const result = aggQueryBuilder([
        {
          name: "must",
          type: "term",
          field: "authority.keyword",
          size: 50,
        },
      ]);
      expect(result).toEqual({
        aggs: {
          must: {
            term: {
              field: "authority.keyword",
              order: { _term: "asc" },
              size: 50,
            },
          },
        },
      });
    });
    it("should handle an aggregation with multiple definitions", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          name: "must",
          type: "terms",
          field: "state",
        },
        {
          name: "must_not",
          type: "match",
          field: "origin",
          size: 40,
        },
      ]);
      expect(result).toEqual({
        aggs: {
          must: {
            terms: {
              field: "state",
              order: { _term: "asc" },
            },
          },
          must_not: {
            match: {
              field: "origin",
              order: { _term: "asc" },
              size: 40,
            },
          },
        },
      });
    });
    it("should overwrite aggregations with the same name and type", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          name: "must",
          type: "terms",
          field: "state",
        },
        {
          name: "must",
          type: "terms",
          field: "origin",
          size: 40,
        },
      ]);
      expect(result).toEqual({
        aggs: {
          must: {
            terms: {
              field: "origin",
              order: { _term: "asc" },
              size: 40,
            },
          },
        },
      });
    });
    it("should over aggregations with the same name and different types", () => {
      const result = aggQueryBuilder([
        // @ts-expect-error
        {
          name: "must",
          type: "terms",
          field: "state",
        },
        {
          name: "must",
          type: "match",
          field: "origin",
          size: 40,
        },
      ]);
      expect(result).toEqual({
        aggs: {
          must: {
            match: {
              field: "origin",
              order: { _term: "asc" },
              size: 40,
            },
          },
        },
      });
    });
  });

  describe("createSearchFilterable tests", () => {
    it("should handle an undefined value", () => {
      const result = createSearchFilterable(undefined);
      expect(result).toEqual([]);
    });
    it("should handle a null value", () => {
      const result = createSearchFilterable(null);
      expect(result).toEqual([]);
    });
    it("should handle an empty value", () => {
      const result = createSearchFilterable("");
      expect(result).toEqual([]);
    });
    it("should handle a value", () => {
      const result = createSearchFilterable("test");
      expect(result).toEqual([
        {
          type: "global_search",
          field: "",
          value: "test",
          prefix: "must",
        },
      ]);
    });
  });

  describe("checkMultiFilter tests", () => {
    it("should return true undefined filters and undefined val", () => {
      const result = checkMultiFilter(undefined, undefined);
      expect(result).toBe(true);
    });
    it("should return true for equal filters and val", () => {
      const result = checkMultiFilter(
        [
          {
            prefix: "must",
            type: "terms",
            field: "authority.keyword",
            value: ["Medicaid SPA", "CHIP SPA"],
          },
        ],
        1,
      );
      expect(result).toBe(true);
    });
    it("should return true for more filters than val", () => {
      const result = checkMultiFilter(
        [
          {
            prefix: "must",
            type: "terms",
            field: "authority.keyword",
            value: ["Medicaid SPA", "CHIP SPA"],
          },
          {
            prefix: "must",
            type: "exists",
            field: "origin",
            value: true,
          },
        ],
        1,
      );
      expect(result).toBe(true);
    });
    it("should return true for more filter values than val", () => {
      const result = checkMultiFilter(
        [
          {
            prefix: "must",
            type: "terms",
            field: "authority.keyword",
            value: ["Medicaid SPA", "CHIP SPA", "1915(b)", "1915(c)"],
          },
          {
            prefix: "must",
            type: "exists",
            field: "origin",
            value: true,
          },
        ],
        3,
      );
      expect(result).toBe(true);
    });
    it("should return false for less filters than val", () => {
      const result = checkMultiFilter(
        [
          {
            prefix: "must",
            type: "terms",
            field: "authority.keyword",
            value: ["Medicaid SPA", "CHIP SPA"],
          },
          {
            prefix: "must",
            type: "exists",
            field: "origin",
            value: true,
          },
        ],
        4,
      );
      expect(result).toBe(false);
    });
    it("should return false for filter values less than val", () => {
      const result = checkMultiFilter(
        [
          {
            prefix: "must",
            type: "terms",
            field: "authority.keyword",
            value: ["Medicaid SPA"],
          },
        ],
        2,
      );
      expect(result).toBe(false);
    });
  });
});
