import { test as base } from "@playwright/test";
import {
  FlagToggles,
  launchDarklyHandlers,
  toggleGetLDEvalStreamHandler,
  toggleGetLDEvalxHandler,
} from "mocks";
import { http, RequestHandler } from "msw";
import type { MockServiceWorker } from "playwright-msw";
import { createWorkerFixture } from "playwright-msw";

/**
 * Override the default LaunchDarkly flag values.
 *
 * @param toggleFlags {FlagToggles} The object of flags to update
 * @returns {RequestHandler[]} Returns an array of overridden LaunchDarkly handlers
 * @example
 * test("a test that is dependant on a flag value", async ({
 *    page,
 *    worker // must import worker to use the override
 * }) => {
 *    worker.use(...overrideFlags({ "flag-name": "VALUE" })); // Important: must use the spread operator here because `worker.use` takes multiple handlers, not an array of handlers
 *    // test code
 * });
 */
export const overrideFlags = (toggleFlags?: FlagToggles): RequestHandler[] => [
  toggleGetLDEvalStreamHandler(toggleFlags),
  toggleGetLDEvalxHandler(toggleFlags),
];

export const test = base.extend<{
  worker: MockServiceWorker;
  http: typeof http;
}>({
  worker: createWorkerFixture(launchDarklyHandlers),
  http,
});

export { expect } from "@playwright/test";
