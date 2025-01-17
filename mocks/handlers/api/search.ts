import { http, HttpResponse } from "msw";
import { itemList } from "../../data/items";

const defaultApiSearchHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/search/:index",
  ({ params }) => {
    const { index } = params;

    if (index === "main") {
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
            value: 654,
            relation: "eq",
          },
          max_score: 1,
          hits: itemList,
        },
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
