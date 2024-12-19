import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {});

beforeEach(() => {
  process.env.isDev = "true";
  vi.useFakeTimers();
  const now = new Date(2023, 0, 1);
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.clearAllMocks();
});
