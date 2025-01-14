import { describe, it, expect, vi } from "vitest";
import { Context } from "aws-lambda";
import { handler } from "./postAuth";
import { USER_POOL_ID } from "mocks";
import { getRequestContext } from "mocks";
const testStateIDMUserMissingIdentity = {
  sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
  "custom:cms-roles": "onemac-micro-statesubmitter",
  "custom:state": "VA,OH,SC,CO,GA,MD",
  email_verified: true,
  given_name: "State",
  family_name: "Person",
  username: "abcd",
  email: "stateperson@example.com",
};
const testStateIDMUser = {
  sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
  "custom:cms-roles": "onemac-micro-statesubmitter",
  "custom:state": "VA,OH,SC,CO,GA,MD",
  email_verified: true,
  given_name: "State",
  family_name: "Person",
  "custom:username": "fail",
  email: "stateperson@example.com",
  identities:
    '[{"dateCreated":"1709308952587","userId":"abc123","providerName":"IDM","providerType":"OIDC","issuer":null,"primary":"true"}]',
};
const testStateIDMUserGood = {
  sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
  "custom:cms-roles": "onemac-micro-statesubmitter",
  "custom:state": "VA,OH,SC,CO,GA,MD",
  email_verified: true,
  given_name: "State",
  family_name: "Person",
  "custom:username": "abcd",
  email: "stateperson@example.com",
  identities:
    '[{"dateCreated":"1709308952587","userId":"abc123","providerName":"IDM","providerType":"OIDC","issuer":null,"primary":"true"}]',
};
const callback = vi.fn();
describe("process emails Handler", () => {
  //   it("should return 200 with a proper email", async () => {
  //     delete process.env.idmAuthzApiKeyArn;

  //     // const x = await handler({ test: "hello" }, {} as Context, callback);

  //     await expect(handler({ test: "test" }, {} as Context, callback)).rejects.toThrowError(
  //       "ERROR: process.env.idmAuthzApiKeyArn is required",
  //     );
  //   });
  //   it("should return 200 with a proper email", async () => {
  //     delete process.env.idmAuthzApiEndpoint;
  //     await expect(handler({ test: "test" }, {} as Context, callback)).rejects.toThrowError(
  //       "ERROR: process.env.idmAuthzApiEndpoint is required",
  //     );
  //   });
  //   it("should return 200 with a proper email", async () => {
  //     process.env.idmAuthzApiKeyArn = "bad-ARN";
  //     await expect(handler({ test: "test" }, {} as Context, callback)).rejects.toThrowError(
  //       "Failed to fetch secret bad-ARN: Secret bad-ARN has no SecretString field present in response",
  //     );
  //   });

  //   it("should return the request if it is missing an identity", async () => {
  //     const missingIdentity = await handler(
  //       {
  //         request: {
  //           userAttributes: testStateIDMUserMissingIdentity,
  //         },
  //       },
  //       {} as Context,
  //       callback,
  //     );

  //     expect(missingIdentity).toStrictEqual({
  //       request: {
  //         userAttributes: testStateIDMUserMissingIdentity,
  //       },
  //     });
  //   });
  //   it("should return the request if it is missing an identity", async () => {
  //     const x = vi.spyOn(console, "error");
  //     const missingIdentity = await handler(
  //       {
  //         request: {
  //           userAttributes: testStateIDMUser,
  //         },
  //       },
  //       {} as Context,
  //       callback,
  //     );
  //     const error = new Error("Network response was not ok. Response was 401: Unauthorized");
  //     expect(x).toHaveBeenCalledWith("Error performing post auth:", error);
  //     expect(x).toBeCalledTimes(1);
  //     expect(missingIdentity).toStrictEqual({
  //       request: {
  //         userAttributes: testStateIDMUser,
  //       },
  //     });
  //   });
  it("should work", async () => {
    // const x = vi.spyOn(console, "error");
    const missingIdentity = await handler(
      {
        request: {
          userAttributes: testStateIDMUserGood,
        },
        userName: "x",
        userPoolId: "x",
      },
      {} as Context,
      callback,
    );
    expect(missingIdentity).toStrictEqual({
      request: {
        userAttributes: testStateIDMUserGood,
      },
      userName: "x",
      userPoolId: "x",
    });
  });
});
