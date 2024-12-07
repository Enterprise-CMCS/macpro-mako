import { Amplify } from "aws-amplify";
import { API_CONFIG, AUTH_CONFIG, useDefaultStateSubmitter } from "mocks";
import { mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

Amplify.configure({
  API: API_CONFIG,
  Auth: AUTH_CONFIG,
});

beforeAll(() => {
  useDefaultStateSubmitter();

  vi.spyOn(console, "error").mockImplementation(() => {});

  console.log("starting MSW listener");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  useDefaultStateSubmitter();
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();
});

afterAll(() => {
  vi.clearAllMocks();

  // Clean up after the tests are finished.
  mockedServer.close();
});
