import { http, HttpResponse } from "msw";
import { apiHandlers } from "./api";
import { awsHandlers } from "./aws";
import { opensearchHandlers } from "./opensearch";
import { countiesHandlers } from "./counties";

export type Body =
  | Blob
  | ArrayBuffer
  | FormData
  | ReadableStream
  | URLSearchParams
  | string
  | null
  | undefined;

export const postOnceHandler = (endpoint: string, status: number = 200, body?: Body) =>
  http.post(
    endpoint,
    async () => {
      return new HttpResponse(body, { status });
    },
    { once: true },
  );

// Handlers that mock calls to the API
export const defaultApiHandlers = [
  ...apiHandlers,
  ...countiesHandlers
]

// Handlers that mock calls to 3rd party services from the API
export const defaultServiceHandlers = [
  ...awsHandlers,
  ...opensearchHandlers,
  ...countiesHandlers
]

export default [
  ...apiHandlers,
  ...awsHandlers,
  ...opensearchHandlers,
  ...countiesHandlers,
];

export {
  convertUserAttributes,
  setDefaultReviewer,
  setDefaultStateSubmitter,
  setMockUsername,
} from "./authUtils.js";

export * from "./api";
export * from "./aws";
export * from "./opensearch";
