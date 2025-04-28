import { USER_POOL_ID } from "mocks";
import { describe, expect, it } from "vitest";

import { getAllStateUsers } from "./getAllStateUsers";

describe("getAllStateUsers", () => {
  it("should fetch users successfully", async () => {
    const result = await getAllStateUsers({ userPoolId: USER_POOL_ID, state: "CA" });
    expect(result).toEqual([
      {
        firstName: "George",
        lastName: "Harrison",
        email: "george@example.com",
        formattedEmailAddress: "George Harrison <george@example.com>",
      },
      {
        firstName: "Multi",
        lastName: "State",
        email: "multistate@example.com",
        formattedEmailAddress: "Multi State <multistate@example.com>",
      },
      {
        firstName: "Otto",
        lastName: "State",
        email: "automated-state@example.com",
        formattedEmailAddress: "Otto State <automated-state@example.com>",
      },
      {
        email: "statesubmitter@nightwatch.test",
        firstName: "State",
        formattedEmailAddress: "State Submitter Test <statesubmitter@nightwatch.test>",
        lastName: "Submitter Test",
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
});
