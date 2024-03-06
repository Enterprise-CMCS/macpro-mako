import { beforeAll, it, expect, vi, describe } from "vitest";
import * as unit from "./useGetUser";
import { Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";

/* When mocking the getItem and helper functions:
 * 1. Assign Auth.currentAuthenticatedUser to use mockCognito
 * 2. Assign Auth.userAttributes to use mockUserAttr
 */

const mockCognito = vi.fn(async () => {
  /* The return value of this is an Object with a bunch of getter/updater methods, so
   * rather than mock _that_, we just mock the return of one of those methods with the
   * `mockUserAttr` func. This simply nullifies the Auth package from calling over the
   * line to AWS Cognito */
  return await new Promise((resolve) => resolve({} as Partial<CognitoUser>));
});

const mockUserAttr = ({ isCms, error }: { isCms?: boolean; error?: boolean }) =>
  vi.fn(async (user: CognitoUser) => {
    return await new Promise<Array<{ Name: string; Value: string }>>(
      (resolve) => {
        if (error)
          throw Error(
            "useGetUser > mockUserAttr: Expected error thrown by test."
          );
        /* This array of attributes is where we make changes to our test
         * user for test-related assertions. */
        return resolve([
          { Name: "sub", Value: "0000aaaa-0000-00aa-0a0a-aaaaaa000000" },
          {
            Name: "custom:cms-roles",
            Value: isCms ? "onemac-micro-reviewer" : "onemac-micro-cmsreview",
          },
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
        ] as Array<{ Name: string; Value: string }>);
      }
    );
  });

const mockCurrentAuthenticatedUser = vi.fn((options = {}) => {
  return new Promise((resolve, reject) => {
    // You can decide how to use the options object, if needed, for your tests.
    // If you want to simulate an error, you could set a flag on `options` and check it here.
    if (options.error) {
      reject(
        new Error(
          "useGetUser > mockCurrentAuthenticatedUser: Expected error thrown by test."
        )
      );
    } else {
      resolve({ username: "051ee598-f107-417b-af00-1dfe8bb6484c" });
    }
  });
});

describe("getUser", () => {
  beforeAll(() => {
    Auth.currentAuthenticatedUser = mockCognito;
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
      "custom:cms-roles": "onemac-micro-cmsreview",
      email_verified: "true",
      given_name: "George",
      family_name: "Harrison",
      "custom:state": "VA,OH,SC,CO,GA,MD",
      email: "george@example.com",
      username: "051ee598-f107-417b-af00-1dfe8bb6484c",
    });
  });
  it("handles and logs errors", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Auth.userAttributes = mockUserAttr({ isCms: false, error: true });
    const spyLog = vi.spyOn(console, "log");
    const oneMacUser = await unit.getUser();
    expect(oneMacUser).toStrictEqual({ user: null });
    expect(spyLog).toHaveBeenCalled();
  });
});
