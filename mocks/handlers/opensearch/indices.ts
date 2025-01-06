import { http, HttpResponse } from "msw";

const defaultCreateIndexHandler = http.head(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/:index",
  async () => {
    return new HttpResponse(null, { status: 200 });
  },
);

export const errorCreateIndexHandler = http.head(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/:index",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

// updateFieldMapping
const defaultUpdateFieldMappingHandler = http.put(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/:index/_mapping",
  async () => {
    return new HttpResponse(null, { status: 200 });
  },
);

export const errorUpdateFieldMappingHandler = http.put(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/:index/_mapping",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

const defaultBulkUpdateDataHandler = http.post(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/_bulk",
  () => new HttpResponse(null, { status: 200 }),
);

export const errorBulkUpdateDataHandler = http.post(
  "https://vpc-opensearchdomain-mock-domain.us-east-1.es.amazonaws.com/_bulk",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

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

export const indexHandlers = [
  defaultCreateIndexHandler,
  defaultUpdateFieldMappingHandler,
  defaultBulkUpdateDataHandler,
  defaultDeleteIndexHandler,
];
