// getPackage.test.ts
import { INITIAL_RELEASE_APPK_ITEM_ID, TEST_ITEM_ID } from "mocks";
import items from "mocks/data/items";
import { describe, expect, it } from "vitest";
import { getPackage } from "./getPackage";

describe("getPackage", () => {
  it("should throw an error if osDomain is not defined", async () => {
    delete process.env.osDomain;
    await expect(getPackage(TEST_ITEM_ID)).rejects.toThrow("process.env.osDomain must be defined");
  });

  it("should return the package result without appkChildren if appkParent is not present", async () => {
    const result = await getPackage(TEST_ITEM_ID);

    expect(result).not.toBeNull();
    expect(result).toEqual(items[TEST_ITEM_ID]);
    expect(result?._source).not.toHaveProperty("appkChildren");
  });

  it("should return the package result with appkChildren if appkParent is present", async () => {
    const result = await getPackage(INITIAL_RELEASE_APPK_ITEM_ID);

    expect(result).not.toBeNull();
    expect(result).toEqual(items[INITIAL_RELEASE_APPK_ITEM_ID]);
    expect(result?._source).toHaveProperty("appkChildren");
  });
});
