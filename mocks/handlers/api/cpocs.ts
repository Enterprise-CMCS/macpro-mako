import { http, HttpResponse } from "msw";
import { cpocsList } from "../../data/cpocs";

const defaultApiCpocHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getCpocs",
  async () =>
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

export const errorApiCpocHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getCpocs",
  () => new HttpResponse(null, { status: 500 }),
);

export const cpocHandlers = [defaultApiCpocHandler];
