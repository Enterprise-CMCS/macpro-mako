import { setupWorker } from "msw/browser";

import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "./handlers";

export const mockedWorker = setupWorker(
  ...cognitoHandlers,
  ...defaultApiHandlers,
  ...launchDarklyHandlers,
);
