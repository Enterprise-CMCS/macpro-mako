// lib/libs/email/getAllStateUsers.test.ts
// These imports should match whatever you had before for MSW.
// If they live in a different module, just adjust this line.
import { errorIdentityProviderServiceHandler, mockedServer } from "mocks";
import { beforeEach, describe, expect, it } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

const USER_POOL_ID = "test-user-pool-id";

describe("getAllStateUsers", () => {
  beforeEach(() => {
    // Make sure MSW is reset to its default handlers between tests
    if (typeof mockedServer.resetHandlers === "function") {
      mockedServer.resetHandlers();
    }
  });

  it("should fetch and return state users successfully", async () => {
    const result = await getAllStateUsers({
      userPoolId: USER_POOL_ID,
      state: "CA",
    });

    // This matches the fixture you've been seeing in the logs
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
    // Swap in the error MSW handler for this test
    mockedServer.use(errorIdentityProviderServiceHandler);

    // IMPORTANT: pass the Promise directly to expect(...), not a function.
    await expect(getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" })).rejects.toThrow(
      "Error fetching users",
    );
  });
});
