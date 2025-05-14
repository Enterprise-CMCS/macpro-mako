import { http, HttpResponse, PathParams } from "msw";

import {
  getApprovedRoleByEmailAndState,
  getFilteredRolesByEmail,
  getFilteredRolesByState,
  getLatestRoleByEmail,
  roleResults,
} from "../../data/roles";
import { SearchQueryBody, TestRoleResult } from "../../index.d";
import { getFilterValueAsString } from "../search.utils";

const defaultRoleSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-roles/_search",
  async ({ request }) => {
    const { query, size, _source } = await request.json();
    let hits: TestRoleResult[];

    if (query?.term?.["email.keyword"]) {
      const email = getFilterValueAsString(query, "term", "email.keyword") || "";
      hits = getFilteredRolesByEmail(email);
    } else if (query?.term?.["territory.keyword"]) {
      const state = getFilterValueAsString(query, "term", "territory.keyword") || "";
      hits = getFilteredRolesByState(state);
    } else if (query?.bool?.must && query?.bool?.must_not && _source) {
      const email = getFilterValueAsString(query.bool.must, "term", "email.keyword") || "";
      hits = getFilteredRolesByEmail(email).filter(
        (roleObj) => roleObj._source.status === "active",
      );
    } else if (query?.bool?.must && size === 1) {
      const email = getFilterValueAsString(query.bool.must, "term", "email.keyword") || "";
      hits = getLatestRoleByEmail(email);
    } else if (query?.bool?.must) {
      const email = getFilterValueAsString(query.bool.must, "term", "email.keyword") || "";
      const role = getFilterValueAsString(query.bool.must, "term", "role") || "";
      const state = getFilterValueAsString(query.bool.must, "term", "territory.keyword") || "";
      const approvedRole = getApprovedRoleByEmailAndState(email, state, role);
      hits = approvedRole ? [approvedRole] : [];
    } else if (query?.match_all) {
      hits = roleResults;
    } else {
      hits = [];
    }

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

export const errorRoleSearchHandler = http.post<PathParams, SearchQueryBody>(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-roles/_search",
  async () => new HttpResponse("Internal server error", { status: 500 }),
);

export const roleHandlers = [defaultRoleSearchHandler];
