import { test as base } from "@playwright/test";
import { http } from "msw";
import type { MockServiceWorker } from "playwright-msw";
import { createWorkerFixture } from "playwright-msw";

import { launchDarklyHandlers } from "./launchDarklyHandler";

export const test = base.extend<{
  worker: MockServiceWorker;
  http: typeof http;
}>({
  worker: createWorkerFixture(launchDarklyHandlers),
  http,
});

export { expect } from "@playwright/test";
