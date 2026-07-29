import { http, HttpResponse, PathParams } from "msw";

import { getFilteredUserResultList } from "../../data/osusers";
import { SearchQueryBody } from "../../index.d";
import { getFilterValueAsStringArray } from "../search.utils";

type QueryRules = Parameters<typeof getFilterValueAsStringArray>[0];

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";

const toQueryArray = (query: QueryRules) => (Array.isArray(query) ? query : query ? [query] : []);

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
      const termEmails = getFilterValueAsStringArray(should, "term", "email.keyword");
      const wildcardEmails = toQueryArray(should)
        .map((rule: any) => rule?.wildcard?.["email.keyword"])
        .flatMap((value: any) =>
          typeof value === "string"
            ? [value]
            : value && typeof value === "object" && "value" in value
              ? [String(value.value)]
              : [],
        );
      emails = [...new Set([...termEmails, ...wildcardEmails].map(normalizeEmail).filter(Boolean))];
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
