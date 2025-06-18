import { setupWorker } from "msw/browser";

import { defaultApiHandlers, launchDarklyHandlers } from "./handlers";
import { cognitoHandlers } from "./handlers/aws/cognito";

export const mockedWorker = setupWorker(
  ...defaultApiHandlers,
  ...launchDarklyHandlers,
  ...cognitoHandlers,
);
