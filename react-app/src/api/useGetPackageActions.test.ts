import {
  coStateSubmitter,
  errorApiPackageActionsHandler,
  helpDeskUser,
  NOT_EXISTING_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  setDefaultStateSubmitter,
  setMockUsername,
  TEST_SPA_ITEM_ID,
  WITHDRAW_RAI_ITEM_C,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { Action } from "shared-types";
import { afterEach, describe, expect, it } from "vitest";

import { getPackageActions } from "./useGetPackageActions";

describe("getPackageActions test", () => {
  afterEach(() => {
    setDefaultStateSubmitter();
  });

  it("should return actions for valid package", async () => {
    const actions = await getPackageActions(WITHDRAW_RAI_ITEM_C);
    expect(actions).toEqual({
      actions: [Action.RESPOND_TO_RAI, Action.WITHDRAW_PACKAGE],
    });
  });

  it("should return empty actions for package without actions", async () => {
    const actions = await getPackageActions(TEST_SPA_ITEM_ID);
    expect(actions).toEqual({
      actions: [],
    });
  });

  it("should return 400 if there is no package id", async () => {
    await expect(() => getPackageActions(null)).rejects.toThrowError(
      "Request failed with status code 400",
    );
  });

  it("should return 404 if the package is not found", async () => {
    await expect(() => getPackageActions(NOT_FOUND_ITEM_ID)).rejects.toThrowError(
      "Request failed with status code 404",
    );
  });

  it("should return 404 if the package does not exist", async () => {
    await expect(() => getPackageActions(NOT_EXISTING_ITEM_ID)).rejects.toThrowError(
      "Request failed with status code 404",
    );
  });

  it("should return 401 if the user is not a state submitter or cms writer", async () => {
    setMockUsername(helpDeskUser);

    await expect(() => getPackageActions(WITHDRAW_RAI_ITEM_C)).rejects.toThrowError(
      "Request failed with status code 401",
    );
  });

  it("should return 401 if the user is not a user for the state", async () => {
    setMockUsername(coStateSubmitter);

    await expect(() => getPackageActions(WITHDRAW_RAI_ITEM_C)).rejects.toThrowError(
      "Request failed with status code 401",
    );
  });

  it("should return 500 if there is a server error", async () => {
    mockedServer.use(errorApiPackageActionsHandler);

    await expect(() => getPackageActions(WITHDRAW_RAI_ITEM_C)).rejects.toThrowError(
      "Request failed with status code 500",
    );
  });
});
