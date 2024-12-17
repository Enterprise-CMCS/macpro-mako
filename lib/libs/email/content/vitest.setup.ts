import { mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";


beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  console.log("starting MSW listener for email tests");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();
});

afterAll(() => {
  vi.clearAllMocks();

  // Clean up after the tests are finished.
  mockedServer.close();
});
