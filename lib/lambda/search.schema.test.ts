import { opensearch } from "shared-types";
import { describe, expect, it } from "vitest";

import * as drawerFilters from "../../react-app/src/components/Opensearch/main/Filtering/Drawer/consts";
import {
  aggQueryBuilder,
  createSearchFilterable,
  filterQueryBuilder,
  paginationQueryBuilder,
  sortQueryBuilder,
} from "../../react-app/src/components/Opensearch/utils";
import { searchRequestSchema } from "./search.schema";

describe("search request compatibility", () => {
  const filters: opensearch.main.Filterable[] = [
    ...Object.values(drawerFilters).map((filter) => ({
      ...filter,
      value:
        filter.type === "range"
          ? { gte: "2026-01-01", lte: "2026-12-31" }
          : filter.type === "match"
            ? false
            : ["example"],
    })),
    ...createSearchFilterable("MD-26"),
    { field: "appkParentId", type: "exists", prefix: "must_not", value: true },
  ];

  it.each([true, false, undefined])(
    "accepts actual UI filter, search, pagination, and facet builders with includeDrafts=%s",
    (includeDrafts) => {
      const body = JSON.parse(
        JSON.stringify({
          ...filterQueryBuilder(filters),
          ...paginationQueryBuilder({ number: 1, size: 100 }),
          ...sortQueryBuilder({ field: "makoChangedDate", order: "desc" }),
          ...aggQueryBuilder(
            [
              "state.keyword",
              "authority.keyword",
              "actionType.keyword",
              "cmsStatus.keyword",
              "stateStatus.keyword",
              "leadAnalystName.keyword",
            ].map((field) => ({ name: field, field, type: "terms", size: 1000 })),
          ),
          track_total_hits: true,
          includeDrafts,
        }),
      );

      expect(searchRequestSchema.parse(body)).toEqual(body);
    },
  );

  it.each([
    "id.keyword",
    "state.keyword",
    "authority.keyword",
    "actionType.keyword",
    "cmsStatus.keyword",
    "stateStatus.keyword",
    "submissionDate",
    "finalDispositionDate",
    "makoChangedDate",
    "raiRequestedDate",
    "raiReceivedDate",
    "leadAnalystName.keyword",
    "submitterName.keyword",
  ])("accepts sorting and the final export page for dashboard column %s", (field) => {
    const body = {
      ...filterQueryBuilder(filters),
      ...paginationQueryBuilder({ number: 9, size: 1000 }),
      ...sortQueryBuilder({ field, order: "asc" }),
    };

    expect(searchRequestSchema.parse(body)).toEqual(body);
  });

  it("accepts an empty search and an aggregation-only search with zero hits", () => {
    expect(searchRequestSchema.parse({})).toEqual({});
    expect(searchRequestSchema.parse({ size: 0 })).toEqual({ size: 0 });
  });

  it.each([
    { size: -1 },
    { size: 1001 },
    { from: -1 },
    { from: 10000, size: 1 },
    { from: 0.5 },
    { aggs: { states: { terms: { field: "state.keyword", size: 1001 } } } },
    { query: { bool: { must: { term: { state: "MD" } } } } },
    { query: { bool: { must: [], script: "true" } } },
    { query: { bool: { must: [{ bool: { should: [{ script: { script: "true" } }] } }] } } },
    { query: { dis_max: { queries: [{ script: { script: "true" } }] } } },
    { query: { wildcard: { "id.keyword": { value: "*", script: "true" } } } },
    { query: { range: { submissionDate: { gte: "2026-01-01", script: "true" } } } },
    { query: { term: { _index: "valroles" } } },
    { query: { term: { "draft.data.id": "MD-26-0001" } } },
    { runtime_mappings: { state: { type: "keyword", script: "emit('MD')" } } },
    { _source: true },
    { post_filter: { match_all: {} } },
    { includeDrafts: "true" },
  ])("rejects malformed, excessive, or unsupported requests: %j", (body) => {
    expect(searchRequestSchema.safeParse(body).success).toBe(false);
  });
});
