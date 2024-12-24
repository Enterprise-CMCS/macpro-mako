import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

beforeAll(() => {});

beforeEach(() => {
  process.env.isDev = "true";
  vi.useFakeTimers();
  const now = new Date(1672531200000);
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => {
  vi.clearAllMocks();
});
