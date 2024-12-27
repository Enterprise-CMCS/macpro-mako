import { setupWorker } from "msw/browser";
import { defaultApiHandlers } from "./handlers";

export const mockedWorker = setupWorker(...defaultApiHandlers);
