import { http, HttpResponse } from "msw";
import { setupServer } from "msw/lib/node";

type GetFormBody = { formId: string; formVersion?: string };

const handlers = [];

export const server = setupServer(...handlers);
