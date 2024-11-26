import { Amplify, Auth } from "aws-amplify";
import {
  MOCK_API_URL,
  mockCurrentAuthenticatedUser,
  mockUserAttributes,
  useDefaultStateSubmitter,
} from "mocks";
import { mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

process.env.osDomain = MOCK_API_URL;

Amplify.configure({
  API: {
    endpoints: [
      {
        name: "os",
        endpoint: MOCK_API_URL,
        region: "us-east-1",
      },
    ],
  },
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(mockCurrentAuthenticatedUser);
vi.spyOn(Auth, "userAttributes").mockImplementation(mockUserAttributes);

// Add this to remove all the expected errors in console when running unit tests.
beforeAll(async () => {
  useDefaultStateSubmitter();

  vi.spyOn(console, "error").mockImplementation(() => {});

  console.log("starting MSW listener");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
});

afterEach(() => {
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();
});

afterAll(() => {
  // Clean up after the tests are finished.
  mockedServer.close();
  vi.restoreAllMocks();
});
