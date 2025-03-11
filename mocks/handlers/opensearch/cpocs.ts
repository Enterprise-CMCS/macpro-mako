import { http, HttpResponse } from "msw";

import { cpocsList } from "../../data/cpocs";

const defaultOSCpocSearchHandler = http.post(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-cpocs/_search",
  () =>
    HttpResponse.json({
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
          value: 654,
          relation: "eq",
        },
        max_score: 1,
        hits: cpocsList,
      },
    }),
);

export const emptyOSCpocSearchHandler = http.post(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-cpocs/_search",
  () => new HttpResponse(),
);

export const errorOSCpocSearchHandler = http.post(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/test-namespace-cpocs/_search",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const cpocSearchHandlers = [defaultOSCpocSearchHandler];
