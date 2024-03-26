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
import { fetchData } from "./useGetTypes";

const mockFetchData = vi.fn(async (apiName, path, init) => {
  const endpoint = init.body.typeIds ? "/getSubTypes" : "/getTypes";
  const res = await fetch(`/os${endpoint}`, {
    body: JSON.stringify(init.body),
    method: "POST",
  });
  if (res.status !== 200)
    throw Error("useGetData > mockFetch: Expected error thrown by test.");
  return await res.json();
});

describe("fetchData", () => {
  beforeAll(() => {
    mockTypes.server.listen();
    API.post = vi.fn(mockFetchData);
  });
  afterEach(() => {
    mockTypes.server.resetHandlers();
  });
  afterAll(() => {
    mockTypes.server.close();
  });

  describe("fetchTypes", () => {
    it("makes an AWS Amplify post request for types", async () => {
      const types = await fetchData({ authorityId: 1 });
      expect(types).toEqual([
        { id: 101, authorityId: 1, name: "typeOne" },
        { id: 102, authorityId: 1, name: "typetwo" },
      ]);
      expect(API.post).toHaveBeenCalledWith("os", "/getTypes", {
        body: { authorityId: 1 },
      });
    });

    it("successfully fetches types for a given authorityId", async () => {
      const types = await fetchData({ authorityId: 2 });
      expect(types).toEqual([{ id: 103, authorityId: 2, name: "typethree" }]);
      expect(API.post).toHaveBeenCalledWith("os", "/getTypes", {
        body: { authorityId: 2 },
      });
    });

    it("returns an empty array when there are no types", async () => {
      const types = await fetchData({ authorityId: 3 });
      expect(types).toEqual([]);
    });

    it("throws an error when fetch fails", async () => {
      await expect(fetchData({ authorityId: -1 })).rejects.toThrow(
        "Failed to fetch types",
      );
    });
  });

  describe("fetchSubTypes", () => {
    it("makes an AWS Amplify post request for subtypes", async () => {
      const subtypes = await fetchData({ authorityId: 1, typeIds: [1, 2] });
      expect(subtypes).toEqual([
        { id: 101, authorityId: 1, name: "subtypeOne", typeId: 1 },
        { id: 102, authorityId: 1, name: "subtypetwo", typeId: 2 },
      ]);
      expect(API.post).toHaveBeenCalledWith("os", "/getSubTypes", {
        body: { authorityId: 1, typeIds: [1, 2] },
      });
    });

    it("successfully fetches subtypes for a given authorityId and typeIds", async () => {
      const subtypes = await fetchData({ authorityId: 2, typeIds: [4] });
      expect(subtypes).toEqual([
        { id: 104, authorityId: 2, name: "subtypethree", typeId: 4 },
      ]);
      expect(API.post).toHaveBeenCalledWith("os", "/getSubTypes", {
        body: { authorityId: 2, typeIds: [4] },
      });
    });

    it("returns an empty array when there are no subtypes", async () => {
      const subtypes = await fetchData({ authorityId: 3, typeIds: [4, 5] });
      expect(subtypes).toEqual([]);
    });

    it("throws an error when fetch fails", async () => {
      await expect(fetchData({ authorityId: -1, typeIds: [] })).rejects.toThrow(
        "Failed to fetch subtypes",
      );
    });
  });
});
