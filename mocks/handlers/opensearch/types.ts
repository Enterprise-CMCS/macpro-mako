import { http, HttpResponse, PathParams } from "msw";
import { types } from "../../data/types";
import { SearchQueryBody } from "../../index.d";
import { getFilterValueAsNumber } from "../search.utils";

const defaultOSTypeSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-types/_search",
  async ({ request }) => {
    const { query } = await request.json();
    const must = query?.bool?.must;

    const authorityId = getFilterValueAsNumber(must, "match", "authorityId");

    if (authorityId === undefined) {
      return new HttpResponse("Invalid authority Id", { status: 400 });
    }

    const hits =
      types.filter(
        (type) =>
          type?._source?.authorityId == authorityId && !type?._source?.name.match(/Do Not Use/),
      ) || [];

    return HttpResponse.json({
      took: 5,
      timed_out: false,
      _shards: {
        total: 5,
        successful: 5,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: hits.length,
          relation: "eq",
        },
        max_score: null,
        hits,
      },
    });
  },
);

export const errorOSTypeSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-types/_search",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const typeSearchHandlers = [defaultOSTypeSearchHandler];
