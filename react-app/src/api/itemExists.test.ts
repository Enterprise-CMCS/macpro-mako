import {
  errorApiItemExistsHandler,
  NOT_EXISTING_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  TEST_ITEM_ID,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { itemExists } from "./itemExists";
vi.mock("@/utils/ReactGA/SendGAEvent", () => {
  return {
    sendGAEvent: vi.fn(),
  };
});

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
    mockedServer.use(errorApiItemExistsHandler);

    const found = await itemExists(TEST_ITEM_ID);
    expect(found).toBeFalsy();
  });

  it("should return false and send GA event if there is an error getting the item", async () => {
    mockedServer.use(errorApiItemExistsHandler);

    const found = await itemExists(TEST_ITEM_ID);
    expect(found).toBeFalsy();

    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_errror",
      expect.objectContaining({
        error: "failure /itemExists",
      }),
    );
  });
});
