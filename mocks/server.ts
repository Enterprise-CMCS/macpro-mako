import { setupServer } from "msw/node";
import handlers, { defaultApiHandlers, defaultServiceHandlers } from "./handlers";

export const mockedServer = setupServer(...handlers);

export const mockedApiServer = setupServer(...defaultApiHandlers);

export const mockedServiceServer = setupServer(...defaultServiceHandlers);
