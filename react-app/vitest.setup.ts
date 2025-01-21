import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { Amplify, Auth } from "aws-amplify";
import {
  API_CONFIG,
  AUTH_CONFIG,
  mockCurrentAuthenticatedUser,
  mockUserAttributes,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

// TODO to mock
// [MSW] Warning: intercepted a request without a matching request handler:
//   • GET http://example.com/file1.md

Amplify.configure({
  API: API_CONFIG,
  Auth: AUTH_CONFIG,
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || "mouse";
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

vi.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(mockCurrentAuthenticatedUser);
vi.spyOn(Auth, "userAttributes").mockImplementation(mockUserAttributes);
vi.spyOn(Auth, "signOut").mockImplementation(async () => {
  setMockUsername(null);
});

// Add this to remove all the expected errors in console when running unit tests.
beforeAll(() => {
  setDefaultStateSubmitter();

  vi.spyOn(console, "error").mockImplementation(() => {});

  console.log("starting MSW listener for react-app");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
  vi.mock("uuid", () => ({
    v4: vi.fn(() => "mocked-uuid-1234"),
  }));
  if (process.env.MOCK_API_REFINES) {
    vi.mock("@/components/Inputs/upload.utilities", () => ({
      getPresignedUrl: vi.fn(async () => "hello world"),
      uploadToS3: vi.fn(async () => {}),
      extractBucketAndKeyFromUrl: vi.fn(() => ({
        bucket: "hello",
        key: "world",
      })),
    }));
  }
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  setDefaultStateSubmitter();
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();

  if (process.env.SKIP_CLEANUP) return;
  cleanup();
});

afterAll(() => {
  vi.clearAllMocks();

  // Clean up after the tests are finished.
  mockedServer.close();

  delete process.env.SKIP_CLEANUP;
});
