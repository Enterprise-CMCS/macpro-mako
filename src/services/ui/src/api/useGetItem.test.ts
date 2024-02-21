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
    throw Error(
      `useGetItem > mockFetch: item query for ${init.body.id} returned status code ${res.status}`
    );
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
  beforeAll(() => mockItem.server.listen());
  afterEach(() => mockItem.server.resetHandlers());
  afterAll(() => mockItem.server.close());

  describe("idIsUnique", () => {
    it("confirms no matching record is returned", async () => {
      API.post = vi.fn(mockFetch);
      const result = await unit.idIsUnique("existing");
      expect(API.post).toHaveBeenCalledWith("os", "/item", {
        body: { id: "existing" },
      });
      expect(result).toBe(false);
    });
  });

  describe("idIsApproved", () => {
    it("returns false if no getItem fails", async () => {
      API.post = vi.fn(mockFetch);
      const result = await unit.idIsApproved("not-found");
      expect(API.post).toHaveBeenCalledWith("os", "/item", {
        body: { id: "not-found" },
      });
      expect(result).toBe(false);
    });

    it("returns false if status is not approved", async () => {
      API.post = vi.fn(mockFetch);
      const result = await unit.idIsApproved("existing-pending");
      expect(API.post).toHaveBeenCalledWith("os", "/item", {
        body: { id: "existing-pending" },
      });
      expect(result).toBe(false);
    });

    it("returns true if status is approved", async () => {
      API.post = vi.fn(mockFetch);
      const result = await unit.idIsApproved("existing-approved");
      expect(API.post).toHaveBeenCalledWith("os", "/item", {
        body: { id: "existing-approved" },
      });
      expect(result).toBe(true);
    });
  });
});
