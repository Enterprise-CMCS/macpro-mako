import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import {
  emptyIdentityProviderServiceHandler,
  errorIdentityProviderServiceHandler,
  USER_POOL_ID,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

describe("getAllStateUsers", () => {
  vi.setConfig({ testTimeout: 15000 });
  it("should fetch users successfully", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" });
    expect(result).toEqual([
      {
        firstName: "Multi",
        lastName: "State",
        email: "multistate@example.com",
        formattedEmailAddress: "Multi State <multistate@example.com>",
      },
      {
        email: "statesubmitter@nightwatch.test",
        firstName: "State",
        formattedEmailAddress: "State Submitter Test <statesubmitter@nightwatch.test>",
        lastName: "Submitter Test",
      },
      {
        firstName: "George",
        lastName: "Harrison",
        email: "george@example.com",
        formattedEmailAddress: "George Harrison <george@example.com>",
      },
    ]);
  });

  it("should return an empty array when no users are found", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "MA" });
    expect(result).toEqual([]);
  });

  it("should ignore users with no email", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "AK" });
    expect(result).toEqual([]);
  });

  it("should ignore users with invalid email formats", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "LA" });
    expect(result).toEqual([]);
  });

  it("should handle fetching empty state users", async () => {
    mockedServer.use(emptyIdentityProviderServiceHandler);
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" });
    expect(result).toEqual([]);
  });

  it("should handle an error when fetching state users", async () => {
    mockedServer.use(errorIdentityProviderServiceHandler);
    const sendSpy = vi
      .spyOn(CognitoIdentityProviderClient.prototype, "send")
      .mockRejectedValueOnce(new Error("boom"));
    await expect(() =>
      getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" }),
    ).rejects.toThrowError("Error fetching users");
    sendSpy.mockRestore();
  });
});
