import { setupServer } from "msw/node";

import handlers, { cognitoHandlers, defaultApiHandlers, defaultServiceHandlers } from "./handlers";

export const mockedServer = setupServer(...handlers);

export const mockedApiServer = setupServer(...defaultApiHandlers, ...cognitoHandlers);

export const mockedServiceServer = setupServer(...defaultServiceHandlers);
