import { http, HttpResponse, PathParams } from "msw";
import { subtypes, ERROR_AUTHORITY_ID } from "../../data/types"
import {
  SearchQueryBody,
} from "../index.d";

export const defaultSubtypeSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-subtypes/_search",
  async ({ request }) => {
    const { query } = await request.json();
    
    const [{ match: { authorityId } }, { terms: { typeId }}] = query?.bool?.must || [];
    
    if (authorityId === ERROR_AUTHORITY_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    const hits = subtypes.filter(type =>
      type?._source?.authorityId == authorityId 
      && typeId.includes(type?._source?.typeId)
      && !type?._source?.name.match(/Do Not Use/)
    ) || []

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

