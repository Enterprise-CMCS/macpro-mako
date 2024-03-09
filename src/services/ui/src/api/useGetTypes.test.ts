import {
  beforeAll,
  afterEach,
  afterAll,
  it,
  expect,
  vi,
  describe,
} from "vitest";
import { API } from "aws-amplify";
import { mockTypes } from "./mocks";
import * as unit from "./useGetTypes"; // Update the import path according to your file structure

// Mock the fetch function for testing purposes

const mockFetchTypes = vi.fn(async (apiName, path, init) => {
  const res = await fetch("/os/getTypes", {
    body: JSON.stringify(init.body),
    method: "POST",
  });
  if (res.status !== 200)
    throw Error("useGetTypes > mockFetch: Expected error thrown by test.");
  return await res.json();
});

describe("fetchTypes", () => {
  beforeAll(() => {
    mockTypes.server.listen();
    API.post = vi.fn(mockFetchTypes);
  });
  afterEach(() => mockTypes.server.resetHandlers());
  afterAll(() => mockTypes.server.close());

  it("makes an AWS Amplify post request", async () => {
    const types = await unit.fetchTypes(1);
    expect(types).toEqual([
      { id: 101, authorityId: 1, name: "typeOne" },
      { id: 102, authorityId: 1, name: "typetwo" },
    ]);
    expect(API.post).toHaveBeenCalledWith("os", "/getTypes", {
      body: { authorityId: 1 },
    });
  });

  it("successfully fetches types for a given authorityId", async () => {
    const types = await unit.fetchTypes(2);
    expect(types).toEqual([{ id: 103, authorityId: 2, name: "typethree" }]);
    expect(API.post).toHaveBeenCalledWith("os", "/getTypes", {
      body: { authorityId: 2 },
    });
  });

  it("returns an empty array when there are no types", async () => {
    const types = await unit.fetchTypes(3);
    expect(types).toEqual([]);
  });

  it("throws an error when fetch fails", async () => {
    await expect(unit.fetchTypes(-1)).rejects.toThrow("Failed to fetch types");
  });
});
