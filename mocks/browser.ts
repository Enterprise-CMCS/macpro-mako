import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import handlers from "./handlers";

export const mockedWorker = setupWorker(...handlers);

// Make the `worker` and `http` references available globally,
// so they can be accessed in both runtime and test suites.
export { http, HttpResponse };
