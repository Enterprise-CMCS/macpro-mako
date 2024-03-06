import { beforeAll, it, expect, vi, describe } from "vitest";
import * as unit from "./useGetUser";
import { Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";

/* When mocking the getItem and helper functions:
 * 1. Assign Auth.currentAuthenticatedUser to use mockCognito
 * 2. Assign Auth.userAttributes to use mockUserAttr
 */

const mockCurrentAuthenticatedUser = vi.fn((options = {}) => {
  return new Promise((resolve, reject) => {
    // You can decide how to use the options object, if needed, for your tests.
    // If you want to simulate an error, you could set a flag on `options` and check it here.
    if (options.error) {
      reject(
        new Error(
          "useGetUser > mockCurrentAuthenticatedUser: Expected error thrown by test.",
        ),
      );
    } else {
      resolve({ username: "0000aaaa-0000-00aa-0a0a-aaaaaa000000" });
    }
  });
});

const mockUserAttr = ({
  isCms,
  options,
}: {
  isCms?: boolean;
  options?: { error?: boolean; noRoles?: boolean };
}) =>
  vi.fn(async (user: CognitoUser) => {
    return await new Promise<Array<{ Name: string; Value: string }>>(
      (resolve) => {
        if (options?.error)
          throw Error(
            "useGetUser > mockUserAttr: Expected error thrown by test.",
          );
        /* This array of attributes is where we make changes to our test
         * user for test-related assertions. */
        return resolve([
          { Name: "sub", Value: "0000aaaa-0000-00aa-0a0a-aaaaaa000000" },
          { Name: "email_verified", Value: "true" },
          { Name: "given_name", Value: "George" },
          { Name: "family_name", Value: "Harrison" },
          {
            Name: "custom:state",
            Value: "VA,OH,SC,CO,GA,MD",
          },
          {
            Name: "email",
            Value: "george@example.com",
          },
          !options?.noRoles && {
            Name: "custom:cms-roles",
            Value: isCms ? "onemac-micro-reviewer" : "onemac-micro-cmsreview",
          },
        ] as Array<{ Name: string; Value: string }>);
      },
    );
  });

describe("getUser", () => {
  beforeAll(() => {
    Auth.currentAuthenticatedUser = mockCurrentAuthenticatedUser;
  });
  it("distinguishes CMS users with `isCms` property", async () => {
    // Auth.userAttributes doesn't like mockUserAttr, and the necessary
    // type is not exported for manual assertion.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Auth.userAttributes = mockUserAttr({ isCms: false });
    const stateUser = await unit.getUser();
    expect(stateUser.isCms).toBe(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Auth.userAttributes = mockUserAttr({ isCms: true });
    const cmsUser = await unit.getUser();
    expect(cmsUser.isCms).toBe(true);
  });
  it("returns an object of CognitoUserAttributes", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Auth.userAttributes = mockUserAttr({ isCms: false });
    const oneMacUser = await unit.getUser();
    expect(oneMacUser.user).toStrictEqual({
      sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
      email_verified: "true",
      email: "george@example.com",
      given_name: "George",
      family_name: "Harrison",
      "custom:state": "VA,OH,SC,CO,GA,MD",
      "custom:cms-roles": "onemac-micro-cmsreview",
      username: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
    });
  });
  it("handles a user with no 'custom:cms-roles'", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Auth.userAttributes = mockUserAttr({
      isCms: false,
      options: { noRoles: true },
    });
    const oneMacUser = await unit.getUser();
    expect(oneMacUser.user).toStrictEqual({
      sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
      email_verified: "true",
      email: "george@example.com",
      given_name: "George",
      family_name: "Harrison",
      "custom:state": "VA,OH,SC,CO,GA,MD",
      "custom:cms-roles": "",
      username: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
    });
  });
  it("handles and logs errors", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Auth.userAttributes = mockUserAttr({
      isCms: false,
      options: { error: true },
    });
    const spyLog = vi.spyOn(console, "log");
    const oneMacUser = await unit.getUser();
    expect(oneMacUser).toStrictEqual({ user: null });
    expect(spyLog).toHaveBeenCalled();
  });
});
