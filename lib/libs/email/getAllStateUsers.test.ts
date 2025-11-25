// lib/libs/email/getAllStateUsers.test.ts

import { errorIdentityProviderServiceHandler } from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { beforeEach, describe, expect, it } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

describe("getAllStateUsers", () => {
  beforeEach(() => {
    // reset MSW handlers back to their defaults between tests
    mockedServer.resetHandlers();
  });

  it("should fetch and return state users successfully", async () => {
    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    // This matches what your failure output showed
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
      {
        email: "george@example.com",
        firstName: "George",
        formattedEmailAddress: "George Harrison <george@example.com>",
        lastName: "Harrison",
      },
    ]);
  });

  it("should handle an error when fetching state users", async () => {
    // Swap the handler to the error case for this one test
    mockedServer.use(errorIdentityProviderServiceHandler);

    // ✅ IMPORTANT: pass the *promise* to `expect(...)`, not a function.
    await expect(getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" })).rejects.toThrow(
      "Error fetching users",
    );
  });
});
