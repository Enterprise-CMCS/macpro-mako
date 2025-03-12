import { http, HttpResponse, PathParams } from "msw";

import { getFilteredItemList } from "../../data/items";
import { SearchQueryBody } from "../../index.d";
import { getAggregations, getFilterValueAsStringArray } from "../search.utils";

const defaultApiSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/search/:index",
  async ({ params, request }) => {
    const { index } = params;
    const { query, aggs } = await request.json();

    const must = query?.bool?.must;

    if (index === "main") {
      const authorityValues =
        getFilterValueAsStringArray(must, "terms", "authority.keyword") ||
        getFilterValueAsStringArray(must, "terms", "authority") ||
        [];
      const itemList = getFilteredItemList(authorityValues);

      const isSpa =
        authorityValues.includes("CHIP SPA") || authorityValues.includes("Medicaid SPA");

      const aggregations = getAggregations(aggs, isSpa);

      return HttpResponse.json({
        took: 3,
        timed_out: false,
        _shards: {
          total: 5,
          successful: 5,
          skipped: 0,
          failed: 0,
        },
        hits: {
          total: {
            value: itemList.length,
            relation: "eq",
          },
          max_score: 1,
          hits: itemList,
        },
        aggregations,
      });
    }

    return new HttpResponse(null, { status: 200 });
  },
);

export const errorApiSearchHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/search/:index",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const searchHandlers = [defaultApiSearchHandler];
