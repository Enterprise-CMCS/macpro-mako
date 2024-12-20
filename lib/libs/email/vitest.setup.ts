import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {});

beforeEach(() => {
  process.env.isDev = "true";
  vi.useFakeTimers();
  // Set to January 1, 2023 at 9:30am EST
  const now = new Date('2023-01-01T14:30:00.000Z'); // 9:30am EST = 14:30 UTC
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.clearAllMocks();
});
