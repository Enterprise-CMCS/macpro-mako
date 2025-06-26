import { setupWorker } from "msw/browser";

import { cognitoHandlers, defaultApiHandlers } from "./handlers";

export const mockedWorker = setupWorker(...defaultApiHandlers, ...cognitoHandlers);
