import { describe, it, expect, vi, afterAll } from "vitest";
import { Context } from "aws-lambda";
import { handler } from "./postAuth";
import {
  makoStateSubmitter,
  setMockUsername,
  superUser,
  TEST_IDM_USERS,
  USER_POOL_ID,
} from "mocks";

const callback = vi.fn();
describe("process emails Handler", () => {
  afterAll(() => {
    setMockUsername(makoStateSubmitter);
  });
  it("should return 200 with a proper email", async () => {
    delete process.env.idmAuthzApiKeyArn;

    await expect(handler({ test: "test" }, {} as Context, callback)).rejects.toThrowError(
      "ERROR: process.env.idmAuthzApiKeyArn is required",
    );
  });
  it("should return 200 with a proper email", async () => {
    delete process.env.idmAuthzApiEndpoint;
    await expect(handler({ test: "test" }, {} as Context, callback)).rejects.toThrowError(
      "ERROR: process.env.idmAuthzApiEndpoint is required",
    );
  });
  it("should return 200 with a proper email", async () => {
    process.env.idmAuthzApiKeyArn = "bad-ARN"; // pragma: allowlist secret
    await expect(handler({ test: "test" }, {} as Context, callback)).rejects.toThrowError(
      "Failed to fetch secret bad-ARN: Secret bad-ARN has no SecretString field present in response",
    );
  });

  it("should return the request if it is missing an identity", async () => {
    const missingIdentity = await handler(
      {
        request: {
          userAttributes: TEST_IDM_USERS.testStateIDMUserMissingIdentity,
        },
      },
      {} as Context,
      callback,
    );

    expect(missingIdentity).toStrictEqual({
      request: {
        userAttributes: TEST_IDM_USERS.testStateIDMUserMissingIdentity,
      },
    });
  });
  it("should be unauthorized and return an error", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const missingIdentity = await handler(
      {
        request: {
          userAttributes: TEST_IDM_USERS.testStateIDMUser,
        },
      },
      {} as Context,
      callback,
    );
    const error = new Error("Network response was not ok. Response was 401: Unauthorized");
    expect(errorSpy).toHaveBeenCalledWith("Error performing post auth:", error);
    expect(errorSpy).toBeCalledTimes(1);
    expect(missingIdentity).toStrictEqual({
      request: {
        userAttributes: TEST_IDM_USERS.testStateIDMUser,
      },
    });
  });
  it("A user gets updated properly", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const validUser = await handler(
      {
        request: {
          userAttributes: TEST_IDM_USERS.testStateIDMUserGood,
        },
        userName: superUser.Username,
        userPoolId: USER_POOL_ID,
      },
      {} as Context,
      callback,
    );
    expect(consoleSpy).toBeCalledWith(
      `Attributes for user ${superUser.Username} updated successfully.`,
    );
    expect(validUser).toStrictEqual({
      request: {
        userAttributes: TEST_IDM_USERS.testStateIDMUserGood,
      },
      userName: superUser.Username,
      userPoolId: USER_POOL_ID,
    });
  });
});
