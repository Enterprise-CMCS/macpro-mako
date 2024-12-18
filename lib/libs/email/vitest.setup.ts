import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {});

beforeEach(() => {
  process.env.isDev = "true";
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.clearAllMocks();
});
