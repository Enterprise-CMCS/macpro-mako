// lib/libs/email/getAllStateUsers.test.ts
import { CognitoIdentityProviderClient, ListUsersCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

describe("getAllStateUsers", () => {
  let cognitoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    cognitoSpy = vi.spyOn(CognitoIdentityProviderClient.prototype, "send");
  });

  afterEach(() => {
    cognitoSpy.mockRestore();
  });

  it("should fetch and return state users successfully", async () => {
    const apiResponse: ListUsersCommandOutput = {
      Users: [
        {
          Attributes: [
            { Name: "email", Value: "multistate@example.com" },
            { Name: "given_name", Value: "Multi" },
            { Name: "family_name", Value: "State" },
            { Name: "custom:state", Value: "CA,AK" },
          ],
        },
        {
          Attributes: [
            { Name: "email", Value: "statesubmitter@nightwatch.test" },
            { Name: "given_name", Value: "State" },
            { Name: "family_name", Value: "Submitter Test" },
            { Name: "custom:state", Value: "CA" },
          ],
        },
        {
          Attributes: [
            { Name: "email", Value: "george@example.com" },
            { Name: "given_name", Value: "George" },
            { Name: "family_name", Value: "Harrison" },
            { Name: "custom:state", Value: "MA" },
          ],
        },
      ],
    };

    cognitoSpy.mockResolvedValueOnce(apiResponse);

    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    expect(cognitoSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        email: "multistate@example.com",
        firstName: "Multi",
        formattedEmailAddress: "Multi State <multistate@example.com>",
        lastName: "State",
      },
      {
        email: "statesubmitter@nightwatch.test",
        firstName: "State",
        formattedEmailAddress: "State Submitter Test <statesubmitter@nightwatch.test>",
        lastName: "Submitter Test",
      },
    ]);
  });

  it("should handle an error when fetching state users", async () => {
    cognitoSpy.mockRejectedValueOnce(new Error("network error"));

    await expect(
      getAllStateUsers({
        userPoolId: USER_POOL_ID,
        state: "CA",
      }),
    ).rejects.toThrow("Error fetching users");

    expect(cognitoSpy).toHaveBeenCalledTimes(1);
  });
});
