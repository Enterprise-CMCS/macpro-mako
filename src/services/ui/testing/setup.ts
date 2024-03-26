import { expect, afterEach, beforeAll, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)

// Add this to remove all the expected errors in console when running unit tests.
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.restoreAllMocks();
});
