import * as node from "node:util";

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
// import { Amplify, Auth } from "aws-amplify";
import { Amplify } from "aws-amplify";
import {
  API_CONFIG,
  AUTH_CONFIG,
  // mockCurrentAuthenticatedUser,
  // mockUserAttributes,
  setDefaultStateSubmitter,
  // setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

// // JSDom + Vitest don't play well with each other. Long story short - default
// // TextEncoder produces Uint8Array objects that are _different_ from the global
// // Uint8Array objects, so some functions that compare their types explode.
// // https://github.com/vitest-dev/vitest/issues/4043#issuecomment-1905172846
// class ESBuildAndJSDOMCompatibleTextEncoder extends TextEncoder {
//   constructor() {
//     super();
//   }

//   encode(input: string) {
//     if (typeof input !== "string") {
//       throw new TypeError("`input` must be a string");
//     }

//     const decodedURI = decodeURIComponent(encodeURIComponent(input));
//     const arr = new Uint8Array(decodedURI.length);
//     const chars = decodedURI.split("");
//     for (let i = 0; i < chars.length; i++) {
//       arr[i] = decodedURI[i].charCodeAt(0);
//     }
//     return arr;
//   }
// }

global.TextEncoder = node.TextEncoder as any;
window.TextEncoder = node.TextEncoder as any;

// class ESBuildAndJSDOMCompatibleTextDecoder extends TextDecoder {
//   constructor() {
//     super();
//   }

//   encode(input: Uint8Array<ArrayBuffer>) {
//     if (typeof input !== "object") {
//       throw new TypeError("`input` must be an object");
//     }

//     const encodedURI = encodeURIComponent(decodeURIComponent(input));
//     const arr = new Uint8Array(encodedURI.length);
//     const chars = encodedURI.split("");
//     for (let i = 0; i < chars.length; i++) {
//       arr[i] = encodedURI[i].charCodeAt(0);
//     }
//     return arr;
//   }
// }

global.TextDecoder = node.TextDecoder as any;
window.TextDecoder = node.TextDecoder as any;

// TODO to mock
// [MSW] Warning: intercepted a request without a matching request handler:
//   • GET http://example.com/file1.md

Amplify.configure({
  API: API_CONFIG,
  Auth: AUTH_CONFIG,
});

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

process.env.TZ = "UTC";

// Add this to remove all the expected errors in console when running unit tests.
vi.spyOn(console, "error").mockImplementation(() => {});

// vi.spyOn(Auth, "userAttributes").mockImplementation(mockUserAttributes);
// vi.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(mockCurrentAuthenticatedUser);
// vi.spyOn(Auth, "signOut").mockImplementation(async () => {
//   setMockUsername(null);
// });

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

beforeAll(() => {
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
  // Clean up after the tests are finished.
  mockedServer.close();

  delete process.env.SKIP_CLEANUP;

  vi.clearAllMocks();
});
