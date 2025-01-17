import { http, HttpResponse } from "msw";
import { cpocsList } from "../../data/cpocs";

const defaultCpocHandler = http.post(/\/getCpocs$/, async () =>
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

export const errorCpocHandler = http.post(
  /\/getCpocs/,
  () => new HttpResponse(null, { status: 500 }),
);

export const cpocHandlers = [defaultCpocHandler];
