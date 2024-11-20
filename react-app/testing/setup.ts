import "@/api/amplifyConfig";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { mockedServer } from "mocks/server";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

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

// Add this to remove all the expected errors in console when running unit tests.
beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  console.log("starting MSW listener");
  mockedServer.listen();

  if (process.env.MOCK_API_REFINES) {
    vi.mock("@/components/Inputs/upload.utilities", () => ({
      getPresignedUrl: vi.fn(async () => "hello world"),
      uploadToS3: vi.fn(async () => {}),
      extractBucketAndKeyFromUrl: vi.fn(() => ({
        bucket: "hello",
        key: "world",
      })),
    }));
    vi.mock("@/api", async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...(actual as object),
        useGetUser: () => ({
          data: {
            user: {
              "custom:cms-roles": "onemac-micro-statesubmitter,onemac-micro-super",
            },
          },
        }),
      };
    });
    vi.mock("@/utils/user", () => ({
      isAuthorizedState: vi.fn(async (id: string) => {
        const validStates = ["MD"];

        return validStates.includes(id.substring(0, 2));
      }),
    }));
  }
});

afterEach(() => {
  if (process.env.SKIP_CLEANUP) return;
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  mockedServer.resetHandlers();
  cleanup();
});

afterAll(() => {
  delete process.env.SKIP_CLEANUP;
  // Clean up after the tests are finished.
  mockedServer.close();
  vi.restoreAllMocks();
});
