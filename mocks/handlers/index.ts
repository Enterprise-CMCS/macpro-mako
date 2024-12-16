import { http, HttpResponse } from "msw";
import { defaultHandlers as apiTokenHandlers } from "./api-security";
import { defaultHandlers as authHandlers } from "./auth";
import { defaultHandlers as cloudFormationHandlers } from "./cloudformation";
import { defaultHandlers as countiesHandler } from "./counties";
import { defaultHandlers as itemHandlers } from "./items";
import { defaultHandlers as opensearchHandlers } from "./opensearch/index";
import { defaultHandlers as secretsManagerHandlers } from "./secretsmanager";
import { defaultHandlers as submissionHandlers } from "./submissions";
import { defaultHandlers as typeHandlers } from "./types";

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

export default [
  ...itemHandlers,
  ...typeHandlers,
  ...submissionHandlers,
  ...countiesHandler,
  ...authHandlers,
  ...opensearchHandlers,
  ...secretsManagerHandlers,
  ...cloudFormationHandlers,
  ...apiTokenHandlers,
];

export {
  convertUserAttributes,
  getRequestContext,
  mockCurrentAuthenticatedUser,
  mockUseGetUser,
  mockUserAttributes,
  setDefaultReviewer,
  setDefaultStateSubmitter,
  setMockUsername,
} from "./auth.js";

export { errorCloudFormation } from "./cloudformation.js";
