import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { Amplify, Auth } from "aws-amplify";
import {
  API_CONFIG,
  AUTH_CONFIG,
  mockCurrentAuthenticatedUser,
  mockUserAttributes,
  resetApiItemsState,
  setDefaultStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import * as React from "react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";

import { Storage as MockStorage } from "./src/utils/test-helpers/mockStorage";

// TODO to mock
// [MSW] Warning: intercepted a request without a matching request handler:
//   • GET http://example.com/file1.md

Amplify.configure({
  API: API_CONFIG,
  Auth: AUTH_CONFIG,
});

// Some dependencies expect React to be available as a global in test environments.
(globalThis as { React?: typeof React }).React = React;

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

const installStorageMocks = () => {
  const localStorage = new MockStorage();
  const sessionStorage = new MockStorage();

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    writable: true,
    value: localStorage,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: localStorage,
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    writable: true,
    value: sessionStorage,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    writable: true,
    value: sessionStorage,
  });
};

const syncWebApiConstructors = () => {
  if (typeof window === "undefined") {
    return;
  }

  const NativeAbortController = globalThis.AbortController;
  const NativeAbortSignal = globalThis.AbortSignal;
  const NativeRequest = globalThis.Request;
  const NativeHeaders = globalThis.Headers;
  const NativeResponse = globalThis.Response;
  const NativeFormData = globalThis.FormData;
  const nativeFetch = globalThis.fetch;

  class SafeRequest extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      const safeInit = init ? { ...init } : undefined;
      const inputRequest = input instanceof NativeRequest ? input : null;

      if (safeInit?.signal) {
        delete safeInit.signal;
      }

      if (inputRequest) {
        const method = safeInit?.method ?? inputRequest.method;
        const normalizedInit: RequestInit & { duplex?: "half" } = {
          ...safeInit,
          method,
          headers: safeInit?.headers ?? inputRequest.headers,
          cache: safeInit?.cache ?? inputRequest.cache,
          credentials: safeInit?.credentials ?? inputRequest.credentials,
          integrity: safeInit?.integrity ?? inputRequest.integrity,
          keepalive: safeInit?.keepalive ?? inputRequest.keepalive,
          mode: safeInit?.mode ?? inputRequest.mode,
          redirect: safeInit?.redirect ?? inputRequest.redirect,
          referrer: safeInit?.referrer ?? inputRequest.referrer,
          referrerPolicy: safeInit?.referrerPolicy ?? inputRequest.referrerPolicy,
        };
        const inputWithDuplex = inputRequest as Request & { duplex?: "half" };

        if (!safeInit?.body && !["GET", "HEAD"].includes(method)) {
          normalizedInit.body = inputRequest.clone().body;
          normalizedInit.duplex = safeInit?.duplex ?? inputWithDuplex.duplex;
        }

        super(inputRequest.url, normalizedInit);
        return;
      }

      super(input, safeInit);
    }
  }

  Object.defineProperty(window, "AbortController", {
    configurable: true,
    value: NativeAbortController,
  });
  Object.defineProperty(globalThis, "AbortController", {
    configurable: true,
    value: NativeAbortController,
  });
  Object.defineProperty(window, "AbortSignal", {
    configurable: true,
    value: NativeAbortSignal,
  });
  Object.defineProperty(globalThis, "AbortSignal", {
    configurable: true,
    value: NativeAbortSignal,
  });
  Object.defineProperty(window, "Request", {
    configurable: true,
    value: SafeRequest,
  });
  Object.defineProperty(globalThis, "Request", {
    configurable: true,
    value: SafeRequest,
  });
  Object.defineProperty(window, "Headers", {
    configurable: true,
    value: NativeHeaders,
  });
  Object.defineProperty(globalThis, "Headers", {
    configurable: true,
    value: NativeHeaders,
  });
  Object.defineProperty(window, "Response", {
    configurable: true,
    value: NativeResponse,
  });
  Object.defineProperty(globalThis, "Response", {
    configurable: true,
    value: NativeResponse,
  });
  Object.defineProperty(window, "FormData", {
    configurable: true,
    value: NativeFormData,
  });
  Object.defineProperty(globalThis, "FormData", {
    configurable: true,
    value: NativeFormData,
  });
  Object.defineProperty(window, "fetch", {
    configurable: true,
    value: nativeFetch,
  });
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: nativeFetch,
  });
};

process.env.TZ = "UTC";

// Add this to remove all the expected errors in console when running unit tests.
vi.spyOn(console, "error").mockImplementation(() => {});

vi.spyOn(Auth, "userAttributes").mockImplementation(mockUserAttributes);
vi.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(mockCurrentAuthenticatedUser);
vi.spyOn(Auth, "signOut").mockImplementation(async () => {
  setMockUsername(null);
});

global.ResizeObserver = vi.fn(function MockResizeObserver() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
}) as unknown as typeof ResizeObserver;
global.scrollTo = vi.fn();
window.scrollTo = global.scrollTo;

beforeAll(() => {
  installStorageMocks();
  syncWebApiConstructors();
  setDefaultStateSubmitter();

  console.log("starting MSW listener for react-app");
  mockedServer.listen({
    onUnhandledRequest: "warn",
  });
  vi.mock("uuid", () => ({
    v4: vi.fn(() => "mocked-uuid-1234"),
  }));
  if (process.env.MOCK_API_REFINES) {
    vi.mock("@/components/Inputs/uploadUtilities", () => ({
      getPresignedUrl: vi.fn(async () => "hello world"),
      uploadToS3: vi.fn(async () => {}),
      extractBucketAndKeyFromUrl: vi.fn(() => ({
        bucket: "hello",
        key: "world",
      })),
    }));
  }
});

beforeEach(() => {
  installStorageMocks();
  syncWebApiConstructors();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();

  setDefaultStateSubmitter();
  resetApiItemsState();
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();

  if (process.env.SKIP_CLEANUP) return;
  cleanup();
});

afterAll(() => {
  // Clean up after the tests are finished.
  mockedServer.close();

  delete process.env.SKIP_CLEANUP;

  vi.clearAllMocks();
});
