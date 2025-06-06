import {
  errorApiGetApproversHandler,
  errorApiUserProfileHandler,
  makoStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { getUserProfile } from "./useGetUserProfile";

describe("getUserProfile", () => {
  it("should return a user profile with approvers attached", async () => {
    setMockUsername(makoStateSubmitter);
    const result = await getUserProfile("statesubmitter@nightwatch.test");
    console.log("ANDIE - restult", result);
    expect(result.stateAccess.length).toEqual(23);
  });

  it("should return an empty object if /getUserProfile fails", async () => {
    mockedServer.use(errorApiUserProfileHandler);

    const result = await getUserProfile("statesubmitter@nightwatch.test");
    expect(result).toEqual({});
  });

  it("should return an empty object if /getApprovers fails", async () => {
    mockedServer.use(errorApiGetApproversHandler);

    const result = await getUserProfile("statesubmitter@nightwatch.test");

    expect(result).toEqual({});
  });

  it("should work without passing a userEmail", async () => {
    const result = await getUserProfile();
    expect(result.stateAccess).toBeDefined();
  });
});
