import { http, HttpResponse, PathParams } from "msw";

import { getFilteredUserResultList } from "../../data/osusers";
import { SearchQueryBody } from "../../index.d";
import { getFilterValueAsStringArray } from "../search.utils";

const defaultUserSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-users/_search",
  async ({ request }) => {
    const { query } = await request.json();
    let emails: string[] = [];

    if (query?.term) {
      const email = query?.term?.["email.keyword"] as string;
      emails = [email];
    }
    if (query?.bool?.should) {
      const should = query?.bool?.should;
      emails = getFilterValueAsStringArray(should, "term", "email.keyword");
    }

    const hits = getFilteredUserResultList(emails);

    return HttpResponse.json({
      took: 5,
      timed_out: false,
      _shards: {
        total: hits.length,
        successful: hits.length,
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

export const userHandlers = [defaultUserSearchHandler];
