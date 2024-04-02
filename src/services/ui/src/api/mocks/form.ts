import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

type GetFormBody = { formId: string; formVersion: string };

const handlers = [
  http.post<GetFormBody, GetFormBody>("/forms", async ({ request }) => {
    return new HttpResponse(null, { status: 404 });
  }),
];

export const server = setupServer(...handlers);
