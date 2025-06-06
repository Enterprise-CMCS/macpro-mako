import { test as base } from "@playwright/test";
import { launchDarklyHandlers } from "mocks";
import { http } from "msw";
import type { MockServiceWorker } from "playwright-msw";
import { createWorkerFixture } from "playwright-msw";

export const test = base.extend<{
  worker: MockServiceWorker;
  http: typeof http;
}>({
  worker: createWorkerFixture(launchDarklyHandlers),
  http,
});

export { expect } from "@playwright/test";
