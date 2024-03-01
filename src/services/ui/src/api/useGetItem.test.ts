import {
  beforeAll,
  afterEach,
  afterAll,
  it,
  expect,
  vi,
  describe,
} from "vitest";
import { mockItem } from "./mocks";
import * as unit from "./useGetItem";
import { API } from "aws-amplify";

/* When mocking the getItem and helper functions:
 * 1. Assign API.post to use mockFetch
 * 2. Use ID keywords to change behavior:
 *   - including "existing" will return an item
 *   - including "approved" will return 'seatoolStatus: "approved"'*/

const mockFetch = vi.fn(async (apiName, path, init) => {
  const res = await fetch("/item-mock-server", {
    body: JSON.stringify(init.body),
    method: "POST",
  });
  if (res.status !== 200)
    throw Error("useGetItem > mockFetch: Expected error thrown by test.");
  return await res.json();
});

describe("getItem", () => {
  it("makes an AWS Amplify post request", async () => {
    API.post = vi.fn();
    await unit.getItem("test-id");
    expect(API.post).toHaveBeenCalledWith("os", "/item", {
      body: { id: "test-id" },
    });
  });
});

describe("zod schema helpers", () => {
  beforeAll(() => {
    mockItem.server.listen();
    API.post = vi.fn(mockFetch);
  });
  afterEach(() => mockItem.server.resetHandlers());
  afterAll(() => mockItem.server.close());

  describe("idIsApproved", () => {
    it("returns false if no getItem fails", async () => {
      expect(await unit.idIsApproved("not-found")).toBe(false);
    });

    it("returns false if status is not approved", async () => {
      expect(await unit.idIsApproved("existing-pending")).toBe(false);
    });

    it("returns true if status is approved", async () => {
      expect(await unit.idIsApproved("existing-approved")).toBe(true);
    });
  });
});
