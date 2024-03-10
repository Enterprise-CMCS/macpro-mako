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
import { mockSubTypes } from "./mocks";
import * as unit from "./useGetSubTypes";

const mockFetchTypes = vi.fn(async (apiName, path, init) => {
  const res = await fetch("/os/getSubTypes", {
    body: JSON.stringify(init.body),
    method: "POST",
  });
  if (res.status !== 200)
    throw Error("useGetSubTypes > mockFetch: Expected error thrown by test.");
  return await res.json();
});

describe("fetchTypes", () => {
  beforeAll(() => {
    mockSubTypes.server.listen();
    API.post = vi.fn(mockFetchTypes);
  });
  afterEach(() => mockSubTypes.server.resetHandlers());
  afterAll(() => mockSubTypes.server.close());

  it("makes an AWS Amplify post request", async () => {
    const types = await unit.fetchSubTypes(1, [1, 2]);
    expect(types).toEqual([
      { id: 101, authorityId: 1, name: "subtypeOne", typeId: 1 },
      { id: 102, authorityId: 1, name: "subtypetwo", typeId: 2 },
    ]);
    expect(API.post).toHaveBeenCalledWith("os", "/getSubTypes", {
      body: { authorityId: 1, typeIds: [1, 2] },
    });
  });

  it("successfully fetches types for a given authorityId", async () => {
    const types = await unit.fetchSubTypes(2, [4]);
    expect(types).toEqual([
      { id: 104, authorityId: 2, name: "subtypethree", typeId: 4 },
    ]);
    expect(API.post).toHaveBeenCalledWith("os", "/getSubTypes", {
      body: { authorityId: 2, typeIds: [4] },
    });
  });

  it("returns an empty array when there are no types", async () => {
    const types = await unit.fetchSubTypes(3, [4, 5]);
    expect(types).toEqual([]);
  });

  it("throws an error when fetch fails", async () => {
    await expect(unit.fetchSubTypes(-1, [])).rejects.toThrow(
      "Failed to fetch types",
    );
  });
});
