import { describe, expect, it } from "vitest";
import { itemExists } from "./itemExists";
import {
  TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  NOT_EXISTING_ITEM_ID,
  errorItemExistsHandler,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";

describe("itemExists test", () => {
  it("should return true if the item exists", async () => {
    const found = await itemExists(TEST_ITEM_ID);
    expect(found).toBeTruthy();
  });

  it("should return false if the item does not exist", async () => {
    const found = await itemExists(NOT_EXISTING_ITEM_ID);
    expect(found).toBeFalsy();
  });

  it("should return false if the item is not found", async () => {
    const found = await itemExists(NOT_FOUND_ITEM_ID);
    expect(found).toBeFalsy();
  });

  it("should return false if there is an error getting the item", async () => {
    mockedServer.use(errorItemExistsHandler);

    const found = await itemExists(TEST_ITEM_ID);
    expect(found).toBeFalsy();
  });
});
