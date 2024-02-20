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
import { getItem, idIsUnique } from "./useGetItem";
import { API } from "aws-amplify";

describe("getItem", () => {
  it("makes an AWS Amplify post request", async () => {
    API.post = vi.fn();
    const itemId = "test-id";
    await getItem(itemId);
    expect(API.post).toHaveBeenCalledWith("os", "/item", {
      body: { id: itemId },
    });
  });
});

// describe("item helpers", () => {
//   beforeAll(() => mockItem.server.listen());
//   afterEach(() => mockItem.server.resetHandlers());
//   afterAll(() => mockItem.server.close());
//   describe("idIsUnique", () => {
//     it("confirms no matching record is returned", async () => {
//       API.post = vi.fn((apiName, path, init) =>
//         fetch("/item-mock-server", { ...init, method: "post" })
//       );
//       expect(await idIsUnique("existing-id")).toBe(false);
//     });
//   });
//   describe("idIsApproved", () => {
//     it("", () => {});
//   });
// });
