import { http, HttpResponse } from "msw";
import { defaultHandlers as itemHandlers } from "./items.js";
import { defaultHandlers as submissionHandlers } from "./submissions.js";
import { defaultHandlers as typeHandlers } from "./types.js";

export type Body =
  | Blob
  | ArrayBuffer
  | FormData
  | ReadableStream
  | URLSearchParams
  | string
  | null
  | undefined;

export const putOnceHandler = (endpoint: string, status: number = 200, body?: Body) =>
  http.post(
    endpoint,
    async () => {
      return new HttpResponse(body, { status });
    },
    { once: true },
  );

export default [...itemHandlers, ...typeHandlers, ...submissionHandlers];

export {
  mockCurrentAuthenticatedUser,
  mockUseGetUser,
  mockUserAttributes,
  setMockUsername,
  useDefaultReviewer,
  useDefaultStateSubmitter,
} from "./auth.js";
export type { GetItemBody } from "./items.js";
