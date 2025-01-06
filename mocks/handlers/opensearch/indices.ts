import { http, HttpResponse } from "msw";

const defaultDeleteIndexHandler = http.delete(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/:index",
  async () => {
    return new HttpResponse(null, { status: 200 });
  },
);

export const errorDeleteIndexHandler = http.delete(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/:index",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const indexHandlers = [defaultDeleteIndexHandler];
