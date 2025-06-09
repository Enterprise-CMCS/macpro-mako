import { errorApiGetApproversHandler, errorApiUserProfileHandler } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { getUserProfile } from "./useGetUserProfile";

describe("getUserProfile", () => {
  it("should return a user profile with approvers attached", async () => {
    const result = await getUserProfile("statesubmitter@nightwatch.test");
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

  it("should attach approvers to stateAccess items and include approvers for MD", async () => {
    const result = await getUserProfile("statesubmitter@nightwatch.test");

    expect(result.stateAccess).toBeDefined();
    expect(result.stateAccess.length).toBeGreaterThan(0);

    for (const item of result.stateAccess) {
      expect(item).toHaveProperty("approverList");
      expect(Array.isArray(item.approverList)).toBe(true);
    }

    const mdEntry = result.stateAccess.find((entry) => entry.territory === "MD");
    expect(mdEntry).toBeDefined();
    expect(mdEntry?.approverList?.length).toBeGreaterThan(0);

    expect(mdEntry?.approverList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "statesystemadmin@nightwatch.test",
        }),
      ]),
    );
  });
});
